# Personal AI Financial Advisor — Build Plan

A planning document for a personal AI-powered financial advisor product, built for myself first, with a clear path to opening it up to friends and the public later. This document is the single source of truth for the vision, scope, architecture, tech stack, and sprint plan.

---

## 1. Vision

A personal CFO that lives in an app. It knows my entire financial life — bank accounts, mutual funds, stocks, EPF, credit cards, loans — and tells me what to do with my money each month. Not generic advice. Not stock tips. A specific, numbered, personalised plan I can act on in 10 minutes on the 1st of every month.

The product also runs daily and weekly checks in the background, surfacing actions when something needs attention — a SIP that has underperformed long enough to stop, a goal slipping off track, a market correction worth deploying cash into, a tax bucket that needs filling before March.

I am building this for myself first. Real data, real decisions, real money. If it works for me, it will work for friends. If it works for friends, it might work for the public. But v1 is for one user — me.

---

## 2. Why This Product

I have multiple SIPs. I do not really know if any of them are underperforming. I do not know what my actual surplus is each month. I do not know if I am on track for retirement. I do not know if I should pause investments and clear my credit card revolving balance. I do not know if my emergency fund is the right size. I am a senior software engineer and I cannot answer basic questions about my own money.

Existing apps either track (INDmoney, Kuvera, Groww) or transact (Coin, MF Central). None of them advise. The ones that try (ET Money) give generic templated advice. There is space for a real personal CFO and I am building it for myself.

---

## 3. Scope of v1 (For Myself)

**In scope**

- Net worth dashboard across all my holdings
- Monthly cash flow tracking
- Goal definition and progress tracking (3–5 goals)
- SIP performance analysis with stop/start/increase/decrease/pause recommendations
- Monthly money plan generated on the 1st of every month
- Daily and weekly checks producing actions, watches, and wins
- Notifications via dashboard, email, and Telegram
- Data input via CAS upload, bank statement upload, and manual entry

**Out of scope for v1**

- Multi-tenancy or any concept of "other users"
- Authentication or login (single user, runs on my machine or my VPS behind a simple gate)
- Onboarding flow (config-driven setup for my data)
- Disclaimers and regulatory framing (not needed when I am the only user)
- Mobile app (web dashboard is enough)
- Chat interface (deferred to v2)
- Investment execution (I will continue to use my AMC websites and broker)
- Stock-level recommendations (asset allocation and SIP advice only)
- Crypto, real estate transactions, business finances (personal only)

**Future phases (noted, not planned in detail)**

- v2 — Open to friends. Adds auth, multi-tenancy, basic onboarding, disclaimers, "education and analysis" framing.
- v3 — Open to public. Adds proper UX, payments, SEBI RIA path, support, marketing site.

This document plans v1 in detail.

---

## 4. Target User

Me. A senior software engineer in India, salaried, with multiple SIPs across AMCs, a couple of bank accounts, credit card, possibly EPF and PPF, planning for medium and long-term goals.

When this opens up later, the target user will be salaried IT and tech professionals in metros, earning ₹15–40L per year, age 28–38, with complex financial situations and zero clarity. But that is v2 and v3 thinking.

---

## 5. Product Surface — What the App Does

### 5.1 The Monthly Money Plan (Flagship Feature)

On the 1st of every month, the system produces a personalised plan. The plan has three sections.

**Actions** — things to do this month. Specific, with amounts and reasons.
Example: "Increase your Mirae Asset Large Cap SIP from ₹10,000 to ₹15,000 to close the retirement goal shortfall."

**Watches** — things to monitor but not act on yet.
Example: "Your Axis Bluechip fund has now underperformed its benchmark for 10 consecutive quarters. One more quarter and we will recommend a switch."

**Wins** — positive reinforcement.
Example: "Your emergency fund crossed 6 months of expenses this month. You are fully protected."

Each section is followed by a 200-word narrative written by the LLM, explaining the reasoning in natural language.

### 5.2 Net Worth Dashboard

Single number at the top — total net worth. Updated daily. Broken down by category — equity funds, debt funds, stocks, FDs, EPF, PPF, bank balance, gold, real estate (manual), minus liabilities (credit cards, loans). Trend chart over time.

### 5.3 Cash Flow View

Current month's income, expenses, and surplus. Comparison to previous months. Category breakdown of expenses. Flags any unusual spending pattern.

### 5.4 Goal Tracker

Each goal shows target amount, current corpus, monthly contribution, projected completion date, and probability of hitting the target (calculated via Monte Carlo). Goals can be edited, paused, or completed.

### 5.5 SIP Health View

Every SIP listed with — fund name, monthly amount, current value, XIRR, benchmark, benchmark differential, category average, status (healthy / watch / act). Click into any SIP to see detailed performance, holdings overlap with other funds, expense ratio impact.

### 5.6 Notifications Layer

In-app — top of dashboard always shows the latest unread actions.

Email — weekly digest every Sunday evening, full monthly plan on the 1st.

Telegram — only urgent items, maybe 2–3 messages per month maximum. Market correction deploy opportunities, fund manager changes, severe underperformance flags.

---

## 6. The Monthly Plan Logic (Detailed)

This is the core algorithm. It runs on the 1st of every month and follows a strict sequence.

**Step 1 — Income reconciliation.** Detect salary credit, any other inflows. Establish total monthly inflow.

**Step 2 — Fixed obligations.** Rent or EMI, insurance premiums, utility averages, existing SIPs, subscriptions, school fees. Subtract from inflow.

**Step 3 — Variable expense forecast.** Look at trailing 3–6 months of discretionary spending. Apply seasonal adjustment. Subtract.

**Step 4 — Compute surplus.** This is the deployable money for the month.

**Step 5 — Emergency fund check.** Is the emergency fund at target (6 months of fixed obligations + essentials)? If short, surplus goes here first. No debate.

**Step 6 — High-cost debt check.** Any credit card revolving balance or personal loan above 12% APR? Surplus goes here next. Mathematically irrefutable.

**Step 7 — Goal-based allocation.** Remaining surplus splits across active goals based on priority and shortfall. Each goal has a target asset allocation that drives which type of instrument (equity fund, debt fund, FD) the contribution goes to.

**Step 8 — Market context overlay.** If Nifty PE is in the 90th percentile historically and VIX is low, suggest holding 20% of equity allocation as cash for 1–2 months. If markets have corrected 15%+ from recent highs, suggest deploying sitting cash plus monthly contribution. Conservative valuation-aware adjustments, not market timing.

**Step 9 — Tax timing.** January–February pushes 80C completion. March flags unused ₹1.5L bucket. April–May reminds about advance tax for capital gains. December–January suggests tax loss harvesting if applicable.

**Step 10 — Narrative generation.** All the above produces a structured recommendation object. The LLM takes this JSON and writes a 200-word personalised plan in natural language.

### 6.1 SIP Advice Rules

The rules engine evaluates each SIP against these triggers.

**Stop this SIP** triggers when:
- Fund has underperformed its benchmark by more than 2% annualised for 3+ consecutive years
- Fund manager changed more than 18 months ago and performance has declined since
- Fund has merged or changed mandate significantly
- Fund's expense ratio is significantly higher than category average and performance does not justify it

**Increase this SIP** triggers when:
- Income has gone up (detected from salary credits) and savings rate has dropped
- A goal is going off-track and the shortfall can be closed by increasing a specific well-performing SIP
- A step-up trigger is due (e.g., "increase 10% every year in April")

**Decrease this SIP** triggers when:
- Asset allocation has drifted heavily into one category and this SIP is feeding the over-allocated category
- A goal is fully on-track and the SIP can be redirected to another goal that is behind

**Pause this SIP** triggers when:
- Emergency fund has been depleted below 3 months of expenses
- A high-cost debt has appeared that should be paid down first
- Job loss or income disruption flagged

**Start a new SIP** triggers when:
- Surplus has been sitting idle in savings for 2+ months
- A new goal has been created that needs funding
- An existing goal needs more contribution than current SIPs provide

Each rule produces a recommendation object with severity (info, watch, act-now), reasoning, specific number, and supporting data. The LLM converts to natural language. The user (me) decides and executes manually on AMC or broker site.

---

## 7. Architecture

### 7.1 The Big Picture

A polyglot architecture with two services that communicate over HTTP.

**.NET service** — primary backend. Owns user data, transactions, goals, holdings, the database, business workflows, the rules engine. The frontend talks only to this service. Source of truth.

**Python service** — analytics and AI worker. Owns CAS parsing, bank PDF parsing, financial math (XIRR, Monte Carlo), market data fetching, LLM narrative generation. Stateless. Called by .NET over HTTP, returns structured results.

### 7.2 Why Two Services

Each language does what its ecosystem does best.

.NET wins on — typed business logic, EF Core for data modelling, dependency injection, Hangfire for scheduled jobs, mature observability, Clean Architecture patterns. Plays to my existing strength and ships fast.

Python wins on — financial libraries (`casparser`, `numpy-financial`, `pandas`), market data clients (`mftool`, `nsepython`), LLM SDKs (Anthropic Python is the reference implementation), document parsing, anything data-and-AI heavy.

The split also lets each service scale independently and evolve independently. And it produces a real polyglot architecture I can talk about in interviews with hands-on credibility.

### 7.3 Communication Pattern

.NET calls Python via HTTP REST. Endpoints on the Python service include `POST /parse-cas`, `POST /parse-bank-statement`, `POST /compute-xirr`, `POST /run-monte-carlo`, `POST /fetch-market-data`, `POST /generate-narrative`.

Resilience handled in .NET via Polly — retries with exponential backoff, circuit breaker, timeout policies. Correlation IDs flow through both services for traceability.

### 7.4 Discipline — Earn the Polyglot

Important — I will NOT start with two services on day one. Phase 1 builds .NET as a monolith with an `IFinancialAnalysisService` interface. Behind the interface I write a simple .NET implementation, even if it is approximate. Get the full product loop working end-to-end in .NET first. Then extract one piece at a time into Python as real pain emerges.

This avoids premature complexity. It also produces a better interview story — "I started as a monolith and extracted services when pain emerged. I now believe you should earn microservices, not design them upfront."

---

## 8. Tech Stack

### 8.1 Frontend — Next.js

- Next.js 14 (App Router) with TypeScript
- React 18 — Server Components for initial data, Client Components for interactivity
- Tailwind CSS for styling
- shadcn/ui for components (Radix-based, Tailwind-styled, copy-paste ownership — no lock-in)
- TanStack Query (React Query) for client-side data fetching, caching, and mutations
- Axios for HTTP calls to the .NET API
- Jest + React Testing Library for component tests

### 8.2 .NET Service

- ASP.NET Core 8 Web API — pure REST, no server-rendered views
- EF Core 8 with PostgreSQL provider
- Hangfire for scheduled jobs (running on Postgres backend)
- Polly for resilience when calling the Python service
- Serilog for structured logging
- CORS configured to allow requests from the Next.js dev server and production domain
- xUnit + FluentAssertions for tests
- Clean Architecture layout — Domain, Application, Infrastructure, Api

### 8.3 Python Service

- FastAPI for the HTTP layer
- Pydantic for request/response models
- `casparser` for CAS report parsing
- `pdfplumber` or `pypdf` for bank statement parsing
- `numpy-financial` for XIRR, IRR, NPV
- `numpy` and `pandas` for analysis
- `mftool` and `nsepython` for Indian market data
- Anthropic Python SDK for LLM calls
- APScheduler for any Python-side scheduled tasks (or triggered by .NET via Hangfire)
- pytest for tests

### 8.4 Shared Infrastructure

- PostgreSQL — shared database, owned by .NET (writes), read-only access for Python where needed
- Docker — both services containerised, docker-compose for local development
- Redis — added in phase 2 for caching market data
- Anthropic Claude Haiku — narrative generation (cheap, fast, good enough for templated narratives)

### 8.5 Hosting

- Development — local on laptop, both services in docker-compose
- Production — Railway or Fly.io for both services on free tier, Postgres managed
- Domain — optional, can use Railway-provided URL initially

### 8.6 Tooling

- Git + GitHub from sprint 1
- GitHub Actions for CI (build + test on every push)
- Claude Code as primary development tool — used for scaffolding, boilerplate, and exploration
- Every line of code read and understood before merging — no blind AI commits

### 8.7 Monthly Running Cost Estimate

- Postgres free tier — ₹0
- Railway/Fly free tier — ₹0
- Anthropic Claude Haiku — under ₹100/month at single-user scale
- Market data — free tier of public Indian APIs
- Total — under ₹200/month for the next 12 months

---

## 9. Repository Structure

Monorepo on GitHub. Both services in one repo for simplicity at this stage.

```
finadvisor/
├── README.md
├── docker-compose.yml
├── .github/
│   └── workflows/
│       ├── dotnet-ci.yml
│       ├── python-ci.yml
│       └── nextjs-ci.yml
├── src/
│   ├── FinAdvisor.Api/              # ASP.NET Core 8 — pure REST API
│   ├── FinAdvisor.Domain/           # Entities, value objects, domain logic
│   ├── FinAdvisor.Application/      # Use cases, interfaces, DTOs
│   ├── FinAdvisor.Infrastructure/   # EF Core, external service clients, Hangfire jobs
│   ├── web/                         # Next.js 14 frontend
│   │   ├── app/                     # App Router — pages and layouts
│   │   ├── components/              # Shared React components
│   │   │   ├── ui/                  # shadcn/ui primitives
│   │   │   └── features/            # Feature-specific components
│   │   ├── lib/                     # API client, query hooks, utils
│   │   ├── types/                   # TypeScript types mirroring .NET DTOs
│   │   ├── package.json
│   │   ├── next.config.ts
│   │   └── Dockerfile
│   └── analytics-service/           # Python FastAPI service
│       ├── app/
│       ├── tests/
│       ├── pyproject.toml
│       └── Dockerfile
├── tests/
│   ├── FinAdvisor.Domain.Tests/
│   ├── FinAdvisor.Application.Tests/
│   └── FinAdvisor.Api.Tests/
└── docs/
    ├── planning.md
    ├── sprint-plan.md
    ├── design.md
    ├── architecture.md
    ├── sprint-log.md
    └── interview-notes.md
```

`docs/interview-notes.md` is important — for every architectural decision I make, I write a short note explaining the trade-off. By the end of v1 this becomes my talking points document for senior engineering interviews.

---

## 10. Sprint Overview

| Sprint | Theme | Duration | Key Deliverable |
|--------|-------|----------|-----------------|
| 1 | Foundation & First Endpoint | 2 weeks | Repo, Clean Architecture skeleton, Postgres, health check, CI |
| 2 | Domain Model & Data Layer | 2 weeks | All core entities, EF Core, repositories, seed data |
| 3 | Next.js Setup & Net Worth Dashboard | 2 weeks | Next.js + shadcn/ui scaffold, dashboard, manual data entry |
| 4 | CAS Upload via Python Service | 2 weeks | First polyglot cut, CAS parsing, holdings auto-populated |
| 5 | XIRR, Benchmarks & SIP Health | 2 weeks | SIP performance view, nightly NAV refresh job |
| 6 | Goal Engine & Monte Carlo | 2 weeks | Goal probability, percentile bands |
| 7 | Recommendation Engine | 2 weeks | Rules engine, Actions/Watches/Wins on dashboard |
| 8 | Monthly Plan & LLM Narrative | 2 weeks | Full monthly plan, LLM narrative, email delivery |
| 9 | Bank Statement & Cash Flow | 2 weeks | PDF parsing, categorisation, cash flow view |
| 10 | Tax Module & Telegram | 2 weeks | 80C tracking, Telegram notifications |
| 11 | Production Deploy & Observability | 2 weeks | Live on Railway, logging, backups, monitoring |
| 12 | Polish, Docs & Interview-Ready | 2 weeks | ADRs, README, demo video, UX polish |

Detailed task breakdowns for each sprint are in `docs/sprint-plan.md`.

---

## 11. Timeline Summary

With 10–15 hours/week and Claude Code accelerating boilerplate:

- Sprints 1–3 (foundation, domain, manual entry) — 6 weeks
- Sprints 4–6 (first polyglot, XIRR, goals) — 6 weeks
- Sprints 7–8 (recommendations, monthly plan) — 4 weeks
- Sprints 9–10 (cash flow, tax, notifications) — 4 weeks
- Sprints 11–12 (deploy, polish) — 4 weeks

**Total — approximately 24 weeks (6 months) for full v1.**

First version usable for myself (basic dashboard + manual entry + CAS upload) by end of Sprint 4 — 8 weeks in.

First version producing a real monthly plan by end of Sprint 8 — 16 weeks in.

---

## 12. Working Discipline

**Every line of AI-generated code is read and understood before commit.** No blind merges. If I cannot explain why a line exists, it does not get committed.

**Every architectural decision is logged in `docs/interview-notes.md`.** Short note, what was decided, what alternatives were considered, why this won.

**Every sprint ends with a working, deployable state.** No "halfway through a refactor" sprints. The main branch is always green.

**Financial math is verified manually for at least one example.** XIRR, Monte Carlo, tax calculations — I run a known case through Excel or by hand and confirm the output. AI gets math wrong subtly. I do not trust without verifying.

**The LLM never produces numbers.** All numbers come from the rules engine. The LLM only writes natural language around the numbers given to it. The prompt explicitly instructs this. I test it adversarially.

**Conservative advice always.** When in doubt, the rules recommend the more boring option. Emergency fund first, debt before investing, less market timing, more dollar-cost-averaging.

---

## 13. Roadmap Beyond v1

**v2 — Open to friends.** Adds authentication, multi-tenancy, basic onboarding, disclaimers, "education and analysis" framing. Selected friends use it. Real feedback. Real edge cases. Likely 3–4 months of work.

**v3 — Open to public.** Adds proper UX polish, payment integration, SEBI RIA path or partnership, marketing site, support workflows. Real product. Likely 6+ months from v2.

The decisions made in v1 should not block v2 or v3. Specifically — clean separation of user-specific data (even if there is only one user), no hard-coded "me" in business logic, all configuration externalised.

---

## 14. Open Questions for Later

- Should I register as an individual SEBI RIA before v2 opens to friends, or stick with education-and-analysis framing?
- At what user count does the polyglot architecture justify a proper message queue (RabbitMQ, NATS) instead of synchronous HTTP?
- When should the frontend move from Razor Pages to Next.js for a richer UX? Likely v3 not v2.
- What is the right pricing model when this opens to public? Current view is subscription only (₹199–499/month) with no commission.
- What is the data privacy and security posture for v2 and v3? Encryption at rest, access logs, audit trail, all need design.

---

## 15. Closing

This document is the plan. It will be wrong in some places. Sprint scope will shift. Some sprints will take 3 weeks instead of 2. Some features will get cut. That is fine. The plan is a starting point, not a contract.

The principles are non-negotiable. Build for myself first. Ship something working in 4 months. Polyglot for the right reasons. Earn the architecture, do not over-design. Every architectural decision documented. The LLM writes words, not numbers. Conservative advice. Boring is better.

If I open this document in six months and the product is running, producing my monthly plan, and helping me make better decisions about my money — the plan succeeded. Everything else is detail.

---

*Document version 1.0 — initial plan, to be updated as sprints complete.*
