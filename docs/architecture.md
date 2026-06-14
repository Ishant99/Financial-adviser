# Architecture — Personal AI Financial Advisor (FinAdvisor)

## Overview

FinAdvisor is a single-user personal CFO application. The system is composed of three tiers:

1. **Next.js 16 web frontend** — dark-themed dashboard, App Router, TanStack Query, Tailwind CSS v4.
2. **.NET 10 API** — Clean Architecture, CQRS-lite (no MediatR), EF Core + PostgreSQL, Serilog structured logging.
3. **Python FastAPI analytics service** — CAS PDF parsing, Monte Carlo simulation, XIRR computation, AI-powered recommendations and monthly plan via Anthropic Claude.

---

## System Diagram

```
┌────────────────────────────────────────────────────────────┐
│                     Browser (Next.js 16)                   │
│  Dashboard · Holdings · Goals · SIPs · Cash Flow · Tax     │
│  Monthly Plan · Portfolio Analytics · Upload · Recommend.  │
└───────────────────────────┬────────────────────────────────┘
                            │ HTTP (Axios, TanStack Query)
                            ▼
┌────────────────────────────────────────────────────────────┐
│               .NET 10 API  (port 5000 / 8080)              │
│                                                            │
│  Controllers ──► Query/Command Handlers ──► Repositories  │
│                                                            │
│  Background Services (PeriodicTimer):                      │
│    GoalProbabilityBackgroundService  (daily)               │
│    XirrBackgroundService             (daily)               │
│                                                            │
│  Polly resilience pipeline (retry + circuit-breaker        │
│  + timeout) on all analytics service calls                 │
└───────────┬──────────────────┬─────────────────────────────┘
            │ EF Core          │ HttpClient (snake_case JSON)
            ▼                  ▼
  ┌──────────────────┐  ┌─────────────────────────────────────┐
  │  PostgreSQL 16   │  │     Python FastAPI (port 8000)       │
  │                  │  │                                      │
  │  FinAdvisorDb    │  │  /health                             │
  │  (Docker volume) │  │  /cas/parse          (casparser)     │
  │                  │  │  /recommendations/generate  (Claude) │
  │                  │  │  /simulation/simulate-goal  (NumPy)  │
  │                  │  │  /xirr/compute       (Newton-Raphson)│
  │                  │  │  /plan/generate      (Claude)        │
  └──────────────────┘  └────────────────┬─────────────────────┘
                                         │ Anthropic SDK
                                         ▼
                               ┌───────────────────┐
                               │  Anthropic Claude  │
                               │  claude-haiku-4-5  │
                               │  (tool_use mode)   │
                               └───────────────────┘
```

---

## Layer Responsibilities

### Domain (`FinAdvisor.Domain`)
- Entities: `Account`, `Holding`, `Transaction`, `Goal`, `SipPlan`, `RecommendationLog`, `CasUploadLog`, `UserProfile`
- Value Objects: `Money`, `DateRange`, `AssetAllocation`, `Xirr`
- Domain Services: `NetWorthCalculator`, `MonthlySurplusCalculator`
- Enums: `AccountType`, `HoldingType`, `TransactionType`, `GoalStatus`, `SipStatus`, `RecommendationType`, `RecommendationSeverity`
- **Zero NuGet dependencies** — pure C# only.

### Application (`FinAdvisor.Application`)
- Repository interfaces: `IRepository<T>`, `IAccountRepository`, `IHoldingRepository`, `ITransactionRepository`, `IGoalRepository`, `ISipPlanRepository`, `IRecommendationRepository`
- Analytics service interface: `IAnalyticsService`
- Query handlers: `GetNetWorthQueryHandler`, `GetHoldingsQueryHandler`, `GetGoalsQueryHandler`, `GetTransactionsQueryHandler`, `GetSipPlansQueryHandler`, `GetAccountsQueryHandler`, `GetRecommendationsQueryHandler`, `GetCashFlowQueryHandler`, `GetTaxSummaryQueryHandler`, `GetPortfolioAnalyticsQueryHandler`
- Command handlers: `AddHoldingCommandHandler`, `UpdateHoldingCommandHandler`, `DeleteHoldingCommandHandler`, `AddGoalCommandHandler`, `UpdateGoalCommandHandler`, `PauseResumeGoalCommandHandler`, `AddTransactionCommandHandler`, `AddSipPlanCommandHandler`, `PauseResumeSipPlanCommandHandler`, `ImportCasHoldingsCommandHandler`, `GenerateRecommendationsCommandHandler`, `RecalculateGoalProbabilityCommandHandler`, `ComputeSipXirrCommandHandler`, `GenerateMonthlyPlanCommandHandler`
- DTOs for every feature domain
- FluentValidation validators
- **No EF Core or ILogger references** — Application layer stays infrastructure-agnostic.

### Infrastructure (`FinAdvisor.Infrastructure`)
- `AppDbContext` (EF Core 10 + Npgsql)
- EF Core entity configurations (separate files, no data annotations on entities)
- Repository implementations: `EfRepository<T>` base + 6 concrete repos
- `AnalyticsServiceClient` — typed `HttpClient` with Polly resilience (retry × 3, circuit-breaker, 30s timeout), `X-Correlation-ID` header, snake_case JSON serialisation
- Background services: `GoalProbabilityBackgroundService`, `XirrBackgroundService` (both use `IServiceScopeFactory` for scoped repo access)
- `ServiceCollectionExtensions.AddInfrastructure()` — single extension method registers everything

### API (`FinAdvisor.Api`)
- Controllers: `NetWorthController`, `AccountsController`, `HoldingsController`, `TransactionsController`, `GoalsController`, `SipPlansController`, `RecommendationsController`, `UploadController`, `PlanController`, `CashFlowController`, `TaxController`, `PortfolioAnalyticsController`
- CORS policy for Next.js dev server (`localhost:3000`)
- Global JSON options: camelCase properties, string enum converter, null-value omission
- `DevSeedData` — deterministic seed data in Development environment
- `HealthCheckResponseWriter` — custom JSON format for `/api/health`

---

## Key Design Decisions

### 1. CQRS-lite without MediatR
Handlers are plain C# classes injected directly into controllers. No pipeline, no behaviours, no mediator overhead. The project is single-user and doesn't need the indirection MediatR provides for cross-cutting concerns at this scale.

### 2. AI produces narratives; rules engine produces numbers
All figures in AI-generated content (recommendations, monthly plan) come from the application layer. The prompt explicitly includes all portfolio figures and instructs the model: "Use ONLY figures present in the data. Do NOT invent any numbers." Claude uses `tool_use` with a typed schema, preventing free-form number hallucination.

### 3. Python for analytics; .NET for business logic
Numerically intensive work (Monte Carlo, XIRR via Newton-Raphson, CAS PDF parsing with `casparser`) lives in Python where the ecosystem is stronger. The .NET API owns the domain model and orchestration. The two communicate over HTTP; the interface boundary is `IAnalyticsService`.

### 4. PeriodicTimer over Hangfire
Background jobs (daily goal probability recalculation, daily XIRR computation) use `BackgroundService` + `PeriodicTimer`. Built into .NET, zero additional dependencies, runs in-process. Hangfire adds a persistent job store and dashboard — valuable at team scale, unnecessary for a single-user app.

### 5. IServiceScopeFactory in background services
Background services are singletons. Repositories are scoped. To avoid captive-dependency errors, each background service creates a fresh `IServiceScope` per run using `IServiceScopeFactory`, resolves repositories within that scope, and disposes the scope when done.

### 6. X-Correlation-ID for distributed tracing
Every HTTP call from the .NET API to the Python analytics service includes an `X-Correlation-ID` header populated from `Activity.Current?.TraceId`. This allows correlation of .NET request logs with Python service logs in production.

---

## Data Model (key tables)

| Table | Description |
|---|---|
| `Accounts` | Bank accounts, demat accounts, wallets |
| `Holdings` | Current portfolio positions (units × NAV) |
| `Transactions` | All income and expense transactions |
| `Goals` | Financial goals with target amount, date, asset allocation, Monte Carlo outputs |
| `SipPlans` | Active/paused SIP plans with XIRR computed daily |
| `RecommendationLogs` | AI-generated recommendations with read/actioned status |
| `CasUploadLogs` | CAS import history with success/failure status |
| `UserProfiles` | Single row for the user profile |

---

## Environment Variables

| Variable | Service | Purpose |
|---|---|---|
| `ConnectionStrings__Default` | .NET API | PostgreSQL connection string |
| `AnalyticsService__BaseUrl` | .NET API | URL of the Python analytics service |
| `ANTHROPIC_API_KEY` | Python service | Anthropic API key for Claude |
| `NEXT_PUBLIC_API_URL` | Next.js | URL of the .NET API |

---

## Running Locally

```bash
# Start Postgres and analytics service
docker compose up -d postgres analytics

# Run .NET API
cd FinAdvisor
dotnet run --project src/FinAdvisor.Api

# Run Next.js dev server
cd src/web
npm run dev
```

Or run everything via Docker:
```bash
docker compose up --build
```

---

## Running Tests

```bash
# .NET tests
cd FinAdvisor
dotnet test

# Python tests
cd src/analytics-service
pip install -e ".[dev]"
pytest -v
```
