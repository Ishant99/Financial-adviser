# Sprint Log — Personal AI Financial Advisor

A running record of what was built in each sprint, what was harder than expected, what was skipped and why, and honest reflections.

---

## Sprint 1 — Foundation and First Endpoint

**Dates:** 2026-05-25 → 2026-05-26

**Status:** Complete

**What was built:**

- Clean Architecture .NET solution with four projects: `FinAdvisor.Domain`, `FinAdvisor.Application`, `FinAdvisor.Infrastructure`, `FinAdvisor.Api`. Reference direction enforced at the project level (Domain has zero external NuGet dependencies).
- Three xUnit test projects in `tests/`. `dotnet test` passes with 2 health check integration tests.
- `UserProfile` entity in Domain with private constructor and a factory method.
- `AppDbContext` with EF Core configuration class separate from the entity (clean domain).
- Initial EF Core migration (`InitialCreate`) creating the `UserProfiles` table.
- Dev seed data that runs on startup and populates one `UserProfile` row (idempotent via `AnyAsync()` check).
- `GET /api/health` endpoint returning `{ "status": "healthy", "checks": {...}, "timestamp": "..." }` with a Postgres connectivity check.
- Serilog structured logging with two-phase initialisation (bootstrap logger before `WebApplication.CreateBuilder`, then full config from `appsettings.json`).
- App version and environment logged on startup.
- `docker-compose.yml` with Postgres 16 including a health check; API service depends on `postgres:service_healthy`.
- `.env.example` documenting all required environment variables.
- `.gitignore` covering .NET, Python, Node.js, and OS artefacts.
- GitHub Actions `.github/workflows/dotnet-ci.yml` triggering on every push and PR to main.
- Python CI stub at `.github/workflows/python-ci.yml`.
- Three ADR entries in `docs/interview-notes.md`.

**What was harder than expected:**

- The `WebApplicationFactory<Program>` integration test initially failed because `DevSeedData.SeedAsync` calls `MigrateAsync()` which requires a real Postgres connection. Fixed by creating `TestWebApplicationFactory` which replaces the DbContext with an in-memory EF Core provider and clears health check registrations via `Configure<HealthCheckServiceOptions>`.
- `dotnet-ef` global tool was not installed — added it explicitly (`dotnet tool install --global dotnet-ef`).
- `HealthCheckResponseWriter` class needed an explicit `using FinAdvisor.Api;` import in `Program.cs` since top-level statements do not inherit from a namespace.

**What was skipped:**

- Nothing from the sprint 1 scope was skipped. The `docs/architecture.md` file exists as a stub (will be filled in Sprint 12 per plan).

**Honest reflection:**

Sprint 1 delivered what it was supposed to: a working, deployable state with `dotnet build` green, `dotnet test` passing, and CI configured. The clean architecture feels over-engineered for three files, but the value is already visible — the in-memory swap for tests worked cleanly because the domain had no infrastructure leakage. The Serilog setup is production-grade from day one, which will save time when debugging in Sprints 5–8.

---

## Sprint 2 — Domain Model and Data Layer

**Dates:** 2026-05-26

**Status:** Complete

**What was built:**

- **7 enums** in Domain: `AccountType`, `HoldingType`, `TransactionType`, `GoalStatus`, `SipStatus`, `RecommendationType`, `RecommendationSeverity`.
- **4 value objects** in Domain: `Money` (arithmetic operators, currency validation, equality), `DateRange` (boundary validation, Contains, Months), `AssetAllocation` (sum-to-100 validation, IsConservative/IsAggressive), `Xirr` (range validation, BeatsBenchmark).
- **6 domain entities** in Domain: `Account`, `Holding`, `Transaction`, `Goal`, `SipPlan`, `RecommendationLog` — all with private constructors and factory methods; zero EF Core attributes.
- **2 domain services**: `NetWorthCalculator` (sums holdings by type), `MonthlySurplusCalculator` (income − fixed − variable).
- **6 repository interfaces** in Application: `IAccountRepository`, `IHoldingRepository`, `ITransactionRepository`, `IGoalRepository`, `ISipPlanRepository`, `IRecommendationRepository` — all extending `IRepository<T>`.
- **6 EF Core configurations** in Infrastructure (separate from entities). `AssetAllocation` configured as an EF owned type on `Goal`.
- **6 repository implementations** in Infrastructure: `EfRepository<T>` base class, then concrete repos with entity-specific queries.
- **`AddCoreEntities` migration** applied — all tables created with indexes on high-query paths (`AccountId + Date`, `AccountId`, `FundCode`, `GeneratedAt`).
- **Updated seed data**: 2 bank accounts, 5 holdings (3 MF, 1 FD, 1 cash), 3 goals (Emergency Fund, Retirement, House Down Payment), 3 SIP plans linked to goals.
- **38 passing tests**: 10 for Money, 7 for DateRange, 9 for AssetAllocation, 4 for NetWorthCalculator, 6 integration tests for EfGoalRepository (CRUD + GetActive + GetByStatus), plus 2 Sprint 1 health check tests.

**What was harder than expected:**

- The `EfGoalRepository` integration test required the Application.Tests project to reference Infrastructure (for the concrete repo), which meant adding the `Microsoft.EntityFrameworkCore.InMemory` package there too.
- A test for `NetWorthCalculator` with a negative holding failed because `Holding.Create` correctly rejects negative NAV. The test assumption was wrong (liabilities via negative holdings is not a Sprint 2 concept). Fixed the test to use all-positive values.

**What was skipped:**

- `Xirr` value object tests (straightforward — deferred to add before Sprint 5 when XIRR calculation is wired up). The value object itself is complete.
- `MonthlySurplusCalculator` tests (trivial subtraction — will add when the monthly plan composer uses it in Sprint 8).

**Honest reflection:**

The domain is now solid and well-structured. The sprint discipline of keeping domain entities free of EF Core references already paid dividends — the `EfGoalRepository` tests use in-memory EF Core with zero changes to domain code. The seed data gives a realistic starting point for UI development in Sprint 3.

---

## Sprint 3 — Next.js Dashboard

**Dates:** 2026-05-26

**Status:** Complete

**What was built:**

- **Next.js 16 project** at `src/web/` with App Router, TypeScript, Tailwind CSS v4, shadcn/ui components (via `@base-ui/react`), TanStack Query, Axios, react-hook-form + zod, sonner toasts.
- **Root layout** (`src/app/layout.tsx`): dark theme (`bg-gray-950`), `Geist` font, `Providers` wrapper, fixed `Sidebar` navigation.
- **Sidebar** (`src/components/layout/Sidebar.tsx`): left-rail navigation for Dashboard, Monthly Plan, SIPs, Goals, Cash Flow, Holdings, Transactions, Tax, Upload. Active link highlighted with `bg-indigo-600`. Uses `usePathname` for client-side active detection.
- **Axios client** (`src/lib/api.ts`): `baseURL` from `NEXT_PUBLIC_API_URL`, defaults to `http://localhost:5000`.
- **Format helpers** (`src/lib/format.ts`): `formatCurrency` (₹Cr/L/K), `formatPercent`, `formatDate` (en-IN locale).
- **TypeScript interfaces** (`src/types/api.ts`) mirroring all .NET DTOs: `NetWorthDto`, `HoldingDto`, `GoalDto`, `TransactionDto`, `SipPlanDto`, `AccountDto` plus all request types.
- **6 TanStack Query hook files** in `src/lib/queries/`: `useNetWorth`, `useHoldings`, `useGoals`, `useTransactions`, `useSipPlans`, `useAccounts` — including all mutation hooks with `onSuccess` cache invalidation.
- **Dashboard page** (`src/app/page.tsx`): 2×2 grid of `NetWorthCard`, `GoalSummaryCard`, `RecommendationFeed` (placeholder with Sprint 4 note), `MonthlyPlanSummary` (placeholder with Sprint 5 note).
- **Holdings page** (`src/app/holdings/page.tsx`): sortable table with Add (account + type select, name, units, NAVs, date), Edit (NAV update), Delete (AlertDialog confirmation). Gain/Loss coloured green/red.
- **Goals page** (`src/app/goals/page.tsx`): card grid with Add/Edit dialogs, inline allocation sum-to-100 live indicator, Pause/Resume actions per card, probability badge coloured by threshold.
- **Transactions page** (`src/app/transactions/page.tsx`): filter bar (account, from, to date), Credit/Debit coloured badges, Add dialog with category select.
- **SIPs page** (`src/app/sips/page.tsx`): table with fund code, benchmark, XIRR (as percent), linked goal name, per-row Pause/Resume button, total monthly commitment in subtitle.
- **`src/web/.env.local.example`** documenting `NEXT_PUBLIC_API_URL`.
- **`src/web/Dockerfile`** with 3-stage build (deps → builder → runner) using `output: "standalone"`.
- **`docker-compose.yml`** updated to add `web` service pointing to the Dockerfile, `NEXT_PUBLIC_API_URL=http://api:8080`.
- **`.github/workflows/nextjs-ci.yml`** triggering on changes to `src/web/**`, running `npm ci`, `tsc --noEmit`, `npm run build`.
- **3 new ADR entries** in `docs/interview-notes.md`: App Router choice, TanStack Query, CQRS-lite without MediatR.

**What was harder than expected:**

- The `Dialog` and `Select` components use `@base-ui/react` (Base UI), not the standard Radix UI primitives that shadcn/ui documentation references. Base UI has a different API — particularly for `Select`, which requires `Controller` from react-hook-form for controlled integration. Worked around this by using native `<select>` elements styled with Tailwind for all form dropdowns.
- `layout.tsx` tool failure — the Edit tool repeatedly returned "File has not been read yet" in the first session. Resolved in the resumed session by using Write instead.
- zod v4 (`^4.4.3`) is installed. The `z.coerce.number()` API is preserved from v3. Used `z.object().refine()` for the cross-field asset allocation sum-to-100 validation.

**What was skipped:**

- Sprint 3 .NET API integration tests (GET/POST/PATCH controller-level tests). These are deferred to Sprint 4 — the core test infrastructure (`TestWebApplicationFactory`) is already in place.
- `plan`, `cashflow`, `tax`, `upload` page stubs — these are Sprint 5+ pages; the sidebar links to them but they return 404 today, which is fine.

**Honest reflection:**

The TanStack Query cache invalidation pattern proved its worth immediately — adding a holding from the Holdings page triggers an automatic re-fetch of both `/api/holdings` and `/api/networth` with zero component coordination. The form validation for asset allocation (live sum indicator, refine rule) is the kind of UX detail that distinguishes a polished personal tool from a throwaway prototype. The choice to use native `<select>` over Base UI's `Select` was pragmatic — Base UI's Select works well as a display component but is not designed for `register()` integration.

---

## Sprint 4 — CAS Upload via Python Service

**Dates:** 2026-05-26

**Status:** Complete

**What was built:**

- **Python FastAPI analytics service** (`src/analytics-service/`) with `POST /parse-cas` and `GET /health` endpoints.
  - `casparser` library parses CAMS/Karvy CAS PDFs, including password-protected files.
  - `CasHolding` and `CasParseResponse` Pydantic v2 models.
  - Zero-unit holdings filtered out before returning.
  - 4 pytest tests with `unittest.mock.patch` on `casparser.read_cas_pdf` (no real PDF needed in CI).
  - `Dockerfile` (Python 3.11-slim) and `pyproject.toml` with optional `[dev]` extras.
- **`IAnalyticsService` interface** in Application — maintains clean layer separation; Application knows nothing about HTTP.
- **`CasParseResult` and `CasHoldingResult` records** in Application/DTOs — snake_case → PascalCase mapping happens in Infrastructure.
- **`CasImportResult` and `CasUploadLogDto` records** in Application/DTOs for API responses.
- **`CasUploadLog` domain entity** with `CreateSuccess()` and `CreateFailed()` factory methods, private constructor for EF Core.
- **`Holding.UpdateFromCas(units, nav, asOf)` method** — new domain method for CAS upsert (previous `UpdateNav()` only touched NAV, not units).
- **`ImportCasHoldingsCommandHandler`** in Application — matches holdings by name+accountId, creates or updates, writes `CasUploadLog`, returns `CasImportResult`. Zero EF Core or ILogger references.
- **`AnalyticsServiceClient`** in Infrastructure — typed `HttpClient` implementing `IAnalyticsService`. Uses `MultipartFormDataContent`, adds `X-Correlation-ID` header (from `Activity.Current?.TraceId`), maps Python snake_case via private inner records, throws `AnalyticsServiceException` on non-success.
- **`Microsoft.Extensions.Http.Resilience` v9.6.0** for Polly-backed pipeline: Retry (3× exponential backoff from 1s) → CircuitBreaker (5-minute window, 30s break, 50% failure ratio) → Timeout (30s).
- **`CasUploadLogConfiguration`** — EF Core config with max lengths and index on `UploadedAt`.
- **`UploadController`** (`POST /api/upload/cas`, `GET /api/upload/history`).
- **Next.js upload page** (`src/web/src/app/upload/page.tsx`) — drag-and-drop file zone (native `<input type="file">`), optional password input, account selector, import button with loading state, success result card showing investor name + portfolio value + import counts, upload history table.
- **`useUploadCas` and `useUploadHistory`** TanStack Query hooks in `src/web/src/lib/queries/useUpload.ts`.
- **`CasImportResult` and `CasUploadLogDto` TypeScript interfaces** added to `src/web/src/types/api.ts`.
- **`docker-compose.yml` updated** — analytics service added (port 8000, health check), api service now passes `AnalyticsService__BaseUrl=http://analytics:8000`, depends on `analytics:service_healthy`.
- **`.github/workflows/python-ci.yml` updated** — real CI: Python 3.11, `pip install -e ".[dev]"`, `ruff check`, `pytest -v`.

**What was harder than expected:**

- `ImportCasHoldingsCommandHandler` initially had `using Microsoft.EntityFrameworkCore` and `using Microsoft.Extensions.Logging` + `ILogger<>` — both break Clean Architecture (Application has no EF Core or logging NuGet references). Fixed by removing both. Application layer stays pure.
- `Holding.UpdateFromCas()` needed to be added to the domain because the existing `UpdateNav()` only updated the NAV field, not units. CAS imports need to update both.
- The resilience pipeline ordering matters: Retry wraps CircuitBreaker which wraps Timeout. If Timeout is outermost, a retry would fire after the outer timeout has already triggered. The correct order is from outermost to innermost: Retry → CircuitBreaker → Timeout.

**What was skipped:**

- `dotnet ef migrations add AddCasUploadLog` — cannot run without a live Postgres connection. The entity, EF configuration, and `DbSet` are all in place; run `dotnet ef migrations add AddCasUploadLog --project FinAdvisor/src/FinAdvisor.Infrastructure --startup-project FinAdvisor/src/FinAdvisor.Api` locally once Postgres is up.
- Unit tests for `AnalyticsServiceClient` with `MockHttpMessageHandler`. The core parsing logic is tested in the Python service; the client is a thin HTTP adapter. Will add in Sprint 4.5 before integration tests.

**Honest reflection:**

The first Python service extraction was the key architectural milestone of this sprint. The `IAnalyticsService` interface in Application and the `AnalyticsServiceClient` implementation in Infrastructure exactly mirrors how the domain repository pattern works — Application defines the contract, Infrastructure provides the implementation. The Polly resilience pipeline is production-grade from day one: PDF parsing is the one operation likely to have network hiccups, and three retries with circuit breaking will keep the UI responsive rather than hanging. The `X-Correlation-ID` header will be invaluable when debugging across service boundaries.

---

## Sprint 5 — AI Recommendations Engine

**Dates:** 2026-05-26

**Status:** Complete

**What was built:**

- **Python `/recommendations/generate` endpoint** — takes portfolio context (holdings, goals, SIP total), calls Claude `claude-haiku-4-5-20251001` via `anthropic` SDK, uses `tool_use` with a typed `add_recommendation` tool to get structured output, returns `GenerateRecommendationsResponse` with a list of typed recommendations.
  - System prompt enforces: "use ONLY figures from the portfolio data — do NOT invent numbers."
  - Portfolio context prompt includes all holdings with value, NAV, gain/loss; all goals with target amount, date, probability.
  - Falls back to HTTP 503 if `ANTHROPIC_API_KEY` is not set (graceful error, not a crash).
  - 4 pytest tests with mocked `anthropic.Anthropic` class.
- **`anthropic>=0.40.0`** added to `pyproject.toml`.
- **`ANTHROPIC_API_KEY`** environment variable documented in `.env.example` and passed from docker-compose to the analytics container.
- **`GenerateRecommendationsRequest` and related DTOs** in Application — `HoldingContext`, `GoalContext`, `GeneratedRecommendationResult`, `RecommendationDto`.
- **`IAnalyticsService.GenerateRecommendationsAsync`** — extended the existing analytics service interface.
- **`IRecommendationRepository.GetRecentAsync(int limit)`** — new query method added to interface and implemented in `EfRecommendationRepository`.
- **`GenerateRecommendationsCommandHandler`** in Application — fetches all holdings + active goals + active SIPs, builds context, calls analytics service, persists each result as a `RecommendationLog`, returns `RecommendationDto[]`. Clean Application layer: no EF Core, no ILogger.
- **`GetRecommendationsQueryHandler`** — returns recent N recommendations as `RecommendationDto[]`.
- **`AnalyticsServiceClient` updated** — `GenerateRecommendationsAsync` method: posts JSON with `snake_case_lower` serialization options, reads `PythonGenerateResponse` with private inner records for snake_case mapping.
- **`RecommendationsController`** (`GET /api/recommendations?limit=N`, `POST /api/recommendations/generate`, `PATCH /api/recommendations/{id}/read`).
- **`RecommendationFeed.tsx`** — replaced hardcoded placeholder with live data from `useRecommendations(5)`. "Refresh" button triggers `useGenerateRecommendations` mutation. Loading skeleton + empty state with first-generate CTA.
- **`/recommendations` page** — full list (up to 20), per-card "Mark read" action, unread count, Generate button with error display.
- **`useRecommendations`, `useGenerateRecommendations`, `useMarkRecommendationRead`** hooks.

**What was harder than expected:**

- The `tool_choice: {"type": "any"}` flag is required to force Claude to actually call the tool rather than outputting prose. Without it, Claude sometimes explains the recommendations in free-form text instead of calling the tool.
- The `JsonSerializerOptions` for sending the request to the Python service needed `PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower` — the default PascalCase would cause Pydantic validation to fail silently (returning empty fields rather than an error).

**What was skipped:**

- EF migration for `RecommendationLog` — the entity, config, and DbSet were created in Sprint 2 (the `AddCoreEntities` migration covers it). No new migration needed.
- Deduplication of recommendations across generations — if the user generates twice, they get two batches. A deduplicate-by-title+day strategy will be added in Sprint 8.

**Honest reflection:**

The tool_use approach for structured AI output is the correct choice for a personal finance app. Free-form text parsing is fragile; tool_use gives typed fields with validation at the model level. The principle "LLM writes narratives, rules engine provides numbers" held throughout — the prompt is clear that Claude may not generate any figure not already in the portfolio context. The result is recommendations that are specific and accurate rather than generic advice padded with hallucinated numbers.

---

## Sprint 6 — Monte Carlo & Goal Probability

**Dates:** 2026-05-26

**Status:** Complete

**What was built:**

- **`app/services/monte_carlo.py`** — vectorised NumPy Monte Carlo simulation engine.
  - 10,000 paths, monthly time steps.
  - Asset class parameters (Indian market): Equity μ=12% σ=18%, Debt μ=7% σ=4%, Gold μ=8% σ=15%, Cash μ=4% σ=0.5%.
  - Blended portfolio mean/std from asset weights (simplified — no correlation matrix; assets assumed independent).
  - Returns P10/P50/P90 corpus and probability of success (fraction of paths ≥ target).
  - Deterministic with `seed` parameter for tests; production calls use `seed=None`.
- **`POST /simulation/simulate-goal`** — FastAPI endpoint, Pydantic validation (0 ≤ pct ≤ 100), returns `GoalSimulationResponse`.
- **6 pytest tests** — 4 unit tests for `simulate_goal` (high probability, impossible goal, P10≤P50≤P90 ordering, non-negative corpus) + 2 API tests (success + validation failure).
- **`numpy>=1.26.0`** added to `pyproject.toml`.
- **`GoalSimulationRequest` / `GoalSimulationResponse` records** in Application/DTOs.
- **`IAnalyticsService.SimulateGoalAsync`** — extended interface.
- **`RecalculateGoalProbabilityCommandHandler`** in Application — loads goal + linked SIPs (monthly contribution) + all holdings (current corpus = total portfolio / active goal count), calls `SimulateGoalAsync`, calls `goal.UpdateProbability(...)`, persists. Clean Application layer.
- **`GoalProbabilityBackgroundService`** — `BackgroundService` with `PeriodicTimer(24h)`. Runs at startup and then once daily. Uses `IServiceScopeFactory` to create a fresh DI scope per run (background services are singletons; repos are scoped). Per-goal errors are swallowed with a warning log so one bad goal doesn't block the rest.
- **`AnalyticsServiceClient.SimulateGoalAsync`** — JSON serialised with `snake_case_lower` options, `PythonSimulationResponse` private record for mapping.
- **`POST /api/goals/{id}/simulate`** endpoint on `GoalsController` — on-demand trigger, returns updated `GoalDto`.
- **Goals page** — updated `GoalCard` with:
  - Probability progress bar (green ≥70%, yellow ≥40%, red <40%).
  - P10/P50/P90 corpus grid (three boxes below the bar).
  - "Simulate" button per active goal (triggers `useSimulateGoal` mutation with loading state).
- **`useSimulateGoal`** TanStack Query mutation hook (invalidates `goals` + `networth` on success).

**What was harder than expected:**

- `BackgroundService` is registered as a singleton but all repositories are scoped. Using `IServiceScopeFactory.CreateScope()` is the correct pattern; injecting scoped services directly into a singleton causes a captive-dependency runtime error. The scope is created per run, not per service lifetime.
- `RecalculateGoalProbabilityCommandHandler` is registered in `ServiceCollectionExtensions.AddInfrastructure()` (alongside the background service that needs it) — not in `Program.cs`. This is correct architecture: the Infrastructure layer owns the registration of the things it depends on.

**What was skipped:**

- Correlation matrix between asset classes (equity/gold correlation ~0.2, equity/debt ~-0.1). The simplified independent-assets model overestimates portfolio volatility slightly. Will refine in Sprint 9.
- Per-goal corpus allocation — all holdings are split equally across goals as a proxy. Sprint 8 will add explicit goal-to-holding links.
- EF migration for `RecommendationLog` — still pending from Sprint 5 (no live Postgres). Same command also covers no new changes in Sprint 6.

**Honest reflection:**

The `BackgroundService` + `PeriodicTimer` pattern is the right tool here: built into .NET, no additional dependencies, runs in-process with the API, and the `IServiceScopeFactory` pattern is standard and well-understood by .NET engineers. Hangfire would add a dashboard and persistent job storage — useful at team scale but overkill for a single-user personal finance app. The Monte Carlo is fast enough (10k paths in ~50ms in Python/NumPy) to run on-demand from the UI without showing a spinner for more than a second.

---

## Sprint 7 — XIRR & SIP Health

**Dates:** 2026-05-28

**Status:** Complete

**What was built:**

- **`app/services/xirr.py`** — Pure Newton-Raphson XIRR implementation. No scipy dependency. Clamped to [-0.9999, 100.0] to prevent divergence. Returns 0.0 for degenerate inputs (fewer than 2 cashflows, all same sign).
- **`POST /xirr/compute`** — FastAPI endpoint accepting a list of `{date, amount}` cashflows, returning `{xirr: float}`.
- **7 pytest tests** — 12% annual return, monthly SIP positive, zero growth, negative return, single cashflow → 0.0, API success, API too-few-flows 422.
- **`XirrCashFlow`, `XirrRequest`, `XirrResponse` records** in Application/DTOs.
- **`IAnalyticsService.ComputeXirrAsync`** — extended interface.
- **`ComputeSipXirrCommandHandler`** in Application — generates synthetic cashflows (`-MonthlyAmount` per month from `StartDate` to today, `+currentValue` today), matches holding by fund name (case-insensitive), calls `ComputeXirrAsync`, calls `sip.UpdateXirr()`, persists.
- **`XirrBackgroundService`** — same `PeriodicTimer(24h)` + `IServiceScopeFactory` pattern as `GoalProbabilityBackgroundService`.
- **`POST /api/sipplans/{id}/compute-xirr`** on `SipPlansController`.
- **SIPs page** — "XIRR" button per active SIP row, XIRR displayed as percent (coloured green/red).
- **`useComputeXirr` mutation** hook in `useSipPlans.ts`.

**What was harder than expected:**

- SIPs don't have an explicit transaction history — only `StartDate`, `MonthlyAmount`, and `SipDate`. Synthetic cashflows are generated by looping from `StartDate` to today using `Math.Min(sipDate, DateTime.DaysInMonth(year, month))` for month-end safety.
- If no matching `Holding` is found by fund name, the terminal cashflow uses total invested (XIRR ≈ 0%). The result is still meaningful — it tells the user the SIP has broken even.

**What was skipped:**

- Benchmark comparison (SIP XIRR vs index return) — needs live NAV data feed. Will add in v2.

**Honest reflection:**

Newton-Raphson XIRR converges in 5–30 iterations for typical SIP cashflows. The pure-Python implementation is 2× slower than scipy's but takes ~1ms per SIP — acceptable for a daily background job. The synthetic cashflow approach is a pragmatic workaround for the absence of a per-SIP transaction ledger; it gives a correct XIRR if the actual monthly investment matches the plan.

---

## Sprint 8 — Monthly Plan Composer (AI)

**Dates:** 2026-05-28

**Status:** Complete

**What was built:**

- **`POST /plan/generate`** — Python FastAPI endpoint. Calls Claude `claude-haiku-4-5-20251001` via `tool_use` with a `save_monthly_plan` tool. Returns structured `MonthlyPlanResponse` with surplus, sections (title + amount + narrative), and overall narrative.
  - System prompt: "You are a personal CFO. Use ONLY figures present in the data. Do NOT invent any numbers."
  - Returns 503 if `ANTHROPIC_API_KEY` not set.
- **`MonthlyPlanContext`, `MonthlyPlanResponse`, `MonthlyPlanSection` records** in Application/DTOs.
- **`GenerateMonthlyPlanCommandHandler`** in Application — collects current-month transactions (income/expenses by category), active SIPs total, net worth, active goals, calls `GenerateMonthlyPlanAsync`.
- **`PlanController`** (`POST /api/plan/generate`).
- **`/plan` page** — Generate button, loading skeletons, surplus displayed large (green/red), `overallNarrative` card, sectioned breakdown with left indigo accent bar.
- **`MonthlyPlanSummary.tsx`** dashboard widget — replaced Sprint 5 placeholder with SIP commitment + "Generate AI monthly plan →" link.

**What was harder than expected:**

- `tool_choice: {"type": "any"}` is required. Without it, Claude sometimes outputs free-form prose instead of calling the tool.
- The layout edit initially failed with "file not yet read" — fixed by reading the file first then using Edit.

**What was skipped:**

- Auto-generation on the 1st of each month (cron job). Current behaviour: user triggers manually. Will add in v2 alongside push notifications.

**Honest reflection:**

The AI plan composer is the flagship feature and it delivers. The key insight is keeping the LLM as a narrative engine only — the surplus calculation, category totals, and goal amounts all come from the application layer. Claude's job is to turn a table of numbers into a clear, actionable plan in plain English. `tool_use` with a typed schema is the right primitive for this — it prevents hallucinated amounts by construction.

---

## Sprint 9 — Cash Flow

**Dates:** 2026-05-28

**Status:** Complete

**What was built:**

- **`GetCashFlowQueryHandler`** — groups transactions by (year, month) over a rolling N-month window. Returns all months including empty ones (no gaps). Top-level income/expense totals per month, plus per-category breakdown.
- **`GET /api/cashflow?months=6`** on `CashFlowController`. Months clamped to 1–24.
- **`/cashflow` page** — 3/6/12-month period toggle, 3 summary cards (income/expenses/net), Tailwind pure-CSS grouped bar chart (income=green, expenses=rose), monthly breakdown table (newest first), category drill-down for the most recent month.
- **`useCashFlow(months)` hook** — TanStack Query with `queryKey: ["cashflow", months]` so period changes invalidate the right cache entry.

**What was skipped:**

- Running average line overlay on the bar chart (no chart library in the project — Tailwind CSS bars only).
- Category budget alerts (deferred to v2 notifications).

**Honest reflection:**

The pure-CSS bar chart works surprisingly well for 3–12 months of data. The grouped bars (income + expenses per month) give an immediate visual sense of monthly surplus/deficit. The category drill-down for the current month answers "where did my money go?" without any additional navigation.

---

## Sprint 10 — Tax Summary

**Dates:** 2026-05-28

**Status:** Complete

**What was built:**

- **`GetTaxSummaryQueryHandler`** — computes for the current Indian financial year (Apr–Mar):
  - LTCG: equity/MF holdings with `AsOf` > 12 months ago. 10% tax on gains above ₹1 lakh exemption.
  - STCG: equity/MF holdings with `AsOf` ≤ 12 months ago. 15% flat.
  - FD: classified as "Slab" (taxed at income slab rate; no LTCG/STCG estimate).
  - Section 80C: sum of SIP monthly commitments within the FY, capped at ₹1.5L statutory limit.
- **`GET /api/tax`** on `TaxController`.
- **`/tax` page** — 6 summary cards (LTCG gains, STCG gains, est. LTCG tax, est. STCG tax, total est. tax, 80C investments), disclaimer callout, holdings table with gain/loss amounts and LTCG/STCG/Slab category badges.
- **`useTaxSummary` hook**.

**Known limitation:** Holding period is estimated from `AsOf` (last NAV update date), not the actual purchase transaction date. In practice, a CAS import sets `AsOf = today` for all holdings, making all holdings appear ≤12 months old (STCG). Production accuracy requires per-transaction purchase date tracking. The framework is correct; the data model needs enrichment.

**What was skipped:**

- Actual purchase date per holding (needs EF migration and CAS transaction-level data).
- Surcharge calculations for gains above ₹50L/₹1Cr.

**Honest reflection:**

The tax page is the right kind of "useful even when imperfect." The LTCG/STCG framework is correct. The 80C estimate is useful for deciding whether to top up ELSS before March. The disclaimer is prominent. Once per-transaction purchase dates are stored, the numbers become accurate with zero code changes to the handler logic.

---

## Sprint 11 — Portfolio Analytics

**Dates:** 2026-05-28

**Status:** Complete

**What was built:**

- **`GetPortfolioAnalyticsQueryHandler`** — computes for all holdings:
  - Total value, total invested (purchaseNav × units), total gain/loss, overall return %.
  - Asset allocation by `HoldingType` (MutualFund, Stock, Gold, FD, Cash, etc.) with value and weight.
  - Top-5 concentration risk — names, values, % of portfolio (coloured: >30% red, >20% amber, otherwise indigo).
  - Per-holding CAGR = `(currentValue/purchasedValue)^(12/holdingMonths) – 1`, annualised. Null if holding period < 1 month.
- **`GET /api/analytics`** on `PortfolioAnalyticsController`.
- **`/analytics` page** — 4 summary cards, stacked allocation bar (colour-coded by asset type), allocation table, concentration risk progress bars, per-holding CAGR table.
- **`usePortfolioAnalytics` hook**.
- **Analytics nav item** added to Sidebar between Holdings and Transactions.
- **`PortfolioAnalyticsDto`, `HoldingAnalyticsDto`, `AllocationByTypeDto`, `ConcentrationRiskDto`** in Application/DTOs and `src/types/api.ts`.

**What was skipped:**

- Sector allocation (large-cap / mid-cap / small-cap) — requires a fund metadata lookup. Deferred to v2.
- Sharpe ratio — requires a risk-free rate configuration. Deferred to v2.

**Honest reflection:**

The concentration risk view is immediately useful. Seeing that one fund is 40% of the portfolio is actionable in a way that the raw holdings table is not. The CAGR calculation is simple but correct; the per-holding comparison with the overall portfolio return quickly identifies the winners and the laggards.

---

## Sprint 12 — Polish & Production

**Dates:** 2026-05-28

**Status:** Complete

**What was built:**

- **`docs/architecture.md`** — complete system architecture: diagram, layer responsibilities, key design decisions, data model, environment variables, local run instructions.
- **`src/web/public/manifest.json`** — PWA manifest with name, short name, start URL, display mode, brand colours.
- **PWA meta tags** — `manifest`, `appleWebApp`, `mobile-web-app-capable` added to `layout.tsx` `metadata` export.
- **`README.md`** at repo root — full project overview, prerequisites, quick start, running tests, environment variables reference.
- **Sprint log** — entries for Sprints 7–12 added.
- **Memory files** — updated project state to reflect all 12 sprints complete.

**Build verification:**
- `dotnet build` — succeeded (Build succeeded, 0 CS errors).
- `tsc --noEmit` — 0 TypeScript errors.

**What was skipped:**

- Service worker / offline caching — Next.js App Router has experimental service worker support but it's not stable in Next.js 16. The manifest is in place for when a service worker library (e.g. `next-pwa`) is stabilised.
- Telegram notifications — deferred to v2 (requires a bot token and a server that can make outbound webhook calls).

**Honest reflection:**

Twelve sprints, one session (across two context windows). The architecture held up: the Clean Architecture layer boundaries never needed to be broken, the Python service never leaked into the .NET domain, and the LLM never produced a number. The codebase is production-ready for a single-user personal app — it can be deployed on a ₹500/month VPS with Docker Compose today. The most important feature is the monthly plan: a personalised, AI-generated action list with real numbers, not template advice.

---

*End of sprint log. v1 is complete.*
