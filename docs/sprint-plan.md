# Sprint Plan — Personal AI Financial Advisor

This document is the task-level breakdown for all 12 sprints. Each sprint has a goal, specific tasks with acceptance criteria, out-of-scope guardrails, and interview talking points. Update the status column as tasks complete.

Sprint length: 2 weeks. Estimated pace: 10–15 hours/week.

---

## Sprint 1 — Foundation and First Endpoint

**Goal:** Repository is set up with Clean Architecture skeleton, Postgres connected, a single working endpoint, CI pipeline green.

**Estimated effort:** 15–20 hours

**Status:** `[ ] Not started`

---

### Tasks

#### 1.1 Repository and Solution Structure

| # | Task | Acceptance Criteria | Status |
|---|------|---------------------|--------|
| 1.1.1 | Create `.gitignore` for .NET and Python | No `bin/`, `obj/`, `__pycache__`, `.env` in commits | `[ ]` |
| 1.1.2 | Create root `README.md` with project overview, architecture diagram (text), and local setup instructions | README explains what the project is and how to run it locally in < 5 minutes of reading | `[ ]` |
| 1.1.3 | Create `FinAdvisor.sln` solution file | `dotnet build` succeeds from repo root | `[ ]` |
| 1.1.4 | Create four .NET projects: `FinAdvisor.Domain`, `FinAdvisor.Application`, `FinAdvisor.Infrastructure`, `FinAdvisor.Api` | All four projects exist under `src/`, all reference each other correctly (Domain ← Application ← Infrastructure ← Api) | `[ ]` |
| 1.1.5 | Enforce reference direction — Domain has no project references; Application references only Domain; Infrastructure references Application and Domain; Api references Infrastructure | `dotnet build` succeeds, attempting a reverse reference (Domain referencing Application) fails | `[ ]` |
| 1.1.6 | Create `tests/` folder with `FinAdvisor.Domain.Tests`, `FinAdvisor.Application.Tests`, `FinAdvisor.Api.Tests` xUnit projects | `dotnet test` succeeds (zero tests passing is fine at this point) | `[ ]` |
| 1.1.7 | Add `docs/` folder with `planning.md`, `sprint-plan.md`, `sprint-log.md`, `interview-notes.md`, `architecture.md` stubs | Files exist, `sprint-log.md` has Sprint 1 entry started | `[ ]` |

#### 1.2 Docker and Postgres

| # | Task | Acceptance Criteria | Status |
|---|------|---------------------|--------|
| 1.2.1 | Create `docker-compose.yml` with Postgres 16 service | `docker compose up -d` starts Postgres on port 5432 | `[ ]` |
| 1.2.2 | Add `.env.example` with `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `ConnectionStrings__Default` | File documented; actual `.env` is gitignored | `[ ]` |
| 1.2.3 | Add Postgres health check to docker-compose so dependent services wait | `docker compose ps` shows Postgres as healthy before app starts | `[ ]` |
| 1.2.4 | Verify Postgres connection manually using `psql` or `pgAdmin` against the running container | Can connect and list databases | `[ ]` |

#### 1.3 EF Core Setup and First Migration

| # | Task | Acceptance Criteria | Status |
|---|------|---------------------|--------|
| 1.3.1 | Add EF Core 8 and Npgsql provider NuGet packages to `FinAdvisor.Infrastructure` | `dotnet build` succeeds | `[ ]` |
| 1.3.2 | Create `AppDbContext` in Infrastructure with a `UserProfiles` `DbSet` | Context compiles | `[ ]` |
| 1.3.3 | Create `UserProfile` entity in Domain with fields: `Id` (Guid), `Name` (string), `Email` (string), `CreatedAt` (DateTimeOffset) | Entity class exists, no external dependencies | `[ ]` |
| 1.3.4 | Register `AppDbContext` in DI in `Program.cs` reading connection string from configuration | App starts without throwing on DI registration | `[ ]` |
| 1.3.5 | Create and apply initial EF Core migration (`InitialCreate`) creating the `UserProfiles` table | `dotnet ef migrations add InitialCreate` succeeds; `dotnet ef database update` creates table in Postgres | `[ ]` |
| 1.3.6 | Add a seed data entry for my own `UserProfile` (name, email) that runs on startup in development | After `dotnet run`, the UserProfiles table has one row | `[ ]` |

#### 1.4 Health Check Endpoint

| # | Task | Acceptance Criteria | Status |
|---|------|---------------------|--------|
| 1.4.1 | Add Microsoft health check middleware to `Program.cs` | Endpoint registered | `[ ]` |
| 1.4.2 | Add Postgres connectivity health check | Health check queries Postgres; if Postgres is down, health check fails | `[ ]` |
| 1.4.3 | Expose `GET /api/health` returning JSON `{ "status": "healthy", "checks": { "postgres": "healthy" }, "timestamp": "..." }` | `curl http://localhost:5000/api/health` returns 200 with above structure | `[ ]` |
| 1.4.4 | Write one integration test asserting health check returns 200 | `dotnet test` passes | `[ ]` |

#### 1.5 Logging

| # | Task | Acceptance Criteria | Status |
|---|------|---------------------|--------|
| 1.5.1 | Add Serilog NuGet packages (`Serilog.AspNetCore`, `Serilog.Sinks.Console`) | Packages installed | `[ ]` |
| 1.5.2 | Configure Serilog in `Program.cs` replacing default logging | Startup logs appear in structured JSON format in console | `[ ]` |
| 1.5.3 | Log app version and environment on startup | Version and environment visible in startup logs | `[ ]` |

#### 1.6 GitHub Actions CI

| # | Task | Acceptance Criteria | Status |
|---|------|---------------------|--------|
| 1.6.1 | Create `.github/workflows/dotnet-ci.yml` | File exists | `[ ]` |
| 1.6.2 | CI workflow triggers on push to any branch and on pull requests to `main` | Verified in Actions tab | `[ ]` |
| 1.6.3 | CI steps: checkout → setup .NET 8 → restore → build → test | All steps succeed on a green push | `[ ]` |
| 1.6.4 | CI runs on `ubuntu-latest` | Runner confirmed in workflow file | `[ ]` |
| 1.6.5 | Create `.github/workflows/python-ci.yml` as a stub (echo "Python CI — coming in Sprint 4") | Workflow file exists and passes on push | `[ ]` |

#### 1.7 Documentation

| # | Task | Acceptance Criteria | Status |
|---|------|---------------------|--------|
| 1.7.1 | Write first entry in `docs/interview-notes.md`: Why Clean Architecture; what the layers are; what lives in each; why this over a feature-folder structure | Entry is 200–400 words, written in my own words, not AI-generated prose | `[ ]` |
| 1.7.2 | Write first entry in `docs/interview-notes.md`: Monorepo vs split repos — why monorepo for a polyglot project at this stage | Entry written | `[ ]` |
| 1.7.3 | Write Sprint 1 entry in `docs/sprint-log.md`: what was built, what was harder than expected, what was skipped and why | Entry written at end of sprint | `[ ]` |

---

### Out of Scope — Sprint 1

- No business logic or domain entities beyond `UserProfile`
- No frontend (Next.js) — that is Sprint 3
- No Python service — that is Sprint 4
- No Hangfire jobs — that is Sprint 5
- No real financial data — seed data is placeholder

---

### Definition of Done — Sprint 1

- [ ] `dotnet build` succeeds from repo root
- [ ] `dotnet test` passes (even if only 1 test exists)
- [ ] `docker compose up -d` starts Postgres
- [ ] `GET /api/health` returns 200
- [ ] GitHub Actions CI is green on push
- [ ] `docs/interview-notes.md` has at least two entries
- [ ] `docs/sprint-log.md` Sprint 1 entry written

---

### Interview Talking Points — Sprint 1

- Clean Architecture: what it is, what each layer owns, what it prevents (Infrastructure leaking into Domain, etc.)
- Why the reference direction (Domain → Application → Infrastructure → Api) is enforced, and how you enforce it in .NET
- Monorepo vs split repos: when monorepo makes sense (shared CI, single team, small project), when it does not
- CI philosophy: test on every push, never merge red, what "green" actually means for a project with few tests yet

---

---

## Sprint 2 — Domain Model and Data Layer

**Goal:** Core domain entities exist in code, persisted in Postgres, with proper migrations and seed data for myself.

**Estimated effort:** 20–25 hours

**Status:** `[ ] Not started`

**Depends on:** Sprint 1 complete and green

---

### Tasks

#### 2.1 Domain Entities

| # | Task | Acceptance Criteria | Status |
|---|------|---------------------|--------|
| 2.1.1 | Create `Account` entity: `Id`, `Name`, `AccountType` (enum: SavingsBank, CurrentBank, EPF, PPF, NPS), `InstitutionName`, `AccountNumber` (nullable), `IsActive`, `CreatedAt` | Entity in Domain project, no EF attributes on entity itself | `[ ]` |
| 2.1.2 | Create `Holding` entity: `Id`, `AccountId` (FK), `HoldingType` (enum: MutualFund, Stock, FD, Gold, RealEstate, Cash, Crypto), `Name`, `Units` (decimal), `PurchaseNav` (decimal), `CurrentNav` (decimal), `CurrentValue` (decimal), `AsOf` (DateTimeOffset) | Entity in Domain project | `[ ]` |
| 2.1.3 | Create `Transaction` entity: `Id`, `AccountId` (FK), `Date`, `Amount`, `TransactionType` (enum: Credit, Debit), `Category` (string), `Description`, `IsReconciled` | Entity in Domain project | `[ ]` |
| 2.1.4 | Create `Goal` entity: `Id`, `Name`, `TargetAmount` (decimal), `TargetDate`, `Priority` (int 1–5), `Status` (enum: Active, Paused, Completed), `TargetAssetAllocation` (owned type — equity %, debt %, gold %), `CreatedAt` | Entity in Domain project | `[ ]` |
| 2.1.5 | Create `SipPlan` entity: `Id`, `FundName`, `FundCode` (AMFI code), `MonthlyAmount` (decimal), `SipDate` (int 1–28), `StartDate`, `Status` (enum: Active, Paused, Stopped), `LinkedGoalId` (nullable FK to Goal), `BenchmarkIndex` (string) | Entity in Domain project | `[ ]` |
| 2.1.6 | Create `RecommendationLog` entity: `Id`, `GeneratedAt`, `Type` (enum: Action, Watch, Win), `Category` (string), `Severity` (enum: Info, Watch, ActNow), `Title`, `Body`, `SupportingDataJson` (string), `IsRead`, `IsActioned` | Entity in Domain project | `[ ]` |

#### 2.2 Value Objects

| # | Task | Acceptance Criteria | Status |
|---|------|---------------------|--------|
| 2.2.1 | Create `Money` value object: `Amount` (decimal), `Currency` (string, default "INR"); implement `+`, `-`, `*` operators; implement equality | Unit tests for arithmetic and equality pass | `[ ]` |
| 2.2.2 | Create `DateRange` value object: `Start` (DateOnly), `End` (DateOnly); validate Start ≤ End; `Contains(DateOnly)` method; `Months` computed property | Unit tests for validation, Contains, and Months pass | `[ ]` |
| 2.2.3 | Create `AssetAllocation` value object: `EquityPercent` (decimal), `DebtPercent` (decimal), `GoldPercent` (decimal), `CashPercent` (decimal); validate percentages sum to 100; `IsConservative`, `IsAggressive` computed properties | Unit tests for validation and classification pass | `[ ]` |
| 2.2.4 | Create `Xirr` value object: wraps a decimal, represents annualised return; validates range (−100% to +200%); `IsPositive`, `BeatsBenchmark(Xirr benchmark)` methods | Unit tests pass | `[ ]` |

#### 2.3 Domain Logic

| # | Task | Acceptance Criteria | Status |
|---|------|---------------------|--------|
| 2.3.1 | Add `NetWorth` computed property to a `NetWorthCalculator` domain service: takes a list of Holdings and Accounts, sums assets, subtracts liabilities, returns `Money` | Unit test: given known holdings returns correct net worth | `[ ]` |
| 2.3.2 | Add `MonthlySurplus` domain service: takes income (Money), fixed obligations (Money), variable estimate (Money), returns surplus (Money) | Unit test: positive and negative surplus cases | `[ ]` |
| 2.3.3 | Define `IRepository<T>` generic interface in Application layer: `GetByIdAsync`, `GetAllAsync`, `AddAsync`, `UpdateAsync`, `DeleteAsync` | Interface compiles; no implementation yet | `[ ]` |
| 2.3.4 | Define specific repository interfaces in Application: `IAccountRepository`, `IHoldingRepository`, `ITransactionRepository`, `IGoalRepository`, `ISipPlanRepository`, `IRecommendationRepository` | Interfaces defined, extending `IRepository<T>` with any entity-specific queries | `[ ]` |

#### 2.4 EF Core Configuration and Migrations

| # | Task | Acceptance Criteria | Status |
|---|------|---------------------|--------|
| 2.4.1 | Create EF Core `IEntityTypeConfiguration<T>` classes for all six entities in Infrastructure | Configurations separate from entity classes; no data annotations on domain entities | `[ ]` |
| 2.4.2 | Configure `AssetAllocation` as an owned type on `Goal` (maps to same table) | Migration generates owned columns correctly | `[ ]` |
| 2.4.3 | Configure `Money` value conversion for decimal/string storage on `Holding.CurrentValue`, `SipPlan.MonthlyAmount`, `Goal.TargetAmount` | Values stored and retrieved correctly | `[ ]` |
| 2.4.4 | Create and apply migration `AddCoreEntities` | `dotnet ef database update` succeeds, all tables visible in Postgres | `[ ]` |
| 2.4.5 | Add database indexes: `Transaction.AccountId + Date`, `Holding.AccountId`, `SipPlan.FundCode`, `RecommendationLog.GeneratedAt` | Indexes present in migration, confirmed in Postgres `\d` output | `[ ]` |

#### 2.5 Repository Implementations

| # | Task | Acceptance Criteria | Status |
|---|------|---------------------|--------|
| 2.5.1 | Implement `EfAccountRepository` in Infrastructure | CRUD operations work; registered in DI | `[ ]` |
| 2.5.2 | Implement `EfHoldingRepository` in Infrastructure | CRUD operations work; registered in DI | `[ ]` |
| 2.5.3 | Implement `EfTransactionRepository` with `GetByAccountAndDateRangeAsync` | Date range query returns correct results | `[ ]` |
| 2.5.4 | Implement `EfGoalRepository` in Infrastructure | CRUD operations work; registered in DI | `[ ]` |
| 2.5.5 | Implement `EfSipPlanRepository` with `GetActiveAsync` and `GetByFundCodeAsync` | Both queries return correct results | `[ ]` |
| 2.5.6 | Implement `EfRecommendationRepository` with `GetUnreadAsync` and `GetByTypeAsync` | Both queries return correct results | `[ ]` |

#### 2.6 Seed Data

| # | Task | Acceptance Criteria | Status |
|---|------|---------------------|--------|
| 2.6.1 | Create `DevSeedData` class in Infrastructure that populates: 2 bank accounts, 4–5 holdings (mix of MF and FD), 3 goals (Emergency Fund, Retirement, House Down Payment), 2–3 SIP plans | After `dotnet run` in Development, data visible in Postgres | `[ ]` |
| 2.6.2 | Seed data is idempotent — running startup twice does not duplicate rows | Verify by restarting app twice and checking row counts | `[ ]` |

#### 2.7 Tests

| # | Task | Acceptance Criteria | Status |
|---|------|---------------------|--------|
| 2.7.1 | Unit tests for `Money` value object (arithmetic, equality, formatting) — minimum 8 test cases | All pass | `[ ]` |
| 2.7.2 | Unit tests for `DateRange` value object — boundary cases, Contains, Months | All pass | `[ ]` |
| 2.7.3 | Unit tests for `AssetAllocation` — invalid percentages throw, valid passes, classification correct | All pass | `[ ]` |
| 2.7.4 | Unit tests for `NetWorthCalculator` — 3 scenarios: assets only, assets + liabilities, empty | All pass | `[ ]` |
| 2.7.5 | Integration tests for at least one repository (e.g., `EfGoalRepository`) using test database or in-memory Postgres | Create, read, update, delete all tested | `[ ]` |

#### 2.8 Documentation

| # | Task | Acceptance Criteria | Status |
|---|------|---------------------|--------|
| 2.8.1 | Add interview note: aggregate root design — what is an aggregate, why `Goal` is a root, why `Transaction` is not under `Goal` | Written in my own words | `[ ]` |
| 2.8.2 | Add interview note: value objects vs entities — the key difference (identity vs equality), when to use which | Written | `[ ]` |
| 2.8.3 | Add interview note: why EF Core configurations are separate from entity classes (domain purity) | Written | `[ ]` |
| 2.8.4 | Update `docs/sprint-log.md` with Sprint 2 entry | Written at end of sprint | `[ ]` |

---

### Out of Scope — Sprint 2

- No UI yet — Next.js comes in Sprint 3
- No analytics — XIRR, Monte Carlo come in Sprints 5–6
- No external API calls — market data comes in Sprint 5
- No recommendations — rules engine comes in Sprint 7

---

### Definition of Done — Sprint 2

- [ ] All entities in Domain project, zero EF Core attributes on domain classes
- [ ] All value objects with unit tests passing
- [ ] All migrations applied, all tables visible in Postgres
- [ ] Seed data populates on startup (idempotent)
- [ ] All repository interfaces defined in Application, implementations in Infrastructure
- [ ] `dotnet test` passes including new unit and integration tests
- [ ] CI green on push

---

### Interview Talking Points — Sprint 2

- Aggregate root design: what it is, why it matters, how it affects your repository design
- Value objects: identity vs equality, immutability, why `Money` is not a primitive
- EF Core: why keep entity configurations separate from entities, what the `IEntityTypeConfiguration` pattern gives you
- Why owned types (AssetAllocation) instead of a separate table for a value that always belongs to one Goal

---

---

## Sprint 3 — Next.js Setup and Net Worth Dashboard

**Goal:** The Next.js frontend is scaffolded. I can manually add holdings, transactions, and goals. The dashboard shows my net worth pulling from the .NET API.

**Estimated effort:** 25–30 hours

**Status:** `[ ] Not started`

**Depends on:** Sprint 2 complete and green

---

### Tasks

#### 3.1 .NET API — REST Endpoints

| # | Task | Acceptance Criteria | Status |
|---|------|---------------------|--------|
| 3.1.1 | Create `GetNetWorthQuery` + handler: retrieves all holdings, sums by category, returns `NetWorthDto` | Handler returns correct DTO from seed data | `[ ]` |
| 3.1.2 | Create `AddHoldingCommand`, `UpdateHoldingCommand`, `DeleteHoldingCommand` handlers | CRUD operations work; holdings persisted to DB | `[ ]` |
| 3.1.3 | Create `AddGoalCommand`, `UpdateGoalCommand` handlers | Goals persisted to DB | `[ ]` |
| 3.1.4 | Create `AddTransactionCommand`, `GetTransactionsQuery` (with date range + account filter) handlers | Transactions persisted; filtered list returned | `[ ]` |
| 3.1.5 | Create `AddSipPlanCommand`, `PauseSipPlanCommand`, `ResumeSipPlanCommand` handlers | SIP plans persisted; status toggles correctly | `[ ]` |
| 3.1.6 | Wire all handlers to API controllers: `HoldingsController`, `GoalsController`, `TransactionsController`, `SipPlansController`, `NetWorthController` | All endpoints return correct JSON | `[ ]` |
| 3.1.7 | Add FluentValidation to all commands — required fields, units ≥ 0, NAV > 0, allocation sums to 100 | Invalid requests return 400 with problem details | `[ ]` |
| 3.1.8 | Configure CORS in `Program.cs` to allow `http://localhost:3000` in development | Next.js can call the API without CORS errors | `[ ]` |

#### 3.2 Next.js Project Scaffold

| # | Task | Acceptance Criteria | Status |
|---|------|---------------------|--------|
| 3.2.1 | Create Next.js 14 project with TypeScript under `src/web/`: `npx create-next-app@latest web --typescript --tailwind --app --src-dir` | `npm run dev` starts on port 3000 without errors | `[ ]` |
| 3.2.2 | Install shadcn/ui and initialise with dark theme: `npx shadcn@latest init` | `components/ui/` folder exists with shadcn config | `[ ]` |
| 3.2.3 | Add shadcn components used in Sprint 3: `card`, `button`, `badge`, `table`, `dialog`, `alert-dialog`, `separator`, `skeleton`, `toast`, `form`, `input`, `label`, `select` | Each installs without error | `[ ]` |
| 3.2.4 | Install TanStack Query and Axios: `npm install @tanstack/react-query axios` | Packages in `package.json` | `[ ]` |
| 3.2.5 | Create `lib/api.ts` — Axios instance with `baseURL` from `NEXT_PUBLIC_API_URL` env var, default `http://localhost:5000` | API instance exported and typed | `[ ]` |
| 3.2.6 | Create `app/providers.tsx` — wraps children in `QueryClientProvider`; used in `app/layout.tsx` | TanStack Query available across all pages | `[ ]` |
| 3.2.7 | Create `lib/utils.ts` with `formatCurrency(n)`, `formatPercent(n)`, and shadcn `cn()` helper | `formatCurrency(4732481)` → `"₹47.32L"` | `[ ]` |
| 3.2.8 | Create `types/api.ts` with TypeScript types mirroring all .NET DTOs from Sprint 3 endpoints | Types match API response shapes | `[ ]` |
| 3.2.9 | Add `src/web` to `docker-compose.yml` with Node.js image, port 3000, hot-reload volume mount | `docker compose up` starts all three services | `[ ]` |
| 3.2.10 | Create `.github/workflows/nextjs-ci.yml`: checkout → Node 20 → `npm ci` → `npm run build` → `npm test` | CI passes on push | `[ ]` |

#### 3.3 Layout and Navigation

| # | Task | Acceptance Criteria | Status |
|---|------|---------------------|--------|
| 3.3.1 | Create `app/layout.tsx` with sidebar layout: fixed left nav (`w-56`) + main content area | Layout renders correctly at `/` | `[ ]` |
| 3.3.2 | Create `components/features/layout/Sidebar.tsx` with nav links: Home, Plan, SIPs, Goals, Cash Flow, Holdings, Tax, Upload | All links render; active link highlighted using `usePathname()` | `[ ]` |
| 3.3.3 | Sidebar is hidden on mobile (`hidden md:flex`); mobile gets a bottom tab bar with 5 key destinations | Mobile layout functional | `[ ]` |
| 3.3.4 | Apply global dark theme: `bg-gray-950 text-gray-100` on `<html>` and `<body>` | Dark background renders across all pages | `[ ]` |

#### 3.4 Dashboard Page

| # | Task | Acceptance Criteria | Status |
|---|------|---------------------|--------|
| 3.4.1 | Create `app/page.tsx` (dashboard) — Server Component that fetches net worth for initial render | Page renders with data on first load, no loading flash | `[ ]` |
| 3.4.2 | Create `components/features/dashboard/NetWorthCard.tsx` — displays hero number, monthly delta, category breakdown | Numbers match seed data from .NET API | `[ ]` |
| 3.4.3 | Auto-refresh net worth every 60s using TanStack Query `refetchInterval: 60_000` | Number updates in browser without manual refresh | `[ ]` |
| 3.4.4 | Create `components/features/dashboard/RecommendationFeed.tsx` — three tabs (Actions / Watches / Wins), each showing placeholder "coming in Sprint 7" card | Tabs render and switch correctly | `[ ]` |
| 3.4.5 | Create `components/features/dashboard/GoalSummaryCard.tsx` — placeholder showing "coming in Sprint 6" for each goal from seed data | Cards render with goal names | `[ ]` |
| 3.4.6 | Create `components/features/dashboard/MonthlyPlanSummary.tsx` — placeholder "Monthly plan coming in Sprint 8" | Card renders | `[ ]` |

#### 3.5 Holdings Page

| # | Task | Acceptance Criteria | Status |
|---|------|---------------------|--------|
| 3.5.1 | Create `app/holdings/page.tsx` — fetches holdings list, renders in shadcn `Table` | Page loads with seed data | `[ ]` |
| 3.5.2 | Create `lib/queries/useHoldings.ts` — `useQuery` for GET `/api/holdings`, `useMutation` for POST/PUT/DELETE | Hooks exported and typed | `[ ]` |
| 3.5.3 | "Add Holding" — shadcn `Dialog` with a form (react-hook-form + zod validation): Name, HoldingType, AccountId, Units, PurchaseNav, CurrentNav, AsOf | Dialog opens; form submits; holding appears in table; dialog closes | `[ ]` |
| 3.5.4 | "Edit Holding" — same Dialog pre-populated with existing values | Correct values shown; update persists | `[ ]` |
| 3.5.5 | "Delete Holding" — shadcn `AlertDialog` for confirmation before deleting | Confirmation shown; delete removes row; net worth updates | `[ ]` |
| 3.5.6 | Client-side validation via zod: required fields, units ≥ 0, NAV > 0 | Form shows inline errors before submitting | `[ ]` |
| 3.5.7 | Empty state when no holdings exist | Empty state component renders with "Add your first holding" CTA | `[ ]` |

#### 3.6 Goals Page

| # | Task | Acceptance Criteria | Status |
|---|------|---------------------|--------|
| 3.6.1 | Create `app/goals/page.tsx` — fetches goals, renders as card list | Page loads with seed data | `[ ]` |
| 3.6.2 | Create `lib/queries/useGoals.ts` | Hooks exported and typed | `[ ]` |
| 3.6.3 | "Add Goal" — Dialog with form: Name, TargetAmount, TargetDate, Priority, asset allocation inputs (equity %, debt %, gold %, cash %) | Allocation inputs show live validation "must sum to 100" | `[ ]` |
| 3.6.4 | "Edit Goal" Dialog pre-populated | Update persists correctly | `[ ]` |
| 3.6.5 | Pause / Resume Goal — button on each card calls PATCH endpoint; card status updates | Status badge changes immediately (optimistic update) | `[ ]` |
| 3.6.6 | Empty state when no goals | Empty state renders | `[ ]` |

#### 3.7 Transactions Page

| # | Task | Acceptance Criteria | Status |
|---|------|---------------------|--------|
| 3.7.1 | Create `app/transactions/page.tsx` — lists last 30 transactions in a Table | Page loads | `[ ]` |
| 3.7.2 | Month/account filter — shadcn `Select` components; changing either updates the TanStack Query key, triggering a refetch | Filter works; table updates without page reload | `[ ]` |
| 3.7.3 | "Add Transaction" — Dialog with form | Transaction saved; table refreshes | `[ ]` |

#### 3.8 SIP Plans Page

| # | Task | Acceptance Criteria | Status |
|---|------|---------------------|--------|
| 3.8.1 | Create `app/sips/page.tsx` — lists SIP plans in a Table with fund name, amount, SIP date, status, linked goal | Page loads with seed data | `[ ]` |
| 3.8.2 | "Add SIP Plan" Dialog | SIP plan saved; table refreshes | `[ ]` |
| 3.8.3 | Pause / Resume SIP — button on each row | Status toggles; row updates | `[ ]` |

#### 3.9 .NET API Tests

| # | Task | Acceptance Criteria | Status |
|---|------|---------------------|--------|
| 3.9.1 | Integration tests for `AddHoldingCommand` handler — valid input saves, invalid input returns validation error | Tests pass | `[ ]` |
| 3.9.2 | Integration tests for `AddGoalCommand` handler — invalid allocation throws | Test passes | `[ ]` |
| 3.9.3 | Integration tests for `GetNetWorthQuery` — returns correct sum from known seed data | Test passes | `[ ]` |
| 3.9.4 | Integration tests confirming CORS header present on API responses | Test passes | `[ ]` |

#### 3.10 Documentation

| # | Task | Acceptance Criteria | Status |
|---|------|---------------------|--------|
| 3.10.1 | Add interview note: why Next.js App Router — Server Components for initial load, Client Components for interactivity, where the boundary sits | Written | `[ ]` |
| 3.10.2 | Add interview note: TanStack Query — why it over raw `useEffect` + `fetch`, what `invalidateQueries` gives you, optimistic updates | Written | `[ ]` |
| 3.10.3 | Add interview note: CQRS lite — separating reads (Queries) from writes (Commands) without full CQRS infrastructure | Written | `[ ]` |
| 3.10.4 | Update `docs/sprint-log.md` | Written | `[ ]` |

---

### Out of Scope — Sprint 3

- No file uploads (CAS, bank statement) — Sprint 4 and 9
- No SIP performance analytics — Sprint 5
- No goal probability — Sprint 6
- No recommendations — Sprint 7
- No charts or graphs — deferred until data is real

---

### Definition of Done — Sprint 3

- [ ] Next.js app runs on port 3000, calls .NET API on port 5000 without CORS errors
- [ ] Can add/edit/delete holdings via Dialog forms
- [ ] Can add/edit goals with asset allocation validation
- [ ] Dashboard shows correct net worth from seed data, auto-refreshes every 60s
- [ ] Transactions page loads and filters by month/account
- [ ] SIP plans page loads with create/pause actions
- [ ] Client-side zod validation on all forms
- [ ] Empty states on all list pages
- [ ] `dotnet test` passes
- [ ] `npm run build` passes (no TypeScript errors)
- [ ] All three CI pipelines green

---

### Interview Talking Points — Sprint 3

- Next.js App Router: Server vs Client Components — the boundary decision, why it matters for performance
- TanStack Query: what problem it solves over raw fetch + useEffect, cache invalidation strategy
- CQRS lite: why separating queries and commands even without a full CQRS bus
- Zod + react-hook-form: client validation as UX, server validation as truth — why both

---

---

## Sprint 4 — CAS Upload via Python Service (First Polyglot Cut)

**Goal:** The first Python service is up. Upload a CAS PDF from CAMS/KARVY and mutual fund holdings are populated automatically.

**Estimated effort:** 25–30 hours

**Status:** `[ ] Not started`

**Depends on:** Sprint 3 complete and green

---

### Tasks

#### 4.1 Python Service Scaffold

| # | Task | Acceptance Criteria | Status |
|---|------|---------------------|--------|
| 4.1.1 | Create `src/analytics-service/` folder structure: `app/`, `tests/`, `pyproject.toml`, `Dockerfile`, `README.md` | Structure exists | `[ ]` |
| 4.1.2 | Set up `pyproject.toml` with dependencies: `fastapi`, `uvicorn`, `pydantic`, `casparser`, `python-multipart`, `pytest`, `httpx` | `pip install -e .` succeeds | `[ ]` |
| 4.1.3 | Create `app/main.py` with FastAPI app instance, CORS configured, `/health` endpoint returning `{"status": "healthy"}` | `uvicorn app.main:app` starts; `/health` returns 200 | `[ ]` |
| 4.1.4 | Create Dockerfile for analytics service: Python 3.11, installs dependencies, runs uvicorn | `docker build` succeeds | `[ ]` |
| 4.1.5 | Add analytics service to `docker-compose.yml` on port 8000, with health check | `docker compose up` starts both services | `[ ]` |
| 4.1.6 | Update `.github/workflows/python-ci.yml`: install deps, run `pytest`, lint with `ruff` | CI passes on push | `[ ]` |

#### 4.2 CAS Parsing Endpoint

| # | Task | Acceptance Criteria | Status |
|---|------|---------------------|--------|
| 4.2.1 | Create Pydantic models: `CasHolding` (fund_name, fund_code, units, nav, value, folio, isin), `CasParseResponse` (holdings: list[CasHolding], statement_date, investor_name, total_value) | Models defined with correct types | `[ ]` |
| 4.2.2 | Create `POST /parse-cas` endpoint accepting multipart file upload | Endpoint exists and accepts files | `[ ]` |
| 4.2.3 | Implement `casparser` usage: call `casparser.read_cas_pdf(file_bytes, password)` and map output to `CasParseResponse` | Given a real CAS PDF, returns structured JSON | `[ ]` |
| 4.2.4 | Handle password-protected PDFs: accept optional `password` field in form data | Password-protected CAS PDF parsed correctly | `[ ]` |
| 4.2.5 | Handle invalid file: return 422 with clear error message if file is not a valid CAS PDF | Verified with wrong file type | `[ ]` |
| 4.2.6 | Handle `casparser` exceptions gracefully — wrap in try/except, return structured error response | No 500 errors with bad input | `[ ]` |
| 4.2.7 | Write pytest tests for the endpoint using a real CAS PDF fixture (use a test/dummy CAS if real not available) | Tests pass; at least one happy path and one error path | `[ ]` |

#### 4.3 .NET Service — Analytics Interface and HTTP Client

| # | Task | Acceptance Criteria | Status |
|---|------|---------------------|--------|
| 4.3.1 | Define `IAnalyticsService` interface in Application layer with method: `Task<CasParseResult> ParseCasAsync(Stream pdfStream, string? password)` | Interface defined | `[ ]` |
| 4.3.2 | Define `CasParseResult` DTO in Application layer (mirrors Python response) | DTO defined | `[ ]` |
| 4.3.3 | Create `AnalyticsServiceClient` in Infrastructure implementing `IAnalyticsService`, using `HttpClient` to call `POST /parse-cas` | Client compiles; DI registered | `[ ]` |
| 4.3.4 | Configure `HttpClient` with base URL from config (`AnalyticsService:BaseUrl`) | URL reads from `appsettings.json` / environment variable | `[ ]` |
| 4.3.5 | Add Polly resilience pipeline to the `HttpClient`: retry 3 times with exponential backoff (1s, 2s, 4s), circuit breaker (5 failures in 30s → open for 30s), timeout 30s | Polly pipeline configured and unit testable | `[ ]` |
| 4.3.6 | Add correlation ID header (`X-Correlation-ID`) to all outbound requests from .NET to Python | Verified in Python service logs | `[ ]` |

#### 4.4 CAS Upload UI (Next.js)

| # | Task | Acceptance Criteria | Status |
|---|------|---------------------|--------|
| 4.4.1 | Create `app/upload/page.tsx` with `react-dropzone` file drop zone for CAS PDF, optional password input, submit button | Page renders; drag-and-drop zone is styled per design.md | `[ ]` |
| 4.4.2 | On upload, POST to `.NET /api/upload/cas` (multipart), which calls Python and upserts holdings | After upload, holdings page shows newly imported holdings | `[ ]` |
| 4.4.3 | Show upload progress — TanStack Query mutation `isPending` state drives a spinner; success shows toast with "X holdings imported, Y updated" | UX works end-to-end | `[ ]` |
| 4.4.4 | Show inline error if Python service is down or PDF is invalid — error text below the dropzone, not a toast | Error visible in UI; no unhandled exceptions | `[ ]` |
| 4.4.5 | Store upload event in a `CasUploadLog` table (timestamp, filename, holdings count, status); show upload history list on the page | Log entry and history list visible after each upload | `[ ]` |

#### 4.5 Tests

| # | Task | Acceptance Criteria | Status |
|---|------|---------------------|--------|
| 4.5.1 | Unit test for `AnalyticsServiceClient` using `MockHttpMessageHandler` — happy path returns mapped DTO | Test passes | `[ ]` |
| 4.5.2 | Unit test: Python service returns 500 → after 3 retries, throws `AnalyticsServiceException` | Test passes | `[ ]` |
| 4.5.3 | Integration test for CAS upload page handler: mock `IAnalyticsService`, verify holdings are upserted correctly | Test passes | `[ ]` |

#### 4.6 Documentation

| # | Task | Acceptance Criteria | Status |
|---|------|---------------------|--------|
| 4.6.1 | Add interview note: why this is the first service extracted to Python (casparser, domain fit, no good .NET equivalent) | Written | `[ ]` |
| 4.6.2 | Add interview note: resilience with Polly — retry vs circuit breaker — when to use which, why both together | Written | `[ ]` |
| 4.6.3 | Add interview note: service contract design — what Python needs, what it returns, how contracts evolve, versioning strategy | Written | `[ ]` |
| 4.6.4 | Update `docs/sprint-log.md` | Written | `[ ]` |

---

### Out of Scope — Sprint 4

- Bank statement parsing — Sprint 9
- XIRR calculation — Sprint 5
- NAV history fetching — Sprint 5

---

### Definition of Done — Sprint 4

- [ ] Python analytics service runs in docker-compose
- [ ] `POST /parse-cas` endpoint parses a real CAS PDF and returns structured JSON
- [ ] .NET service calls Python with Polly resilience
- [ ] CAS upload page imports holdings into DB
- [ ] Error handling for: Python service down, invalid PDF, password protected PDF
- [ ] Python CI pipeline green
- [ ] .NET CI green
- [ ] Interview notes written

---

### Interview Talking Points — Sprint 4

- First polyglot extraction: what drove the decision, how you know it was the right time
- HTTP vs message queue for synchronous request-response: why REST here
- Polly: retry with exponential backoff, circuit breaker, why both — the avalanche problem
- Service contracts: versioning (URI vs header), what happens when Python changes its response shape
- Correlation IDs: why they matter in a distributed system, how you trace a request end-to-end

---

---

## Sprint 5 — XIRR, Benchmarks, and SIP Health View

**Goal:** For each SIP, the app shows XIRR, benchmark comparison, and a health status badge.

**Estimated effort:** 25–30 hours

**Status:** `[ ] Not started`

**Depends on:** Sprint 4 complete and green

---

### Tasks

#### 5.1 Python — XIRR Endpoint

| # | Task | Acceptance Criteria | Status |
|---|------|---------------------|--------|
| 5.1.1 | Create Pydantic model `XirrRequest`: `cashflows: list[dict(date, amount)]` where negative amounts are investments, positive are redemptions/current value | Model defined | `[ ]` |
| 5.1.2 | Create `POST /compute-xirr` endpoint using `numpy_financial.irr` with Newton-Raphson iteration | Returns annualised XIRR as a float | `[ ]` |
| 5.1.3 | Handle edge cases: single cashflow (return 0), identical dates, convergence failure | No 500 errors on edge cases | `[ ]` |
| 5.1.4 | Verify XIRR against a known Excel calculation: 3 cashflows, expected ~12% annualised | Manual verification documented in test comment | `[ ]` |
| 5.1.5 | Write pytest tests: at least 3 cashflow scenarios including one manually verified against Excel | Tests pass | `[ ]` |

#### 5.2 Python — NAV History and Benchmark Endpoints

| # | Task | Acceptance Criteria | Status |
|---|------|---------------------|--------|
| 5.2.1 | Create `GET /nav-history?fund_code={amfi_code}&from_date={date}&to_date={date}` using `mftool` | Returns list of `{date, nav}` for given fund | `[ ]` |
| 5.2.2 | Create `GET /benchmark?index={NIFTY50TRI}&from_date={date}&to_date={date}` fetching index levels | Returns list of `{date, level}` | `[ ]` |
| 5.2.3 | Add in-memory LRU cache (using `functools.lru_cache` or `cachetools`) for NAV history — TTL 24 hours | Second call for same fund+dates returns from cache without hitting external API | `[ ]` |
| 5.2.4 | Handle external API rate limits and timeouts — retry with backoff | No 500 errors when mftool is slow | `[ ]` |

#### 5.3 .NET — Nightly NAV Refresh Job

| # | Task | Acceptance Criteria | Status |
|---|------|---------------------|--------|
| 5.3.1 | Add Hangfire NuGet packages to Infrastructure; configure with Postgres storage | Hangfire dashboard accessible at `/hangfire` | `[ ]` |
| 5.3.2 | Create `NavRefreshJob` that runs nightly at 9PM IST: for each active SIP plan, call Python `/nav-history`, store latest NAV in `Holding.CurrentNav` and `Holding.AsOf` | After job runs, holdings have updated NAV values | `[ ]` |
| 5.3.3 | Create `XirrCalculationJob` that runs after NAV refresh: for each SIP plan, fetch transaction history, call Python `/compute-xirr`, store result in `SipPlan.LatestXirr` | XIRR values updated in DB | `[ ]` |
| 5.3.4 | Add `SipPlan.LatestXirr` (nullable decimal), `SipPlan.XirrCalculatedAt` fields; create migration | Migration applied | `[ ]` |
| 5.3.5 | Add Hangfire recurring job registration: both jobs registered in `Program.cs` with cron expressions | Jobs visible in Hangfire dashboard | `[ ]` |
| 5.3.6 | Log job start, completion, and any per-SIP failures with structured fields | Logs visible in console output | `[ ]` |

#### 5.4 SIP Status Logic

| # | Task | Acceptance Criteria | Status |
|---|------|---------------------|--------|
| 5.4.1 | Create `SipStatusEvaluator` in Application: takes SIP XIRR and benchmark XIRR, returns `SipStatus` enum (Healthy, Watch, Act) | Logic: XIRR ≥ benchmark − 1% → Healthy; benchmark − 3% to −1% → Watch; < benchmark − 3% → Act | `[ ]` |
| 5.4.2 | Add threshold constants to configuration (not hard-coded) | Thresholds in `appsettings.json` | `[ ]` |
| 5.4.3 | Add `SipPlan.Status` field, update via job after XIRR calculation | Status persisted in DB | `[ ]` |
| 5.4.4 | Unit tests for `SipStatusEvaluator`: healthy case, watch case, act case, equal to threshold, missing benchmark | All pass | `[ ]` |

#### 5.5 SIP Health View Page (Next.js)

| # | Task | Acceptance Criteria | Status |
|---|------|---------------------|--------|
| 5.5.1 | Create `app/sips/page.tsx`: shadcn Table of all SIP plans with columns: Fund Name, Monthly Amount, Current Value, XIRR, Benchmark, Differential, Status badge | Page renders with data from DB | `[ ]` |
| 5.5.2 | Create `app/sips/[id]/page.tsx` — SIP detail drill-down: fund stats + NAV vs benchmark history as a table (no chart library yet) | Drill-down page loads; clicking a row in the list navigates here | `[ ]` |
| 5.5.3 | "Last updated" timestamp on index page showing when NAV was last refreshed | Timestamp visible | `[ ]` |
| 5.5.4 | Manual refresh button — calls `POST /api/sips/:id/refresh` which enqueues a Hangfire job; button shows loading state via TanStack Query `isPending` then refetches the row | Button works; data updates after a few seconds | `[ ]` |

#### 5.6 Tests

| # | Task | Acceptance Criteria | Status |
|---|------|---------------------|--------|
| 5.6.1 | Unit tests for `SipStatusEvaluator` — all threshold cases | Pass | `[ ]` |
| 5.6.2 | Integration test for `NavRefreshJob` with mocked `IAnalyticsService` | Job updates NAV in DB | `[ ]` |
| 5.6.3 | Integration test for `XirrCalculationJob` with known transactions | XIRR matches expected value (within 0.01%) | `[ ]` |

#### 5.7 Documentation

| # | Task | Acceptance Criteria | Status |
|---|------|---------------------|--------|
| 5.7.1 | Add interview note: background jobs with Hangfire — recurring vs enqueued, Postgres storage vs Redis, dashboard | Written | `[ ]` |
| 5.7.2 | Add interview note: XIRR — what it is, why CAGR is insufficient for SIP analysis, how Newton-Raphson works at a high level | Written | `[ ]` |
| 5.7.3 | Add interview note: caching strategy — TTL choice, cache invalidation, why in-memory cache is fine for this scale | Written | `[ ]` |
| 5.7.4 | Document the XIRR manual verification calculation in `docs/` | Calculation with known inputs and expected output | `[ ]` |
| 5.7.5 | Update `docs/sprint-log.md` | Written | `[ ]` |

---

### Definition of Done — Sprint 5

- [ ] XIRR endpoint in Python returns verified results
- [ ] NAV history and benchmark endpoints working with caching
- [ ] Nightly Hangfire jobs update NAV and XIRR for all active SIPs
- [ ] SIP Health View shows XIRR, benchmark differential, and status badge
- [ ] XIRR manually verified against Excel for at least one known case
- [ ] CI green
- [ ] Interview notes written

---

---

## Sprint 6 — Goal Engine with Monte Carlo Probability

**Goal:** Each goal shows a probability of being achieved on time, with percentile bands.

**Estimated effort:** 20–25 hours

**Status:** `[ ] Not started`

**Depends on:** Sprint 5 complete and green

---

### Tasks

#### 6.1 Python — Monte Carlo Endpoint

| # | Task | Acceptance Criteria | Status |
|---|------|---------------------|--------|
| 6.1.1 | Create Pydantic model `MonteCarloRequest`: `current_corpus`, `monthly_contribution`, `target_amount`, `months_remaining`, `expected_annual_return`, `annual_volatility`, `simulations` (default 10000) | Model defined | `[ ]` |
| 6.1.2 | Create Pydantic model `MonteCarloResponse`: `probability_of_success`, `p10_corpus`, `p50_corpus`, `p90_corpus`, `simulated_paths_summary` (list of monthly percentiles) | Model defined | `[ ]` |
| 6.1.3 | Implement `POST /run-monte-carlo` using `numpy`: run N simulations of monthly compounding with normally distributed returns, count simulations reaching target | Endpoint returns plausible probability | `[ ]` |
| 6.1.4 | Verify Monte Carlo against a deterministic case: if volatility = 0, probability should be 100% (if return is adequate) or 0% | Manual verification documented | `[ ]` |
| 6.1.5 | Verify against a known reference: 20-year, ₹5L current corpus, ₹10k/month, 12% expected return, 15% volatility — probability should be roughly 85–95% | Spot-check result in reasonable range | `[ ]` |
| 6.1.6 | Run with 10,000 simulations in < 500ms | `pytest-benchmark` or manual timing confirms | `[ ]` |
| 6.1.7 | Write pytest tests: zero volatility → deterministic result, high volatility → wider bands, zero contribution → lower probability | Tests pass | `[ ]` |

#### 6.2 .NET — Goal Probability Fields and Calculation Job

| # | Task | Acceptance Criteria | Status |
|---|------|---------------------|--------|
| 6.2.1 | Add fields to `Goal`: `ProbabilityOfSuccess` (decimal nullable), `P10Corpus` (decimal nullable), `P50Corpus` (decimal nullable), `P90Corpus` (decimal nullable), `ProbabilityCalculatedAt` (DateTimeOffset nullable) | Migration created and applied | `[ ]` |
| 6.2.2 | Add per-asset-class expected return and volatility config to `appsettings.json`: equity (12% return, 18% vol), debt (7% return, 3% vol), gold (9% return, 12% vol) | Config documented with source of assumptions | `[ ]` |
| 6.2.3 | Create `GoalProbabilityCalculationJob` Hangfire job (weekly): for each active goal, compute blended expected return and volatility from asset allocation, call Python `/run-monte-carlo`, store results | After job runs, goal records have probability values | `[ ]` |
| 6.2.4 | Extend `IAnalyticsService` with `Task<MonteCarloResult> RunMonteCarloAsync(MonteCarloRequest request)` | Interface and implementation updated | `[ ]` |

#### 6.3 Goal Detail Page and Dashboard Update

| # | Task | Acceptance Criteria | Status |
|---|------|---------------------|--------|
| 6.3.1 | Update `app/goals/page.tsx` — add `ProbabilityBadge` component to each goal card (e.g., "87% on track"), coloured by threshold | Probabilities visible after job has run | `[ ]` |
| 6.3.2 | Create `app/goals/[id]/page.tsx` showing: current corpus, target amount, monthly contribution, expected completion, probability, P10/P50/P90 corpus projections as a shadcn Table | Page loads and shows correct data | `[ ]` |
| 6.3.3 | Add projected completion date calculation: `P50Corpus` timeline — how many months until P50 hits target | Displayed on detail page | `[ ]` |
| 6.3.4 | Update dashboard goal summary cards to show name, target amount, probability badge, and days-to-deadline | Dashboard cards updated | `[ ]` |

#### 6.4 Tests

| # | Task | Acceptance Criteria | Status |
|---|------|---------------------|--------|
| 6.4.1 | Unit test for blended expected return and volatility calculation given an asset allocation | Test passes | `[ ]` |
| 6.4.2 | Integration test for `GoalProbabilityCalculationJob` with mocked `IAnalyticsService` | Job stores results in DB | `[ ]` |

#### 6.5 Documentation

| # | Task | Acceptance Criteria | Status |
|---|------|---------------------|--------|
| 6.5.1 | Add interview note: Monte Carlo simulation for financial planning — why stochastic over deterministic, how to explain probability to a user without creating false confidence | Written | `[ ]` |
| 6.5.2 | Add interview note: documenting assumptions — where the expected return and volatility numbers come from, why they are configurable | Written | `[ ]` |
| 6.5.3 | Update `docs/sprint-log.md` | Written | `[ ]` |

---

### Definition of Done — Sprint 6

- [ ] Monte Carlo endpoint verified against deterministic edge cases
- [ ] Weekly Hangfire job calculates and stores probabilities for all active goals
- [ ] Goal index shows probability badges
- [ ] Goal detail page shows percentile projections
- [ ] CI green

---

---

## Sprint 7 — Recommendation Engine and Action/Watch/Win Generation

**Goal:** The rules engine produces structured recommendations. Dashboard shows current Actions, Watches, and Wins.

**Estimated effort:** 25–30 hours

**Status:** `[ ] Not started`

**Depends on:** Sprint 6 complete and green

---

### Tasks

#### 7.1 Rules Engine Framework

| # | Task | Acceptance Criteria | Status |
|---|------|---------------------|--------|
| 7.1.1 | Create `IRecommendationRule` interface in Application: `string RuleId { get; }`, `RuleCategory Category { get; }`, `IEnumerable<Recommendation> Evaluate(UserFinancialContext context)` | Interface defined | `[ ]` |
| 7.1.2 | Create `UserFinancialContext` object: holds all data a rule needs — accounts, holdings, goals, sip plans, latest transactions (last 90 days), existing recommendations, config | Object defined in Application layer | `[ ]` |
| 7.1.3 | Create `Recommendation` value object: `RuleId`, `Type` (Action/Watch/Win), `Category`, `Severity` (Info/Watch/ActNow), `Title` (≤ 80 chars), `Body` (≤ 300 chars), `SupportingData` (dictionary) | Value object with immutable constructor | `[ ]` |
| 7.1.4 | Create `RecommendationEngine` in Application: takes list of `IRecommendationRule`, evaluates all rules against context, deduplicates by RuleId (prevents same recommendation twice in same month), returns list of `Recommendation` | Engine works, deduplication confirmed in unit test | `[ ]` |
| 7.1.5 | Create `GenerateRecommendationsJob` Hangfire weekly job: builds `UserFinancialContext`, runs `RecommendationEngine`, persists results to `RecommendationLog`, marks previous week's recommendations as superseded | Job runs and writes to DB | `[ ]` |

#### 7.2 SIP Rules

| # | Task | Acceptance Criteria | Status |
|---|------|---------------------|--------|
| 7.2.1 | Rule `SipUnderperformanceWatch`: triggers Watch when SIP XIRR is 1–3% below benchmark | Unit test: at-threshold → Watch | `[ ]` |
| 7.2.2 | Rule `SipUnderperformanceAct`: triggers Act when SIP XIRR is > 3% below benchmark | Unit test: below threshold → Act | `[ ]` |
| 7.2.3 | Rule `SipStepUpDue`: triggers Action in April if any SIP has a step-up rule due (e.g., 10% annual increase in April) | Unit test: April, step-up configured → Action generated | `[ ]` |
| 7.2.4 | Rule `IdleSurplusInvest`: triggers Action when savings account balance exceeds 3 months of expenses by > ₹25,000 for 2+ months | Unit test: surplus condition met → Action | `[ ]` |

#### 7.3 Goal Rules

| # | Task | Acceptance Criteria | Status |
|---|------|---------------------|--------|
| 7.3.1 | Rule `GoalOffTrack`: triggers Watch when goal probability < 75%; triggers Act when probability < 50% | Unit tests for both thresholds | `[ ]` |
| 7.3.2 | Rule `GoalOnTrack`: triggers Win when goal probability ≥ 90% | Unit test: high probability → Win | `[ ]` |
| 7.3.3 | Rule `GoalFundingShortfall`: triggers Action when a goal is off-track and there is a well-performing SIP that can be increased | Logic: find SIP linked to goal with status Healthy, calculate increase needed | `[ ]` |

#### 7.4 Emergency Fund and Debt Rules

| # | Task | Acceptance Criteria | Status |
|---|------|---------------------|--------|
| 7.4.1 | Rule `EmergencyFundLow`: triggers Act when emergency fund balance < 3 months of fixed expenses; triggers Watch when < 6 months | Unit tests: < 3 months → Act, 3–6 months → Watch | `[ ]` |
| 7.4.2 | Rule `EmergencyFundComplete`: triggers Win when emergency fund ≥ 6 months for the first time (detected by checking last month's level) | Unit test: crosses 6 months threshold → Win | `[ ]` |
| 7.4.3 | Rule `HighCostDebt`: triggers Act when credit card revolving balance > 0 (any unpaid balance at month end is revolving) | Unit test: positive CC balance → Act | `[ ]` |

#### 7.5 Tax Rules

| # | Task | Acceptance Criteria | Status |
|---|------|---------------------|--------|
| 7.5.1 | Rule `Tax80CReminder`: triggers Watch in January, Act in February if 80C bucket < ₹1.5L | Unit tests for both months and thresholds | `[ ]` |
| 7.5.2 | Rule `AdvanceTaxReminder`: triggers Watch in March and June if estimated capital gains suggest advance tax due | Simplified: if total realised gains > ₹1L in the year, trigger reminder | `[ ]` |

#### 7.6 Dashboard Update

| # | Task | Acceptance Criteria | Status |
|---|------|---------------------|--------|
| 7.6.1 | Replace placeholder `RecommendationFeed` on dashboard with real data from `GET /api/recommendations`; tabs: Actions / Watches / Wins | Real recommendations visible on dashboard | `[ ]` |
| 7.6.2 | Each recommendation card shows: left border coloured by severity, title, body, category tag, date generated | Cards render correctly | `[ ]` |
| 7.6.3 | Mark recommendation as read — X button calls `PATCH /api/recommendations/:id/read` via TanStack mutation; card fades out via optimistic update | Read recommendations removed from feed immediately | `[ ]` |
| 7.6.4 | "Actions" count badge in sidebar nav — driven by `useRecommendations()` query, updates when recommendations are read | Badge shows unread action count | `[ ]` |

#### 7.7 Tests

| # | Task | Acceptance Criteria | Status |
|---|------|---------------------|--------|
| 7.7.1 | Unit test for every rule — at minimum: condition met → correct recommendation, condition not met → no recommendation | All pass | `[ ]` |
| 7.7.2 | Unit test for `RecommendationEngine` deduplication: same rule evaluated twice → one recommendation | Passes | `[ ]` |
| 7.7.3 | Integration test for `GenerateRecommendationsJob` with crafted context | Recommendations persisted in DB | `[ ]` |

#### 7.8 Documentation

| # | Task | Acceptance Criteria | Status |
|---|------|---------------------|--------|
| 7.8.1 | Add interview note: rules engine pattern — why this over hard-coded if-else, how rules are extensible, how conflicts are resolved (evaluation order, deduplication) | Written | `[ ]` |
| 7.8.2 | Add interview note: `UserFinancialContext` as a read model — why building the full context before rules run is better than querying DB inside each rule | Written | `[ ]` |
| 7.8.3 | Update `docs/sprint-log.md` | Written | `[ ]` |

---

### Definition of Done — Sprint 7

- [ ] All 12 rules implemented with unit tests
- [ ] `RecommendationEngine` with deduplication working
- [ ] Weekly Hangfire job generates and persists recommendations
- [ ] Dashboard shows Actions, Watches, Wins from DB
- [ ] Mark-as-read works via HTMX
- [ ] CI green

---

---

## Sprint 8 — Monthly Plan Composition and LLM Narrative

**Goal:** On the 1st of every month, the system composes a full monthly plan and the LLM writes the narrative. Plan lands in the dashboard and email.

**Estimated effort:** 30–35 hours (most thinking-heavy sprint)

**Status:** `[ ] Not started`

**Depends on:** Sprint 7 complete and green

---

### Tasks

#### 8.1 Python — LLM Narrative Endpoint

| # | Task | Acceptance Criteria | Status |
|---|------|---------------------|--------|
| 8.1.1 | Add `anthropic` Python SDK to `pyproject.toml` | Package installed | `[ ]` |
| 8.1.2 | Create Pydantic model `NarrativeRequest`: `plan_type` (monthly_plan / weekly_watch / sip_analysis), `structured_data` (dict — the JSON the LLM will narrate), `user_name` (string), `tone` (concise / detailed) | Model defined | `[ ]` |
| 8.1.3 | Create `POST /generate-narrative` endpoint | Endpoint exists | `[ ]` |
| 8.1.4 | Write the system prompt: instructs the model to write in second-person, use only numbers from `structured_data`, never invent figures, be concise (≤ 200 words for monthly plan), end with one direct instruction for the user | Prompt in a separate `prompts/` module, version-tagged | `[ ]` |
| 8.1.5 | Call `claude-haiku-4-5` (or latest Haiku) via the Anthropic SDK; return generated narrative as string | API call works with a real API key | `[ ]` |
| 8.1.6 | Add guardrail: if LLM response contains any digit that is NOT present in `structured_data`, log a warning and return a fallback message instead | Guardrail implemented and tested | `[ ]` |
| 8.1.7 | Handle API errors: Anthropic 429 (rate limit) → retry after delay; Anthropic 500 → fallback to template narrative | Fallback tested | `[ ]` |
| 8.1.8 | Add `ANTHROPIC_API_KEY` to `.env.example` and environment variable configuration | Key is never committed to repo | `[ ]` |
| 8.1.9 | Write pytest tests: mock Anthropic SDK; verify guardrail triggers on invented numbers; verify fallback on API error | Tests pass | `[ ]` |

#### 8.2 .NET — Monthly Plan Composer

| # | Task | Acceptance Criteria | Status |
|---|------|---------------------|--------|
| 8.2.1 | Create `MonthlyPlan` aggregate in Domain: `Id`, `PlanMonth` (first day of month), `TotalInflow`, `TotalFixedObligations`, `TotalVariableExpenses`, `ComputedSurplus`, `ActionItems` (list), `WatchItems` (list), `WinItems` (list), `Narrative`, `GeneratedAt` | Aggregate in Domain project | `[ ]` |
| 8.2.2 | Create `MonthlyPlanComposer` in Application implementing the 10-step sequence from section 6 of `planning.md` | Composer class with injected dependencies | `[ ]` |
| 8.2.3 | Step 1 — Income reconciliation: detect largest credit in month as salary; sum all credits | Returns `TotalInflow` | `[ ]` |
| 8.2.4 | Step 2 — Fixed obligations: sum categorised fixed transactions (rent, EMI, insurance, subscriptions, SIPs) | Returns `TotalFixedObligations` | `[ ]` |
| 8.2.5 | Step 3 — Variable expense forecast: average of last 3 months' discretionary spending | Returns `VariableEstimate` | `[ ]` |
| 8.2.6 | Step 4 — Compute surplus = Inflow − Fixed − Variable | Returns `ComputedSurplus` | `[ ]` |
| 8.2.7 | Step 5 — Emergency fund check: compare emergency fund balance to 6× fixed obligations; if short, add Action | Action added to plan if condition met | `[ ]` |
| 8.2.8 | Step 6 — High-cost debt check: if any CC balance > 0, add Act-Now action | Action added if condition met | `[ ]` |
| 8.2.9 | Step 7 — Goal-based allocation: split remaining surplus across active goals by priority and shortfall | Allocation plan added to Actions | `[ ]` |
| 8.2.10 | Step 8 — Market context overlay: check Nifty PE from config/latest fetched value; add Watch if PE > 90th percentile | Watch added if condition met | `[ ]` |
| 8.2.11 | Step 9 — Tax timing: month-appropriate tax reminder rule | Reminder added based on current month | `[ ]` |
| 8.2.12 | Step 10 — Call Python `/generate-narrative` with structured plan JSON, store narrative in `MonthlyPlan.Narrative` | Narrative stored in DB | `[ ]` |
| 8.2.13 | Create migration for `MonthlyPlans` table | Migration applied | `[ ]` |
| 8.2.14 | Create `MonthlyPlanGenerationJob` Hangfire job: cron `0 6 1 * *` (6AM IST on the 1st) → runs composer, persists plan, sends email | Job registered | `[ ]` |

#### 8.3 Email Delivery

| # | Task | Acceptance Criteria | Status |
|---|------|---------------------|--------|
| 8.3.1 | Add `IEmailService` interface in Application: `Task SendMonthlyPlanAsync(MonthlyPlan plan)`, `Task SendWeeklyDigestAsync(...)` | Interface defined | `[ ]` |
| 8.3.2 | Implement `SmtpEmailService` in Infrastructure using `MailKit` or System.Net.Mail against a free SMTP provider (Brevo, Mailgun free tier) | Email sends successfully to my Gmail | `[ ]` |
| 8.3.3 | Create monthly plan email HTML template: plan narrative at top, then Actions / Watches / Wins as sections, clean minimal design | Email renders correctly in Gmail | `[ ]` |
| 8.3.4 | Add SMTP config to `appsettings.json` and `.env.example` (host, port, user, password) | Config reads from environment; no credentials committed | `[ ]` |

#### 8.4 Monthly Plan Page (Next.js)

| # | Task | Acceptance Criteria | Status |
|---|------|---------------------|--------|
| 8.4.1 | Create `app/plan/page.tsx` — fetches current month's plan via `GET /api/monthly-plan/current`, renders full plan | Page loads with the generated plan | `[ ]` |
| 8.4.2 | Display per design.md: indigo narrative block at top, Actions as numbered list, Watches as bullets, Wins as checkmarks, collapsible plan inputs | Layout clean and readable | `[ ]` |
| 8.4.3 | Previous plans — shadcn `Select` to switch between months; selecting one loads that plan via `GET /api/monthly-plan/:month` | History accessible | `[ ]` |
| 8.4.4 | "Generate Now" button — calls `POST /api/monthly-plan/generate` via mutation, shows loading state, toasts on success | Button enqueues Hangfire job; page refetches when done | `[ ]` |

#### 8.5 Dashboard Update

| # | Task | Acceptance Criteria | Status |
|---|------|---------------------|--------|
| 8.5.1 | Replace "Coming Soon" Monthly Plan card on dashboard with `MonthlyPlanSummary` component showing narrative excerpt + action count | Card shows real data | `[ ]` |
| 8.5.2 | "See Full Plan" link navigates to `/plan` | Link works | `[ ]` |

#### 8.6 Tests

| # | Task | Acceptance Criteria | Status |
|---|------|---------------------|--------|
| 8.6.1 | Unit tests for each step of `MonthlyPlanComposer` with crafted input data | All steps produce expected output | `[ ]` |
| 8.6.2 | Integration test for full composer: mock `IAnalyticsService` for narrative, verify all 10 steps run and `MonthlyPlan` is persisted | Test passes | `[ ]` |
| 8.6.3 | Test that LLM number guardrail in Python catches an invented number | Test passes | `[ ]` |

#### 8.7 Documentation

| # | Task | Acceptance Criteria | Status |
|---|------|---------------------|--------|
| 8.7.1 | Add interview note: structured prompting — why the LLM receives JSON not free text, why it never produces numbers, prompt versioning | Written | `[ ]` |
| 8.7.2 | Add interview note: the monthly plan algorithm — why this order of steps, what the guardrails are, how it is conservative | Written | `[ ]` |
| 8.7.3 | Document the system prompt in `docs/` with the rationale for each instruction | Documented | `[ ]` |
| 8.7.4 | Update `docs/sprint-log.md` | Written | `[ ]` |

---

### Definition of Done — Sprint 8

- [ ] Monthly plan generated on the 1st (or via "Generate Now") with all 10 steps
- [ ] LLM narrative generated and stored
- [ ] Email delivered to my inbox on generation
- [ ] Monthly Plan page shows plan and history
- [ ] Dashboard shows current plan summary
- [ ] LLM guardrail: invented numbers caught
- [ ] CI green

---

---

## Sprint 9 — Bank Statement Parsing and Cash Flow View

**Goal:** Upload a bank statement PDF and see cash flow for the month — income, categorised expenses, surplus.

**Estimated effort:** 25–30 hours

**Status:** `[ ] Not started`

**Depends on:** Sprint 8 complete and green

---

### Tasks

#### 9.1 Python — Bank Statement Parser

| # | Task | Acceptance Criteria | Status |
|---|------|---------------------|--------|
| 9.1.1 | Add `pdfplumber` to `pyproject.toml` | Installed | `[ ]` |
| 9.1.2 | Create Pydantic models: `ParsedTransaction` (date, description, debit, credit, balance), `BankStatementParseResponse` (account_number, statement_period, transactions: list[ParsedTransaction], bank_name) | Models defined | `[ ]` |
| 9.1.3 | Create `POST /parse-bank-statement` endpoint accepting multipart file upload with optional `bank_name` hint | Endpoint exists | `[ ]` |
| 9.1.4 | Implement parser for HDFC Bank statement format using `pdfplumber` table extraction | Correctly parses a real HDFC statement | `[ ]` |
| 9.1.5 | Implement parser for ICICI Bank statement format | Correctly parses a real ICICI statement | `[ ]` |
| 9.1.6 | Auto-detect bank format from PDF content (look for bank name in header text) | Correct bank detected without explicit hint | `[ ]` |
| 9.1.7 | Handle multi-page statements | All transactions across all pages returned | `[ ]` |
| 9.1.8 | Return parse errors with the line/page context that failed, not a generic 500 | Error response has useful debugging info | `[ ]` |
| 9.1.9 | Write pytest tests using anonymised fixture PDFs (personal data scrubbed) | Tests pass | `[ ]` |

#### 9.2 Transaction Categorisation

| # | Task | Acceptance Criteria | Status |
|---|------|---------------------|--------|
| 9.2.1 | Create `CategoryRule` model: `pattern` (regex), `category` (string), `priority` (int) | Model defined | `[ ]` |
| 9.2.2 | Create default category rules covering: Salary (SALARY, NEFT-[EMPLOYER]), Rent (RENT, HOUSING), Groceries (BIGBASKET, BLINKIT, ZEPTO, SWIGGY INSTAMART), Food (SWIGGY, ZOMATO), Fuel (HPCL, BPCL, IOCL, PETROL), Entertainment (NETFLIX, SPOTIFY, PRIME), Investments (SIP, MUTUAL FUND, ZERODHA), Health (PHARMACY, HOSPITAL, APOLLO), Travel (IRCTC, OLA, UBER, RAPIDO), Shopping (AMAZON, FLIPKART, MYNTRA), Utilities (ELECTRICITY, BROADBAND, MOBILE), Other | At least 10 categories with common Indian merchant names | `[ ]` |
| 9.2.3 | Expose `POST /categorise-transactions` endpoint: takes list of raw descriptions, returns list of categories | Endpoint works | `[ ]` |
| 9.2.4 | Integrate categorisation into bank statement parsing: each transaction in response includes `category` field | Category field populated in response | `[ ]` |

#### 9.3 .NET — Import and Storage

| # | Task | Acceptance Criteria | Status |
|---|------|---------------------|--------|
| 9.3.1 | Extend `IAnalyticsService` with `Task<BankStatementParseResult> ParseBankStatementAsync(Stream pdf)` | Interface and implementation updated | `[ ]` |
| 9.3.2 | Add bank statement upload section to existing `app/upload/page.tsx` — file dropzone + bank selector | Page renders with file input | `[ ]` |
| 9.3.3 | On upload: call `.NET POST /api/upload/bank-statement`, which calls Python, deduplicates (same date + amount + description), and saves to DB | After upload, transactions page shows new transactions; no duplicates on re-upload | `[ ]` |
| 9.3.4 | Show import summary toast: "X new transactions imported, Y duplicates skipped" | Summary shown via shadcn toast | `[ ]` |

#### 9.4 Category Management (Next.js)

| # | Task | Acceptance Criteria | Status |
|---|------|---------------------|--------|
| 9.4.1 | Create `CategoryRule` entity in Domain and DB table | Migration applied | `[ ]` |
| 9.4.2 | Create `app/settings/categories/page.tsx`: list existing rules, "Add Rule" Dialog (pattern, category), delete via AlertDialog | CRUD for category rules via UI | `[ ]` |
| 9.4.3 | Allow manual re-categorisation of a transaction from `app/transactions/page.tsx` — clicking category badge opens a shadcn `Select` inline | Category updates via `PATCH /api/transactions/:id/category` | `[ ]` |

#### 9.5 Cash Flow View (Next.js)

| # | Task | Acceptance Criteria | Status |
|---|------|---------------------|--------|
| 9.5.1 | Create `app/cashflow/page.tsx` | Page loads | `[ ]` |
| 9.5.2 | Current month: total income, total expenses by category, computed surplus displayed as summary cards at top | Numbers match transactions in DB | `[ ]` |
| 9.5.3 | Month selector — shadcn `Select`; changing it updates the TanStack Query key, table refetches automatically | Month switching works without page reload | `[ ]` |
| 9.5.4 | Comparison columns: this month / last month / 3-month average per category row | Comparison columns show correct values | `[ ]` |
| 9.5.5 | Unusual spending flag: if a category is > 50% above its 3-month average, amber text + ⚠ icon in that row | Flag appears for anomalous categories | `[ ]` |

#### 9.6 Tests

| # | Task | Acceptance Criteria | Status |
|---|------|---------------------|--------|
| 9.6.1 | pytest tests for HDFC parser with fixture PDF | Parse returns expected transaction count and total | `[ ]` |
| 9.6.2 | pytest tests for categorisation: known merchant patterns → correct category | Tests pass | `[ ]` |
| 9.6.3 | Integration test for import deduplication | Second import of same statement → 0 new rows | `[ ]` |

#### 9.7 Documentation

| # | Task | Acceptance Criteria | Status |
|---|------|---------------------|--------|
| 9.7.1 | Add interview note: PDF parsing trade-offs (pdfplumber vs pypdf vs tabula), why different banks need custom parsers, the case for starting with rule-based over ML categorisation | Written | `[ ]` |
| 9.7.2 | Add interview note: deduplication strategy for financial transactions (composite key design) | Written | `[ ]` |
| 9.7.3 | Update `docs/sprint-log.md` | Written | `[ ]` |

---

### Definition of Done — Sprint 9

- [ ] HDFC and ICICI bank statement PDFs parse correctly
- [ ] Transactions are categorised on import
- [ ] Deduplication works (re-import same file → no duplicates)
- [ ] Cash Flow view shows current month income/expenses/surplus
- [ ] Category management UI works
- [ ] CI green

---

---

## Sprint 10 — Tax Module v1 and Telegram Notifications

**Goal:** The app tracks 80C usage, flags the old vs new regime decision, and pings via Telegram for urgent items.

**Estimated effort:** 20–25 hours

**Status:** `[ ] Not started`

**Depends on:** Sprint 9 complete and green

---

### Tasks

#### 10.1 Tax Domain

| # | Task | Acceptance Criteria | Status |
|---|------|---------------------|--------|
| 10.1.1 | Create `TaxProfile` entity: `FinancialYear` (string, e.g., "FY2526"), `Regime` (enum: Old, New, Undecided), `Section80CUsed` (decimal), `Section80CLimit` (decimal, default 150000), `Section80DUsed` (decimal), `Section80DLimit` (decimal), `EstimatedGrossIncome` (decimal) | Entity in Domain | `[ ]` |
| 10.1.2 | Create migration for `TaxProfiles` table | Migration applied | `[ ]` |
| 10.1.3 | Create `TaxCalculator` domain service: given gross income, deductions, regime — returns estimated tax liability; implement both old and new regime slabs for FY2526 | Unit tests verify tax calculation against known values from Income Tax India site | `[ ]` |
| 10.1.4 | Create `RegimeAdvisor`: compares tax liability under old vs new regime given current deductions; recommends regime; outputs breakeven deduction amount | Unit test: given known income and deductions, recommends correct regime | `[ ]` |

#### 10.2 Tax Dashboard (Next.js)

| # | Task | Acceptance Criteria | Status |
|---|------|---------------------|--------|
| 10.2.1 | Create `app/tax/page.tsx` with: 80C shadcn `Progress` bar, 80D progress bar, estimated tax card, regime comparison card | Page loads with real values | `[ ]` |
| 10.2.2 | Show "₹X more to complete 80C" prominently when 80C < limit | Correct amount shown | `[ ]` |
| 10.2.3 | Regime recommendation card: "Switch to Old Regime — you save ₹X" or "Stay on New Regime — simpler and saves ₹X" | Recommendation visible | `[ ]` |
| 10.2.4 | Allow manual input of 80C investments and 80D premiums via Dialog form — calls `PATCH /api/tax/profile` | Form inputs save to TaxProfile | `[ ]` |

#### 10.3 Tax Rules (adds to rules engine from Sprint 7)

| # | Task | Acceptance Criteria | Status |
|---|------|---------------------|--------|
| 10.3.1 | Rule `Tax80CIncomplete`: January → Watch if 80C < ₹1.5L; February → Act if 80C < ₹1.5L; March → Act (urgent) | Triggers correctly by month | `[ ]` |
| 10.3.2 | Rule `TaxRegimeDecisionDue`: triggers Watch at the start of each FY if regime is Undecided | Triggers correctly | `[ ]` |
| 10.3.3 | Rule `AdvanceTaxDue`: triggers Watch in June, September, December if estimated tax > ₹10,000 | Triggers correctly | `[ ]` |

#### 10.4 Notification Dispatcher

| # | Task | Acceptance Criteria | Status |
|---|------|---------------------|--------|
| 10.4.1 | Create `INotificationDispatcher` interface in Application: `Task DispatchAsync(Recommendation recommendation)` | Interface defined | `[ ]` |
| 10.4.2 | Implement routing logic: `Info` → in-app only; `Watch` → in-app + email; `ActNow` → in-app + email + Telegram | Logic implemented | `[ ]` |
| 10.4.3 | `IEmailService.SendRecommendationAsync` already exists — hook it up to dispatcher | Works | `[ ]` |
| 10.4.4 | Create `ITelegramNotificationService` interface and `TelegramBotService` implementation using raw `HttpClient` calls to Telegram Bot API (no SDK needed) | Sends message to configured chat ID | `[ ]` |
| 10.4.5 | Add Telegram config to `appsettings.json`: `BotToken`, `ChatId` | Config reads from environment | `[ ]` |
| 10.4.6 | Anti-spam guard: max 3 Telegram messages per calendar month; if limit reached, queue to next month | Limit enforced, tracked in DB | `[ ]` |
| 10.4.7 | Weekly email digest (Sunday 7PM IST via Hangfire): summarise all Watch items from the week | Digest email sends on schedule | `[ ]` |

#### 10.5 Tests

| # | Task | Acceptance Criteria | Status |
|---|------|---------------------|--------|
| 10.5.1 | Unit tests for `TaxCalculator` — old regime and new regime with known income values; verify against official tax calculator | Tests pass with correct tax amounts | `[ ]` |
| 10.5.2 | Unit tests for tax rules — all three rules trigger at correct months/thresholds | Tests pass | `[ ]` |
| 10.5.3 | Unit test for notification dispatcher routing — all three severity levels go to correct channels | Tests pass | `[ ]` |
| 10.5.4 | Unit test for Telegram anti-spam — 4th message in a month is queued, not sent | Test passes | `[ ]` |

#### 10.6 Documentation

| # | Task | Acceptance Criteria | Status |
|---|------|---------------------|--------|
| 10.6.1 | Add interview note: notification design — channels, severity, anti-fatigue, why Telegram for high-urgency only | Written | `[ ]` |
| 10.6.2 | Add interview note: versioning tax rules by financial year — how the design handles FY changing every April | Written | `[ ]` |
| 10.6.3 | Update `docs/sprint-log.md` | Written | `[ ]` |

---

### Definition of Done — Sprint 10

- [ ] Tax profile with 80C/80D tracking
- [ ] Tax dashboard shows current usage, regime comparison, recommendation
- [ ] Tax rules integrated with recommendation engine
- [ ] Telegram notifications working for ActNow severity
- [ ] Anti-spam guard (max 3/month) implemented
- [ ] Weekly email digest sending on Sunday
- [ ] All tax math verified against official calculator
- [ ] CI green

---

---

## Sprint 11 — Production Deploy and Observability

**Goal:** App is running on Railway/Fly.io, accessible from my phone, with logging, monitoring, and automated backups.

**Estimated effort:** 20–25 hours

**Status:** `[ ] Not started`

**Depends on:** Sprint 10 complete and green

---

### Tasks

#### 11.1 Production Configuration

| # | Task | Acceptance Criteria | Status |
|---|------|---------------------|--------|
| 11.1.1 | Audit all configuration values — ensure zero secrets in `appsettings.json`; all sensitive values in environment variables | `git grep` for any hardcoded keys, passwords, tokens returns nothing | `[ ]` |
| 11.1.2 | Create `appsettings.Production.json` with production-appropriate logging levels and settings | File exists; no secrets in it | `[ ]` |
| 11.1.3 | Add `ASPNETCORE_ENVIRONMENT=Production` to production environment | App starts in Production mode | `[ ]` |
| 11.1.4 | Add basic auth gate on the .NET API (`Authorization` header check middleware) — single token stored in environment variable; Next.js sends the token on every request | API returns 401 without token; works correctly from Next.js | `[ ]` |
| 11.1.5 | Set `NEXT_PUBLIC_API_URL` to production .NET API URL in Vercel environment variables | Next.js production build calls the correct API | `[ ]` |

#### 11.2 Deployment

| # | Task | Acceptance Criteria | Status |
|---|------|---------------------|--------|
| 11.2.1 | Create Railway (or Fly.io) project; provision managed Postgres | Postgres connection string available | `[ ]` |
| 11.2.2 | Deploy .NET service to Railway — configure build from Dockerfile | Service starts and `GET /api/health` returns 200 | `[ ]` |
| 11.2.3 | Deploy Python analytics service to Railway | Python service `GET /health` returns 200 | `[ ]` |
| 11.2.4 | Deploy Next.js frontend to Vercel — connect GitHub repo, configure `NEXT_PUBLIC_API_URL` | `npm run build` passes in Vercel; site accessible at Vercel URL | `[ ]` |
| 11.2.5 | Configure all environment variables: Railway (ANTHROPIC_API_KEY, SMTP, Telegram, DB), Vercel (NEXT_PUBLIC_API_URL, API_TOKEN) | All services start without config errors | `[ ]` |
| 11.2.6 | Verify EF Core migrations run on startup in production (or run manually via one-off command) | All tables exist in production Postgres | `[ ]` |
| 11.2.7 | Create GitHub Actions deploy workflows: .NET and Python auto-deploy to Railway on push to `main`; Vercel handles Next.js deploy automatically via GitHub integration | Auto-deploy confirmed for all three services | `[ ]` |

#### 11.3 Observability

| # | Task | Acceptance Criteria | Status |
|---|------|---------------------|--------|
| 11.3.1 | Add Serilog sink for BetterStack (Logtail free tier) — structured logs shipping to cloud | Logs visible in BetterStack dashboard | `[ ]` |
| 11.3.2 | Add correlation ID middleware in .NET that generates a request ID and includes it in all log entries and response headers | Log entries show correlation ID; can trace a request | `[ ]` |
| 11.3.3 | Add Python service structured logging using `structlog` — logs include correlation ID from incoming request header | Python logs in same format, traceable | `[ ]` |
| 11.3.4 | Set up uptime monitor (UptimeRobot free tier) on `/api/health` — alert to email if down > 5 minutes | Monitor configured; tested by temporarily stopping the service | `[ ]` |
| 11.3.5 | Add request duration logging for slow requests (> 1 second) in .NET middleware | Slow requests identifiable in logs | `[ ]` |

#### 11.4 Backup

| # | Task | Acceptance Criteria | Status |
|---|------|---------------------|--------|
| 11.4.1 | Create daily Postgres backup job using `pg_dump` — store backup to a free cloud storage (Cloudflare R2 free tier, Backblaze B2 free tier, or a GitHub release artifact) | Backup file created daily | `[ ]` |
| 11.4.2 | Test restore: actually restore backup to a local Postgres instance and verify data integrity | Restore works; data matches | `[ ]` |
| 11.4.3 | Retain last 30 days of backups; delete older ones | Retention policy implemented | `[ ]` |
| 11.4.4 | Alert to email if backup job fails | Failure notification works | `[ ]` |

#### 11.5 Documentation

| # | Task | Acceptance Criteria | Status |
|---|------|---------------------|--------|
| 11.5.1 | Create `docs/runbook.md`: how to deploy, how to run a migration in production, how to restore a backup, how to check logs, how to restart a service | Runbook exists and is accurate | `[ ]` |
| 11.5.2 | Add interview note: twelve-factor app principles — which of the 12 this project follows and why | Written | `[ ]` |
| 11.5.3 | Add interview note: observability strategy — logs vs metrics vs traces, what each gives you, why structured logging matters | Written | `[ ]` |
| 11.5.4 | Update `docs/sprint-log.md` | Written | `[ ]` |

---

### Definition of Done — Sprint 11

- [ ] All three services deployed: .NET + Python on Railway, Next.js on Vercel
- [ ] All environment variables configured, zero secrets in repo
- [ ] API token auth gate protecting the .NET API
- [ ] Logs shipping to BetterStack
- [ ] Uptime monitor alerting on downtime
- [ ] Daily Postgres backup with tested restore
- [ ] Auto-deploy from GitHub Actions on merge to main
- [ ] Runbook written

---

---

## Sprint 12 — Polish, Documentation, and Interview-Ready Repo

**Goal:** The app is good enough that I use it every month. The repo is good enough to share in interviews.

**Estimated effort:** 20–25 hours

**Status:** `[ ] Not started`

**Depends on:** Sprint 11 complete and green

---

### Tasks

#### 12.1 Architecture Decision Records

| # | Task | Acceptance Criteria | Status |
|---|------|---------------------|--------|
| 12.1.1 | Create `docs/adr/` folder with ADR template | Template exists | `[ ]` |
| 12.1.2 | ADR-001: Why Clean Architecture over feature folders | Written | `[ ]` |
| 12.1.3 | ADR-002: Monolith-first then polyglot — the earn-the-architecture principle | Written | `[ ]` |
| 12.1.4 | ADR-003: Razor Pages + HTMX over SPA for internal tool | Written | `[ ]` |
| 12.1.5 | ADR-004: Rules engine pattern for recommendations | Written | `[ ]` |
| 12.1.6 | ADR-005: LLM scope — narrative only, not numbers | Written | `[ ]` |
| 12.1.7 | ADR-006: HTTP REST between .NET and Python over message queue | Written | `[ ]` |
| 12.1.8 | ADR-007: Railway / Fly.io over self-hosted for v1 | Written | `[ ]` |

#### 12.2 README Overhaul

| # | Task | Acceptance Criteria | Status |
|---|------|---------------------|--------|
| 12.2.1 | Rewrite root `README.md` with: what the project is (2 sentences), screenshot or demo GIF, architecture diagram (Mermaid), tech stack, local setup (< 10 steps), production setup, how to run tests | README complete and accurate | `[ ]` |
| 12.2.2 | Add Mermaid architecture diagram showing: User → .NET Service → Postgres, .NET Service → Python Service → Anthropic API, .NET Service → External APIs | Diagram renders correctly in GitHub | `[ ]` |
| 12.2.3 | Add Mermaid sequence diagram for the monthly plan generation flow | Diagram renders | `[ ]` |

#### 12.3 Performance Pass

| # | Task | Acceptance Criteria | Status |
|---|------|---------------------|--------|
| 12.3.1 | Profile dashboard page load time — identify and fix the slowest DB query | Dashboard loads in < 500ms | `[ ]` |
| 12.3.2 | Add `AsNoTracking()` to all read-only EF Core queries | Queries that never write back use no-tracking | `[ ]` |
| 12.3.3 | Identify any N+1 query patterns in .NET API controllers; fix with `.Include()` | No N+1 patterns | `[ ]` |
| 12.3.4 | Add HTTP cache headers on .NET API endpoints that rarely change (SIP health, goals) — `Cache-Control: max-age=300` | Cache headers set correctly; TanStack Query `staleTime` aligned | `[ ]` |
| 12.3.5 | Profile Next.js bundle size — check for unexpectedly large dependencies with `next build --analyze` | No single chunk > 200KB | `[ ]` |

#### 12.4 UX Polish

| # | Task | Acceptance Criteria | Status |
|---|------|---------------------|--------|
| 12.4.1 | Review every page for the top 3 most annoying UX issues personally encountered during the 10 sprints; fix them | Issues logged in sprint-log, fixes applied | `[ ]` |
| 12.4.2 | Verify empty states exist on every list page (holdings, goals, transactions, SIPs) — added in Sprint 3 but check they still work with real data | Empty states visible when DB has no data | `[ ]` |
| 12.4.3 | Verify loading skeletons (shadcn `Skeleton`) show correctly for all TanStack Query `isLoading` states | Skeleton visible briefly on slow connections | `[ ]` |
| 12.4.4 | Test on mobile browser (Safari on iPhone, Chrome on Android) — fix any layout breakages | Key pages usable on mobile | `[ ]` |

#### 12.5 Interview Preparation

| # | Task | Acceptance Criteria | Status |
|---|------|---------------------|--------|
| 12.5.1 | Consolidate `docs/interview-notes.md` — every entry reviewed, expanded, and clearly written | At least 15 entries, each 150–400 words | `[ ]` |
| 12.5.2 | Write a 1-page "Project Story" in `docs/interview-notes.md`: what problem, why I built it, key technical decisions, what I learned, what I would do differently | Written in prose, interview-ready | `[ ]` |
| 12.5.3 | Record a 5-minute screen walkthrough demo: start on dashboard, show net worth, show SIP health page, show monthly plan, show a recommendation, show goal progress | Video recorded and stored | `[ ]` |
| 12.5.4 | Write three "STAR format" interview answers around this project: (1) a system design decision, (2) a technical challenge, (3) a lesson learned | Written and reviewed | `[ ]` |

#### 12.6 Final Cleanup

| # | Task | Acceptance Criteria | Status |
|---|------|---------------------|--------|
| 12.6.1 | Run `dotnet format` and fix all warnings | Zero warnings | `[ ]` |
| 12.6.2 | Run `ruff check` on Python service and fix all issues | Zero ruff issues | `[ ]` |
| 12.6.3 | Run `tsc --noEmit` on Next.js with strict mode; fix all TypeScript errors | Zero TypeScript errors | `[ ]` |
| 12.6.4 | Run `npm run lint` (ESLint) on Next.js; fix all lint issues | Zero lint warnings | `[ ]` |
| 12.6.5 | Review all `TODO` comments in code — resolve or create GitHub issues for deferred items | No `TODO` left in code | `[ ]` |
| 12.6.6 | Verify all CI workflows pass on a clean clone | CI green from zero | `[ ]` |
| 12.6.5 | Write `docs/sprint-log.md` final entry: overall project retrospective — what went well, what I would do differently, what I actually learned vs what I expected to learn | Written | `[ ]` |

---

### Definition of Done — Sprint 12 (= v1 Complete)

- [ ] README is the project's front page — accurate, complete, with diagrams
- [ ] 7 ADRs written, each with context, decision, and consequences
- [ ] Dashboard loads in < 500ms
- [ ] Mobile browser: key pages usable
- [ ] 15+ interview notes written
- [ ] 5-minute demo video recorded
- [ ] Zero .NET warnings, zero ruff issues, zero TypeScript errors, zero ESLint warnings
- [ ] All three CI pipelines green

---

## Appendix A — Discipline Reminders (Non-Negotiable)

These apply to every sprint, every day.

1. **Read every AI-generated line before committing.** If you cannot explain it, do not commit it.
2. **Verify financial math manually.** At least one known-output test case for every financial calculation: XIRR, Monte Carlo, tax calculations.
3. **The LLM writes words, not numbers.** Every prompt must state this explicitly. Test adversarially.
4. **Write the interview note before closing the sprint.** Not after. While the decision is fresh.
5. **Green CI before starting the next sprint.** Never carry forward a failing pipeline.
6. **Conservative advice always.** Emergency fund first. Debt before investing. Dollar-cost-average over market timing.

---

## Appendix B — Threshold Values Reference

These are the values used by the rules engine. Change them here and they update throughout the document.

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| Emergency fund target | 6× monthly fixed obligations | Standard personal finance advice |
| Emergency fund minimum | 3× monthly fixed obligations | Below this → Act |
| High-cost debt threshold | 12% APR | Any revolving balance above this → Act |
| SIP underperformance watch | Benchmark − 1% annualised | One year of slight lag |
| SIP underperformance act | Benchmark − 3% annualised | Three years of significant lag |
| Equity expected return | 12% per annum | Long-run Indian large-cap average |
| Equity volatility | 18% per annum | Indian large-cap historical std dev |
| Debt expected return | 7% per annum | Conservative estimate |
| Debt volatility | 3% per annum | Conservative |
| Gold expected return | 9% per annum | Long-run estimate |
| Gold volatility | 12% per annum | Moderate |
| Goal on-track threshold | 90% probability | High confidence |
| Goal watch threshold | 75% probability | Starting to slip |
| Goal act threshold | 50% probability | Serious shortfall |
| Telegram max per month | 3 messages | Anti-fatigue |
| Idle cash threshold | 3× monthly expenses + ₹25,000 | Excess cash to invest |

---

*Sprint plan version 2.0 — updated for Next.js + shadcn/ui frontend (was Razor Pages + HTMX). Living document, updated at the end of each sprint.*
