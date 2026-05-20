# Financial Advisor Platform — Planning Document

[Product Name TBD] — Planning Document

[Product Name TBD]
AI-Powered SIP & Portfolio Intelligence for Indian Investors
Product, Architecture & Go-to-Market Plan

Prepared for MC
Version 1.0

## 1. Executive Summary

This document outlines the product vision, technical architecture, feature scope, sprint plan, and go-to-market strategy for an AI-powered financial intelligence platform focused on Indian retail investors. The product is designed first as a personal-use tool for the founder and then scaled into a public SaaS as the analytical engine matures.

The core thesis is simple: most Indian retail investors run their SIPs blindly. They start contributions based on a friend's tip, a YouTube reel, or a bank RM's pitch, and then never revisit them. They have no clear answer to four questions: Am I on track for my goal? Is this fund actually performing? Should I be doing something differently? What does my overall portfolio look like? Existing platforms either oversimplify (Groww, Kuvera) or overwhelm (Value Research, Morningstar). This product targets the middle: structured, transparent analytics that empower informed decisions without crossing into regulated advisory territory.

## Strategic Positioning

Insights, not advice.

Every output is framed as analytical insight, not a buy/sell/hold instruction.

Naming conventions: "Performance Signal", "Fund Health Score", "Goal Gap Analysis" — never "Buy", "Sell", or "Recommendation".

Clear disclaimers across the product: not a SEBI-registered investment adviser; outputs are educational and analytical only.

This unlocks 95% of the planned feature set legally while leaving the door open to a future SEBI RIA partnership or license once revenue justifies the regulatory overhead.

## Phased Product Strategy

| Phase | Scope | Primary User | Timeline |
|---|---|---|---|
| Phase 1 | Personal tool. Manual entry, core SIP analytics, goal planner, fund database. Built end-to-end by founder. | Founder only | Months 1–4 |
| Phase 2 | Closed beta. CAS PDF parsing, portfolio dashboard, alerts, comparison engine, mobile-responsive UI. | ~50 invited users | Months 5–8 |
| Phase 3 | Public SaaS launch. MF Central / Account Aggregator integration, freemium pricing, content marketing, paid acquisition. | Public | Months 9–14 |
| Phase 4 | Revenue scaling. Premium features, tax module, distribution partnership or RIA license decision. | Public + Pro | Month 15+ |

## Why This Project, Why Now

1. Personal pain: the founder is an active investor without good tooling to evaluate SIPs and reach goals.
2. Skill compounding: builds on the .NET Clean Architecture + CQRS foundation established in LeadWala, and shares the React + Next.js frontend stack with BillShip.
3. Market timing: SIP inflows in India crossed ₹25,000 crore/month in 2025; retail mutual fund AUM continues to grow at 20%+ YoY.
4. Regulatory tailwind: Account Aggregator framework now mature enough to power consent-based data fetch, eliminating manual data entry friction over time.
5. Defensible niche: hyper-focused on retail SIP analytics, not a full-stack broker — narrower scope, sharper value prop.

## 2. Product Vision & Positioning

### 2.1 The Core Problem

The Indian retail mutual fund investor faces a paradox of plenty. There are over 2,500 active mutual fund schemes, dozens of investment platforms, and an endless stream of financial content. Yet the average investor cannot confidently answer:

1. Is my SIP actually performing well, or just riding a market wave?
2. Am I going to reach my goal of ₹X by year Y at this contribution rate?
3. Is this fund still the right choice, or has it drifted from its mandate?
4. Am I over-concentrated in one sector, AMC, or fund category?
5. Am I leaving tax savings on the table?

Existing tools fall into two camps. Discount brokers and distributor apps optimize for transaction flow — they want users to buy and hold, not to scrutinize. Professional research platforms cater to analysts and advisors, not retail investors. There is no tool that sits between them: analytically rigorous, but built for the retail investor who wants to think more clearly about their own money.

### 2.2 Product Vision Statement

To become the most trusted analytical companion for Indian retail mutual fund investors — a platform that transforms passive SIPs into informed, goal-aligned investment decisions through transparent, evidence-based insights.

Not a broker. Not an advisor. A thinking tool.

### 2.3 Target User Personas

#### Persona 1: The Diligent Accumulator (Primary)

Age & Stage: 28–40, salaried professional, 4–12 years into their career.

Income: ₹12L–₹40L annual; ₹15K–₹60K monthly investible surplus.

Behaviour: Runs 3–8 SIPs across 2–4 platforms; checks portfolio monthly out of habit, not insight.

Pain: Doesn't know if their funds are actually good; afraid to change anything in case they make it worse.

Willingness to pay: ₹299–₹599/month for clarity and confidence.

#### Persona 2: The Goal-Driven Planner (Secondary)

Age & Stage: 32–48, often a parent or planning a major life event.

Income: ₹18L–₹60L annual; running multiple SIPs tied loosely to goals.

Behaviour: Wants explicit goal tracking, not just portfolio value; willing to model scenarios.

Pain: Knows their goal amounts but doesn't know if their current SIPs will get them there.

Willingness to pay: ₹499–₹999/month for serious goal-based planning.

#### Persona 3: The DIY Researcher (Future Pro Tier)

Age & Stage: 35–55, more financially sophisticated; may be a CA, finance professional, or seasoned investor.

Income: ₹40L+; ₹1L+ monthly investible.

Behaviour: Wants deep comparison tools, factor analysis, rolling returns, downside metrics.

Pain: Existing retail tools too shallow; professional tools too expensive.

Willingness to pay: ₹1,499–₹2,999/month for professional-grade retail analytics.

## 3. Regulatory Framing

This is the single most important architectural decision in the product, and it shapes everything from copy to feature naming to ML model output formatting.

### 3.1 What SEBI Regulates

Two relevant SEBI regulations apply:

1. Investment Advisers Regulations, 2013: anyone providing personalized investment advice for consideration must be a registered Investment Adviser.
2. Research Analysts Regulations, 2014: anyone publishing research reports or buy/sell/hold recommendations on securities must register as a Research Analyst.

The intended lane is general financial education, software-based tools that do not give personalized advice, and platforms that present information without making recommendations.

### 3.2 The Insights-Not-Advice Operating Principle

Every analytical output is reframed from prescription to description.

Replace verbs of action such as "buy", "sell", "stop", and "increase" with verbs of observation such as "underperforms", "diverges from", "ranks below", and "falls short of".

### 3.3 What We Will and Won't Do

Allowed:

- Show fund performance vs. benchmark and peers.
- Surface fund health diagnostics.
- Project goal achievement at current contribution rate.
- Run risk profiling questionnaires.
- Compare funds side-by-side on objective metrics.
- Alert on factual events.
- Suggest tax-saving categories and limits.

Not allowed in v1:

- Tell user which specific fund to buy.
- Tell user to stop or pause a specific SIP.
- Recommend a specific monthly amount as advice.
- Match a user to a specific portfolio model.
- Rank funds and present #1 as a recommendation.
- Alert with action language.
- Recommend specific products to maximize tax savings.

### 3.4 Standard Disclaimer

[Product Name] is an analytical platform and not a SEBI-registered Investment Adviser or Research Analyst. The information presented is for educational and analytical purposes only and does not constitute investment advice. Mutual fund investments are subject to market risks. Please read scheme-related documents carefully and consult a qualified adviser before making investment decisions.

## 4. Feature Scope

### 4.1 SIP Analysis Engine

Performance diagnostics:

- XIRR vs. category benchmark.
- Rolling returns compared to category and benchmark index.
- Risk-adjusted return: Sharpe, Sortino, alpha, beta.
- Drawdown analysis.
- Consistency score.

Fund health signals:

- Benchmark drift.
- Portfolio churn.
- AUM trajectory.
- Fund manager continuity.
- Expense ratio vs. category median.
- Holdings and sector concentration.

SIP context signals:

- SIP duration and rupee cost averaging benefit.
- Market drawdown educational note.
- Total invested vs. current value vs. projected value.
- Step-up history and impact.

### 4.2 Goal-Based Investment Planning

- Goal templates.
- Inflation-adjusted target calculation.
- Mapping SIPs to goals.
- Projected corpus simulation.
- Gap analysis.
- Sensitivity analysis.

### 4.3 Portfolio Tracking & Dashboard

- Consolidated portfolio view.
- Asset allocation breakdown.
- Concentration analysis.
- AMC concentration.
- Net XIRR.
- Performance attribution.

### 4.4 Risk Profiling

- 12-question risk profiling questionnaire.
- Risk profile output.
- Actual portfolio risk vs. stated tolerance.
- Re-profile prompt every 12 months or major life event.

### 4.5 Mutual Fund Comparison

- Side-by-side comparison of up to 4 funds.
- Smart comparison sets.
- Rolling returns and drawdown chart overlays.
- Holdings overlap.

### 4.6 Tax-Saving Insights

- Section 80C utilization tracker.
- ELSS lock-in tracker.
- Capital gains preview.
- NPS tracker.
- New vs. old regime analyzer.

### 4.7 Alerts & Notifications

- Fund manager change.
- Benchmark drift.
- Sustained underperformance.
- Rating downgrade.
- Major AUM inflow/outflow.
- Goal off-track warning.
- Risk-profile drift warning.
- Tax deadline reminders.

### 4.8 Personalized Insights Feed

- Weekly digest email.
- In-app insights stream.
- Specific, non-obvious insights without transaction push.

## 5. Technical Architecture

### 5.1 Stack Summary

| Layer | Technology | Rationale |
|---|---|---|
| Frontend | Next.js 15, TypeScript, Tailwind, shadcn/ui, Tremor, Recharts | SSR for SEO and mature dashboard ecosystem |
| Backend API | ASP.NET Core 8 Web API | Founder strength and continuity |
| Architecture | Clean Architecture + CQRS + MediatR | Separation of domain logic from infrastructure |
| Database | PostgreSQL 16 + TimescaleDB | OLTP plus time-series NAV workload |
| Cache | Redis | Query results, metadata, rate limiting |
| Background jobs | Hangfire | NAV ingestion, alerts, weekly digests |
| Auth | ASP.NET Core Identity + JWT | Stable and supports future MFA |
| Hosting | Linux VM or Azure App Service initially; Azure managed stack later | Cheap initially, scalable later |
| Email | Resend or AWS SES | Transactional and digest emails |
| File storage | Azure Blob Storage | CAS PDFs and user uploads |
| Observability | Serilog, Seq, Application Insights | Developer familiarity |

### 5.2 Clean Architecture Layout

```text
FinAdvisor.sln
├── src/
│   ├── FinAdvisor.Domain
│   ├── FinAdvisor.Application
│   ├── FinAdvisor.Infrastructure
│   ├── FinAdvisor.Api
│   └── FinAdvisor.Jobs
└── tests/
    ├── FinAdvisor.Domain.Tests
    ├── FinAdvisor.Application.Tests
    └── FinAdvisor.Api.IntegrationTests
```

Core aggregates: User, Portfolio, Folio, SIP, Goal, Fund, NavPoint, RiskProfile, Alert, Insight.

Value objects: Money, Period, XIRR, RiskScore, FundCategory.

Domain events: SipCreated, SipPaused, FundHealthDeteriorated, GoalOffTrack, BenchmarkDriftDetected.

Domain services: GoalProjectionService, XirrCalculator, FundHealthScorer.

### 5.3 Data Sourcing Strategy

Tier 1 — NAV & Scheme Master:

- AMFI India daily NAV file.
- Daily ingestion at 11:00 PM IST via Hangfire.
- Scheme master ingestion weekly.

Tier 2 — Fund Metadata Enrichment:

- AMC factsheets.
- Value Research / Morningstar manual curation where APIs are unavailable.
- Benchmark indices.

Tier 3 — User Portfolio Data:

- Phase 1: Manual entry.
- Phase 2: CAS PDF parsing.
- Phase 3: MF Central / Account Aggregator.

### 5.4 Database Schema

Key tables:

- users
- risk_profiles
- funds
- nav_history
- benchmarks
- folios
- holdings
- transactions
- sips
- goals
- fund_holdings
- alerts
- insights

### 5.5 Key External APIs & Integrations

- AMFI NAV feed.
- NSE / BSE benchmark indices.
- CAMS / KFintech CAS files.
- Account Aggregator FIU partner.
- Razorpay / Stripe.
- Resend / SES.
- OpenAI / Anthropic API.

### 5.6 AI / LLM Integration

LLMs are used in a constrained, observable way:

- Insight narration.
- Pattern matching.
- Grounded Q&A surface in V3.
- Guardrails preventing advice-like outputs.

## 6. The Analytical Engine

### 6.1 XIRR

XIRR is the correct return metric for SIPs because it accounts for the timing of every cash flow.

Implementation:

- Cash flow series: SIP installments as negative outflows and current portfolio value as positive inflow.
- Newton-Raphson with Brent fallback.
- Pure C# implementation in Domain layer.
- Unit tests against Excel/Google Sheets reference.

### 6.2 Goal Projection Engine

- Deterministic projection.
- Monte Carlo simulation in V3.
- Inflation-adjusted target.
- Goal gap calculation.

### 6.3 Fund Health Score

Composite score from:

- 3Y rolling return vs. category median.
- 5Y Sharpe vs. category median.
- Maximum drawdown vs. category.
- Consistency.
- Expense ratio.
- AUM stability.
- Portfolio churn.
- Mandate adherence.
- Manager continuity.

### 6.4 Risk Profiling Algorithm

- 12 questions across time horizon, loss tolerance, income stability, dependents, and prior experience.
- Weighted score mapped to 5 risk buckets.
- Confidence band based on answer consistency.
- Portfolio risk score compared to stated profile.

### 6.5 Alert Evaluation Engine

- Hangfire job evaluation.
- Alert rules with condition, throttle, and severity.
- In-app and email notification dispatch.
- Observational copy only.

## 7. Sprint Plan

### 7.1 Phase 1 — Personal Tool

| Sprint | Focus | Deliverables |
|---|---|---|
| S1 | Project scaffolding | Clean Arch solution, Postgres + TimescaleDB, EF migrations, identity, Next.js shell |
| S2 | Scheme master + NAV ingestion | AMFI ingest job, scheme sync, NAV hypertable, admin status |
| S3 | Folios & holdings | CRUD for folios, holdings, transactions, portfolio summary |
| S4 | SIP entity + XIRR engine | SIP CRUD, installment generation, XIRR calculator + tests |
| S5 | Performance analytics | Rolling returns, Sharpe/Sortino, drawdown, benchmark charts |
| S6 | Risk profiling | Questionnaire UI, scoring engine, dashboard surfacing |
| S7 | Goal planner | Goal CRUD, SIP-goal mapping, projection, gap analysis |
| S8 | Polish + dogfood | Bug fixes, performance, founder usage |

### 7.2 Phase 2 — Closed Beta

| Sprint | Focus | Deliverables |
|---|---|---|
| S9 | CAS PDF parser | Upload flow, password handling, parser, folio mapping |
| S10 | Fund health scoring | Health score engine, breakdown UI, methodology page |
| S11 | Fund comparison | Comparison page, holdings overlap, smart sets |
| S12 | Alert engine | Rule engine, evaluator job, channels, preferences |
| S13 | Insights feed | Insight generation service, stream, weekly digest |
| S14 | Onboarding + UX polish | Multi-step onboarding, empty/error states, mobile responsiveness |
| S15 | Beta invitations | Invite system, feedback widget, analytics |
| S16 | Beta iteration | User interviews and rapid fixes |

### 7.3 Phase 3 — Public Launch

| Sprint | Focus | Deliverables |
|---|---|---|
| S17 | Pricing + billing | Free/Pro tiers, Razorpay, gating |
| S18 | Tax-saving tracker | 80C tracker, ELSS lock-in, gains preview |
| S19 | Monte Carlo goals | Probabilistic projections, percentile bands |
| S20 | MF Central preparation | AA partner selection, legal contracts, sandbox |
| S21 | AA integration | Consent flow, data fetch, portfolio mapping |
| S22 | Public landing site | Marketing pages, blog, SEO, fund pages |
| S23 | Public launch | Open signups and launch announcement |
| S24 | Content engine | Cornerstone articles and comparison pages |
| S25 | Holdings overlap + advanced viz | Stock overlap and sector heatmaps |
| S26 | Mobile app shell | PWA, push notifications, offline cache |
| S27 | Performance + scale | Query optimization, Redis, CDN, load testing |
| S28 | Phase 3 retro | Analytics review and Phase 4 planning |

## 8. Go-to-Market Strategy

### 8.1 Positioning

For Indian retail mutual fund investors who run SIPs but don't know if they're working, [Product Name] is an analytical companion that turns scattered investments into clear, goal-aligned decisions — unlike Groww or Kuvera, which optimize for transactions, we optimize for understanding.

### 8.2 Pricing Model

| Tier | Price Monthly | Annual | What's Included | Target |
|---|---:|---:|---|---|
| Free | ₹0 | ₹0 | Up to 3 funds, basic portfolio, manual entry, weekly digest | Acquisition |
| Plus | ₹299 | ₹2,999 | Unlimited funds, CAS upload, alerts, goal planner, full SIP analytics | Persona 1 |
| Pro | ₹599 | ₹5,999 | Monte Carlo, advanced comparison, tax tracker, AA integration | Persona 2 |
| Elite | ₹1,499 | ₹14,999 | Holdings overlap, factor analysis, priority support, family accounts | Persona 3 |

### 8.3 Channel Strategy

- Content and SEO.
- Community.
- Founder-led build-in-public.
- Paid acquisition after PMF.

### 8.4 Pre-Launch Beta Strategy

- 50–100 hand-picked beta users.
- White-glove onboarding.
- Weekly office hours.
- Fast feedback loop.

### 8.5 Launch Plan

- Soft launch.
- Founder story.
- Generous but bounded free tier.
- Lifetime price lock for first 100 paid users.

### 8.6 Success Metrics by Phase

| Phase | Primary Metric | Target |
|---|---|---|
| P1 | Founder weekly active usage | ≥ 4 days/week for 4 consecutive weeks |
| P2 | Beta retention | ≥ 60% active in week 8 |
| P3 M9–11 | Free signups + activation | 1,000 free signups; ≥ 30% activate |
| P3 M12–14 | Paid conversion + MRR | ₹2L MRR; free→Plus ≥ 4%; Plus→Pro ≥ 10% |
| P4 | Sustained growth | 20% MoM revenue growth; NRR ≥ 105% |

## 9. Next Steps

Immediate Actions:

1. Lock product name.
2. Repo scaffolding.
3. AMFI NAV ingestion proof-of-concept.
4. Wireframe portfolio dashboard, SIP detail page, and goal planner.
5. Set up build-in-public presence.

Decision points:

| Decision | Owner | Deadline |
|---|---|---|
| Final product name | Founder | End of Sprint 1 |
| Hosting choice | Founder | End of Sprint 1 |
| LLM provider | Founder | Sprint 13 |
| AA partner selection | Founder | Sprint 20 |
| Pricing finalization | Founder | Sprint 17 |
| RIA partnership vs. own license | Founder | Phase 4 entry |

The defining bet of this product is that retail Indian investors will pay for clarity. Not for transactions, not for advice, not for content — for clarity about the money they've already invested.
