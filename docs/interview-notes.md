# Interview Notes — Personal AI Financial Advisor

This document is a living record of every architectural decision made during this project. Each entry explains what was decided, what alternatives were considered, and why this choice won. By the end of v1, this becomes the primary talking points document for senior engineering interviews.

---

## Format

Each entry follows this structure:

**Decision:** What was decided (one sentence).

**Context:** What problem was being solved. What were the constraints.

**Alternatives considered:** What else could have been done.

**Why this won:** The actual reasoning. Trade-offs accepted.

**What I would do differently:** Honest reflection (added retrospectively).

---

## Sprint 1 — Foundation

### ADR-001: Clean Architecture layer structure

**Decision:** The .NET backend is structured with four layers — Domain, Application, Infrastructure, Api — with a strict inward-only reference direction.

**Context:** I needed a codebase organisation that would keep business logic independent of frameworks, databases, and delivery mechanisms. This project will grow across 12 sprints and the domain rules (SIP health, goal probability, monthly plan logic) should not need to change when I switch the database provider or add a new API endpoint.

**Alternatives considered:**
- Feature-folder structure (all files for one feature in one folder — handler, entity, controller, query). Common in vertical-slice architectures. Less separation between domain and infrastructure.
- Simple layered architecture with 2 layers (BLL + DAL). Fine for small apps, but business logic ends up mixed with EF Core attributes and `DbContext` references.
- CQRS with MediatR from day one. Adds an extra indirection layer without providing value until the codebase is larger.

**Why this won:** Clean Architecture forces a discipline: the Domain project has zero external dependencies (no NuGet packages). The EF Core configuration lives in Infrastructure, not on the entity classes. This means I can swap Npgsql for SQLite for tests without touching any business logic — which I actually did in Sprint 1 for the integration test setup. The reference direction is enforced by the project structure itself: if I add an EF Core reference to Domain, the build fails.

The trade-off is verbosity at small scale. For a project with 3 entities, CRUD repositories feel over-engineered. I accept that cost because by Sprint 7 the recommendation engine will have 12 rules and a complex context object — and at that point the architecture pays for itself.

**What I would do differently:** Nothing in Sprint 1. Ask me again at Sprint 12.

---

## Sprint 2 — Domain Model and Data Layer

### ADR-004: Aggregate root design — Goal as a root, Transaction is not under Account

**Decision:** `Goal`, `Transaction`, `Holding`, `SipPlan`, and `RecommendationLog` are all aggregate roots with direct repositories, not navigated through Account.

**Context:** In DDD, an aggregate root controls access to everything inside it. The question is whether `Holding` and `Transaction` should be accessed through `Account` (their parent) or directly through their own repositories.

**Alternatives considered:** `Account` as the single root aggregate for all financial data, owning Holdings, Transactions, and SIPs. Every operation would go through `AccountRepository.GetById()` then navigate to the holding.

**Why this won:** `Transaction` and `Holding` are large collections queried independently (all holdings for net worth, all transactions in a date range across all accounts). Loading them through `Account` would force loading the entire account history just to read one transaction. Lazy loading in EF Core can hide this N+1 problem but leaks infrastructure concerns. By making each entity a root with its own repository, each use case query is explicit. The generic `IRepository<T>` base keeps the implementation compact.

**What I would do differently:** Nothing yet. Ask at Sprint 8 when the data model is fully stressed.

---

### ADR-005: Value objects vs entities — Money, AssetAllocation

**Decision:** `Money`, `DateRange`, `AssetAllocation`, and `Xirr` are value objects: immutable, equality-by-value, no identity.

**Context:** The test for value object vs entity is identity. Two things with identical values: are they interchangeable?

**Why this won:** Two `Money` instances with the same amount and currency are identical — ₹1000 in slot A is not different from ₹1000 in slot B. Contrast with `Goal`: two goals with the same name and amount are NOT interchangeable because they have distinct lifecycles and identities (Guid). Value objects are immutable by design — private setters, private constructors, modification returns a new instance. EF Core maps `AssetAllocation` as an owned type (no separate table, no independent lifecycle — it lives and dies with its Goal). This is the ORM expression of the value object concept.

**What I would do differently:** Nothing. The pattern works well and the EF Core owned type mapping is exactly the right abstraction.

---

### ADR-006: EF Core configurations separate from entity classes

**Decision:** All EF Core mapping logic lives in `IEntityTypeConfiguration<T>` classes in Infrastructure. Domain entities have zero EF Core attributes.

**Context:** The simplest approach is data annotations on entity classes (`[Key]`, `[Required]`, `[MaxLength]`). Convenient, but leaks Infrastructure into Domain.

**Why this won:** The Domain project has zero NuGet dependencies. This is enforced by the project structure — adding a `Microsoft.EntityFrameworkCore` reference to Domain would break the Clean Architecture rule. Domain entities are plain C# classes testable with zero ORM overhead. The configuration lives in Infrastructure next to `DbContext` and migrations. Cost: more files. Benefit: each file has one responsibility, and tests run faster.

**What I would do differently:** Nothing.

---

### ADR-002: Monorepo vs split repos for a polyglot project

**Decision:** All three services (.NET API, Python analytics, Next.js frontend) live in one Git repository.

**Context:** The project has three runtimes — .NET, Python, Node.js. A natural question is whether to have three repos, each owned by one runtime.

**Alternatives considered:**
- Three separate repos. Each service gets its own CI, its own release cycle, its own README. Common in large organisations where teams own services independently.
- Two repos: one for the .NET + Python backend, one for the frontend. A common split.

**Why this won:** For a solo developer building v1 for myself, a monorepo eliminates coordination overhead. A single `git clone` is all that is needed to get everything. A single CI pipeline can test across all three services on a shared PR. Service contracts (the JSON shapes that .NET sends to Python) can be changed in one commit and the impact is visible in one PR diff. When the Python service is extracted in Sprint 4, the contract types will live in the same repo as the callers — no package publishing, no version pinning.

The trade-off is a larger clone and CI that builds things you did not change. At single-developer scale with 12 sprints ahead, this is not a problem.

**What I would do differently:** If the Python service grew a separate team or release cadence, I would extract it. Monorepos become painful when different teams want different merge windows.

---

### ADR-003: .NET version choice — targeting net10.0

**Decision:** The project targets .NET 10 even though the original plan specified .NET 8.

**Context:** The plan was written targeting .NET 8 LTS. When I set up the local environment, only the .NET 10 SDK was installed.

**Alternatives considered:**
- Install .NET 8 SDK alongside .NET 10 and target `net8.0`. Would match the original plan exactly.
- Target `net10.0` with the installed SDK.

**Why this won:** .NET 10 is a current release as of Sprint 1. The APIs I am using (ASP.NET Core, EF Core, health checks) all work identically between 8 and 10 for the features in this sprint. Targeting the installed SDK eliminates one layer of tooling complexity. The project is personal software, not a library that needs to support older runtimes.

**What I would do differently:** Nothing. The principle is to reduce friction in the early sprints.

---

## Sprint 3 — Next.js Dashboard

### ADR-007: App Router over Pages Router

**Decision:** The Next.js frontend uses the App Router (introduced in Next.js 13, stable in 14+) rather than the legacy Pages Router.

**Context:** Next.js offers two routing paradigms. Pages Router is the original — file-based routing under `pages/`, `getServerSideProps`, `getStaticProps`. App Router is the newer model — file-based routing under `app/`, React Server Components by default, nested layouts.

**Alternatives considered:**
- Pages Router. Battle-tested, no RSC complexity, well-documented. Every Stack Overflow answer and tutorial is about Pages Router.
- Pages Router + SWR. The standard data-fetching library for Pages Router.

**Why this won:** App Router is the recommended approach for all new Next.js projects as of 2024. It ships better primitives: nested layouts (`layout.tsx`) mean the sidebar and providers are rendered once at the root and never re-render on navigation, which is better UX than the full-page flash of the Pages Router. Server Components allow moving data-fetching to the server for the right parts — useful in Sprint 5 when the AI-generated monthly plan is server-rendered. The trade-off is that `"use client"` must be added explicitly to every file that uses hooks or browser APIs — a minor tax that makes the component boundary explicit and auditable.

**What I would do differently:** Nothing. The App Router layout nesting for the sidebar was exactly as simple as expected.

---

### ADR-008: TanStack Query (React Query) for client data-fetching

**Decision:** All API calls from the browser use TanStack Query (`@tanstack/react-query`) with Axios.

**Context:** The dashboard needs live data (net worth, holdings, transactions, SIPs). Options are: `fetch` + `useEffect` + `useState`, SWR, or TanStack Query.

**Alternatives considered:**
- `fetch` + `useEffect`. Zero dependencies. Manual loading/error states. No caching, no deduplication, no background refetch. Gets unwieldy fast.
- SWR. Lightweight, excellent for simple GET-and-display. Less capable for mutations (no optimistic updates, no `onSuccess` invalidation).
- tRPC. Full type-safety from server to client without a separate REST API. Not applicable because the API is .NET, not a Node.js backend.

**Why this won:** TanStack Query's cache invalidation model (`queryClient.invalidateQueries`) is the correct abstraction for a write-then-refresh pattern. When a new holding is added, the mutation's `onSuccess` invalidates both `["holdings"]` and `["networth"]` — both queries refetch automatically without any component coordination. The `queryKey` system makes cache management explicit and auditable. The `refetchInterval: 60_000` on the net worth query means the dashboard stays live without any additional infrastructure.

**What I would do differently:** Nothing for this scale. At Sprint 8, if the AI plan page needs streaming, I will add a server action or a streaming fetch rather than a TanStack Query.

---

### ADR-009: CQRS-lite without MediatR

**Decision:** Command and query handlers are plain C# classes injected directly into controllers, with no MediatR.

**Context:** MediatR is the standard library for in-process CQRS in .NET. Every handler implements `IRequestHandler<TRequest, TResponse>` and is dispatched via `mediator.Send(request)`.

**Alternatives considered:**
- MediatR. Decouples handlers from controllers. Enables pipeline behaviours (logging, validation, authorisation) as cross-cutting concerns. Industry standard pattern.
- Minimal API handlers (functions, not classes). Concise, but loses the explicit query/command separation.

**Why this won:** MediatR's value is the pipeline — you can add logging, authorisation, and validation middleware once. But I already have FluentValidation validators in each controller action and Serilog for logging. Adding MediatR at this stage would be an extra abstraction with no net benefit until the pipeline is needed. The current approach (`GetNetWorthQueryHandler` injected directly into `NetWorthController`) is more readable because the dependency is explicit in the constructor. When the AI pipeline in Sprint 5 needs cross-cutting concerns (e.g., caching the AI response), I will evaluate whether MediatR pipeline behaviours are the right answer or whether a dedicated service is simpler.

**What I would do differently:** Same decision. MediatR is a tool for managing complexity that doesn't yet exist.

---

## Sprint 4 — CAS Upload via Python Service

### ADR-010: First service extraction — Python for PDF parsing

**Decision:** CAS PDF parsing runs in a separate Python FastAPI microservice rather than inside the .NET API.

**Context:** CAS (Consolidated Account Statement) PDFs from CAMS/Karvy are proprietary formats with complex internal structure. Parsing them correctly requires a library that understands the format. The `casparser` library (Python) is the best-maintained open-source implementation, but it is Python-only with no .NET equivalent.

**Alternatives considered:**
- IronPDF or iTextSharp (.NET) to extract raw text, then write a custom parser. High implementation cost, high maintenance risk (CAMS changes the PDF format occasionally), no community support.
- Keep everything in .NET and call a Python process via `ProcessStartException`. Avoids HTTP but creates a tight coupling to the file system, is harder to scale, and complicates Dockerisation.
- Use a hosted PDF-to-text API. Sends customer financial data to a third-party service — non-starter for a personal finance app.

**Why this won:** `casparser` is battle-tested and handles both CAMS and Karvy formats including encryption. Wrapping it in a FastAPI service gives a clear HTTP boundary: the .NET API sends the PDF bytes, receives structured JSON. The service is independently deployable, independently testable, and the parsing logic can be updated by upgrading one Python package. The `IAnalyticsService` interface in Application keeps the .NET side decoupled — if I ever want to swap the parser, only `AnalyticsServiceClient` in Infrastructure changes.

**What I would do differently:** Nothing yet. The first service extraction is always the riskiest — establishing the HTTP contract and the resilience pattern correctly means every subsequent service extraction follows the same template.

---

### ADR-011: Polly resilience pipeline for inter-service calls

**Decision:** The `HttpClient` for the analytics service has a Polly resilience pipeline: Retry (3×, exponential backoff) → CircuitBreaker (50% failure ratio, 30s break) → Timeout (30s per attempt).

**Context:** The PDF parsing service is a separate process on a separate port. It can be slow (large PDFs take 2–5s), temporarily unavailable (restart), or overwhelmed (multiple concurrent uploads). Without resilience, a slow or failed response makes the user's upload hang indefinitely.

**Alternatives considered:**
- No resilience. Simple. Fails hard when the analytics service is down. Unacceptable for a feature the user interacts with directly.
- Manual retry with `Task.Delay`. Works but verbose. No circuit breaking means retries will keep hammering a failing service.
- `Polly` directly (v8). Works, but `Microsoft.Extensions.Http.Resilience` provides a built-in integration with `IHttpClientBuilder` and aligns retry/circuit-breaker/timeout in the recommended order automatically.

**Why this won:** `Microsoft.Extensions.Http.Resilience` (built on Polly v8) provides the retry/circuit-breaker/timeout pattern as a first-class `IHttpClientBuilder` extension. The pipeline order matters: Retry is outermost so each attempt gets its own timeout; CircuitBreaker is inside Retry so repeated failures open the breaker before exhausting all retries; Timeout is innermost as a per-attempt guard. Getting this order wrong (e.g., Timeout outermost) would mean the outer timeout fires before all retries complete. The library handles the ordering correctly when added in the right sequence.

**What I would do differently:** Nothing on the retry policy. I would add jitter to the exponential backoff in production to avoid thundering-herd if multiple users upload simultaneously.

---

### ADR-012: Service contract design — snake_case to PascalCase in Infrastructure

**Decision:** The Python analytics service returns JSON in snake_case (Python convention). The .NET `AnalyticsServiceClient` maps this to PascalCase (C# convention) using private inner records in Infrastructure. Application-layer DTOs are always PascalCase.

**Context:** Python's idiomatic JSON output is snake_case (`fund_name`, `total_value`). C# idiomatic property names are PascalCase (`FundName`, `TotalValue`). The question is where to handle the translation.

**Alternatives considered:**
- Configure `JsonSerializerOptions` globally to use `snake_case` everywhere. Simple, but bleeds Python conventions into the C# type system — `CasParseResult.fund_name` would look wrong in C#.
- Use `[JsonPropertyName("fund_name")]` attributes on the Application-layer DTO. Works, but adds a `System.Text.Json` dependency to Application, which should have no serialisation awareness.
- Private inner records in `AnalyticsServiceClient` with `[JsonPropertyName]` attributes, then map to the clean Application DTOs. Verbose but correct.

**Why this won:** The mapping belongs in Infrastructure because it is an I/O concern. Application defines `CasHoldingResult` with `FundName` — it should not know or care that the underlying transport uses snake_case. The `AnalyticsServiceClient` private records are the exact translation boundary. Adding `System.Text.Json` attributes to Application DTOs would violate the same layer-purity principle that keeps EF Core attributes out of Domain entities.

**What I would do differently:** Nothing. The pattern is clear and consistent with how EF Core configurations live in Infrastructure rather than on Domain entities.

---

## Sprint 5 — AI Recommendations Engine

### ADR-013: tool_use for structured AI output instead of JSON-in-prose

**Decision:** The `POST /recommendations/generate` endpoint uses Claude's `tool_use` feature with a typed `add_recommendation` tool to get structured recommendation output, not free-form text that is later parsed.

**Context:** The recommendation endpoint needs to return typed records with `type`, `severity`, `category`, `title`, and `body` fields. The simplest approach is to ask Claude to "output JSON in this format." But free-form JSON in prose is brittle — the model can add surrounding text, use incorrect field names, or silently omit fields.

**Alternatives considered:**
- Prompt Claude to output a JSON array, then `json.loads()` the response. Fragile — model sometimes wraps the JSON in a markdown code block, or adds a preamble sentence.
- Parse Claude's prose into a structured format with regex or spaCy. Very fragile.
- Use `tool_use` with a typed schema. Claude treats the tool call as the output mechanism, not prose.

**Why this won:** `tool_use` with `tool_choice: {"type": "any"}` forces Claude to call the tool for every recommendation. The input schema validates field names and enum values at the API level — if Claude tries to use an invalid `type` or `severity`, the call fails rather than silently inserting bad data. The result is that each recommendation arrives as a Python dict with validated keys, not as text requiring parsing.

**What I would do differently:** Nothing. The `tool_choice: {"type": "any"}` flag is important and non-obvious — without it, Claude sometimes responds in prose even when a tool is defined.

---

### ADR-014: LLM writes narratives only — all figures come from portfolio context

**Decision:** The system prompt explicitly instructs Claude that all monetary figures must come from the portfolio data passed in the request. Claude writes only titles and explanatory sentences, never originates numbers.

**Context:** A fundamental risk in AI-generated financial advice is hallucinated figures. If Claude invents a portfolio value, goal probability, or gain percentage that differs from the real data, the user could make a financial decision based on a fiction.

**Alternatives considered:**
- Let Claude derive insights and figures from the portfolio description. Simpler prompt, but allows hallucination of specific numbers.
- Post-process Claude's output to strip or replace any numbers with verified figures. Complex regex, still risky.
- Provide all context data upfront and instruct Claude not to generate new numbers. Simple, clear, auditable.

**Why this won:** The portfolio context sent to Claude includes every number Claude could possibly reference: total value, per-holding value and gain/loss, goal target amounts and probabilities, monthly SIP total. The system prompt says: "Use ONLY figures that appear in the portfolio data. Do NOT invent or estimate any numbers." If Claude includes a figure, it must have come from the input. This is enforceable and auditable. The principle scales to every AI feature in the app: the rules engine computes, the LLM narrates.

**What I would do differently:** Nothing. This constraint belongs in the system prompt permanently, not as a one-off guard.

---

## Sprint 6 — Monte Carlo & Goal Probability

### ADR-015: BackgroundService + PeriodicTimer over Hangfire

**Decision:** Goal probability recalculation uses a .NET `BackgroundService` with a `PeriodicTimer` rather than Hangfire.

**Context:** The recalculation needs to run once daily (and once at startup). Options are: Hangfire (persistent job queue backed by Postgres), `IHostedService`/`BackgroundService` + `PeriodicTimer` (built-in), or a simple cron trigger from the OS.

**Alternatives considered:**
- Hangfire. Full-featured: persistent jobs survive restarts, built-in retry, dashboard UI, can schedule ad-hoc jobs. Standard for enterprise .NET apps. Requires `Hangfire.Core` + `Hangfire.PostgreSql`, adds Hangfire dashboard routes, and introduces a second job-storage schema alongside EF Core migrations.
- OS cron + HTTP call. Decouples scheduling entirely from the application. Over-engineered for a single-user personal app where the API and the job run on the same machine.
- `BackgroundService` + `PeriodicTimer`. Built into .NET since .NET 6. No additional packages. The `PeriodicTimer` is cancellation-aware (no sleep loops). Lives inside the API process.

**Why this won:** For a personal single-user app that runs one daily job affecting three goals, Hangfire's storage overhead and dashboard complexity add no net value. The `PeriodicTimer` pattern is idiomatic .NET, is trivially testable, and the `IServiceScopeFactory` pattern for creating scoped dependencies inside a singleton host service is standard and documented. If this app ever needs distributed job scheduling across multiple API instances, migrating to Hangfire is a two-day job — but that day is not today.

**What I would do differently:** At team scale or if the recalculation took minutes instead of milliseconds, Hangfire's retry and distributed-lock semantics would be worth the dependency. The decision threshold is roughly "does it matter if the job runs twice simultaneously?" For daily goal simulation on a personal app — no.

---

### ADR-016: Monte Carlo simulation assumptions for Indian markets

**Decision:** The simulation uses fixed annual parameters for Indian asset classes: Equity (μ=12%, σ=18%), Debt (μ=7%, σ=4%), Gold (μ=8%, σ=15%), Cash (μ=4%, σ=0.5%). Asset classes are modelled as independent (no correlation matrix).

**Context:** Monte Carlo for goal probability requires expected return and volatility assumptions. The question is: where do these numbers come from, and how precisely should asset correlations be modelled?

**Alternatives considered:**
- Rolling historical returns from NSE/BSE data. More accurate, requires a data pipeline and regular refresh. Premature for Sprint 6.
- SEBI-prescribed long-term return assumptions (typically ~10% for equity). More conservative, better for compliance-sensitive contexts.
- Calibrated parameters from academic literature on Indian equity markets.

**Why this won:** The parameters chosen (12% equity CAGR, 18% std) are consistent with Nifty 50 historical performance over 20+ year periods and are widely used in Indian financial planning contexts. The independence assumption overestimates portfolio volatility (equity and gold have mild positive correlation; equity and debt mild negative), meaning the simulation is slightly conservative — it underestimates probability of success. This is the right direction for error for a financial planning tool: it is better to tell a user their goal is 60% likely when it is actually 65%, than to over-promise. The correlation matrix will be added in Sprint 9 when portfolio-level backtesting is introduced.

**What I would do differently:** I would add a `seed` parameter to the endpoint and expose a `confidence_interval_width` field in the response so users can see how much the estimate varies across simulation runs.

---
