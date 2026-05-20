# Personal AI Financial Advisor

A personal CFO that knows my entire financial life — mutual funds, bank accounts, EPF, credit cards, goals — and produces a specific, numbered, actionable money plan on the 1st of every month.

Built for myself first. If it works for me, it will work for others.

---

## What It Does

- **Monthly Money Plan** — Generated on the 1st: specific Actions (do this), Watches (monitor this), and Wins (celebrate this), with an LLM-written narrative explaining the reasoning
- **Net Worth Dashboard** — Total net worth updated daily, broken down by category
- **SIP Health View** — Every SIP with XIRR, benchmark comparison, and a health status badge
- **Goal Tracker** — Each goal with Monte Carlo probability of hitting the target
- **Cash Flow View** — Monthly income, expenses by category, surplus
- **Tax Module** — 80C tracking, regime comparison, advance tax reminders
- **Notifications** — In-app, email digest, and Telegram for urgent items

## Architecture

```
User Browser
    │
    ▼
FinAdvisor.Web (Razor Pages + HTMX)
    │
    ▼
FinAdvisor.Api (ASP.NET Core 8)
    │
    ├── FinAdvisor.Application (Use Cases, Rules Engine, Interfaces)
    │       │
    │       └── FinAdvisor.Domain (Entities, Value Objects, Domain Logic)
    │
    ├── FinAdvisor.Infrastructure (EF Core, Hangfire Jobs, HTTP Clients)
    │       │
    │       ├── PostgreSQL (primary data store)
    │       │
    │       └── analytics-service (Python / FastAPI)
    │               │
    │               ├── casparser (CAS PDF parsing)
    │               ├── pdfplumber (bank statement parsing)
    │               ├── numpy-financial (XIRR, IRR)
    │               ├── mftool (NAV history, Indian market data)
    │               └── Anthropic Claude Haiku (narrative generation)
    │
    └── Hangfire (background jobs: NAV refresh, XIRR calc, monthly plan, recommendations)
```

**Two services, one repo.** .NET owns business logic, data, and the frontend. Python owns financial math and AI. .NET calls Python via HTTP REST with Polly resilience. The LLM never produces numbers — it only writes narrative around numbers the rules engine computed.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Web frontend | Razor Pages + HTMX + Tailwind CSS (CDN) |
| API | ASP.NET Core 8 |
| Domain / Application | Clean Architecture, C# |
| Database | PostgreSQL 16 via EF Core 8 |
| Background jobs | Hangfire (Postgres storage) |
| Analytics service | Python 3.11 + FastAPI |
| Financial math | numpy-financial, pandas |
| Market data | mftool, nsepython |
| AI narrative | Anthropic Claude Haiku |
| Resilience | Polly (retry, circuit breaker, timeout) |
| Logging | Serilog → BetterStack |
| CI | GitHub Actions |
| Hosting | Railway / Fly.io |

## Local Setup

**Prerequisites:** Docker, Docker Compose, .NET 8 SDK, Python 3.11+

```bash
# 1. Clone the repo
git clone https://github.com/ishant99/financial-adviser.git
cd financial-adviser

# 2. Copy environment file and fill in your values
cp .env.example .env

# 3. Start Postgres
docker compose up -d postgres

# 4. Run EF Core migrations
dotnet ef database update --project src/FinAdvisor.Infrastructure

# 5. Start the .NET service
dotnet run --project src/FinAdvisor.Api

# 6. Start the Python analytics service (in a new terminal)
cd src/analytics-service
pip install -e .
uvicorn app.main:app --reload --port 8000

# 7. Open http://localhost:5000
```

To run everything in Docker:
```bash
docker compose up --build
```

## Running Tests

```bash
# .NET tests
dotnet test

# Python tests
cd src/analytics-service
pytest
```

## Project Status

| Sprint | Theme | Status |
|--------|-------|--------|
| 1 | Foundation and First Endpoint | Not started |
| 2 | Domain Model and Data Layer | Not started |
| 3 | Manual Entry and Net Worth View | Not started |
| 4 | CAS Upload via Python Service | Not started |
| 5 | XIRR, Benchmarks, SIP Health | Not started |
| 6 | Goal Engine with Monte Carlo | Not started |
| 7 | Recommendation Engine | Not started |
| 8 | Monthly Plan and LLM Narrative | Not started |
| 9 | Bank Statement Parsing and Cash Flow | Not started |
| 10 | Tax Module and Telegram | Not started |
| 11 | Production Deploy and Observability | Not started |
| 12 | Polish and Interview-Ready Repo | Not started |

## Documentation

- [`docs/planning.md`](docs/planning.md) — Full product and architecture plan
- [`docs/sprint-plan.md`](docs/sprint-plan.md) — Task-level sprint breakdown
- [`docs/sprint-log.md`](docs/sprint-log.md) — Sprint retrospectives
- [`docs/interview-notes.md`](docs/interview-notes.md) — Architectural decisions and trade-offs
- [`docs/architecture.md`](docs/architecture.md) — Architecture diagrams (Sprint 12)

## Working Principles

- Every AI-generated line is read and understood before committing
- Financial math is manually verified against Excel for at least one known case
- The LLM writes words, not numbers — all figures come from the rules engine
- Conservative advice always: emergency fund first, debt before investing
- Every sprint ends with a working, deployable state
