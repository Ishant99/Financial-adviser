# UI Design — Personal AI Financial Advisor

This document is the design reference. Use it side by side with Claude when building Razor Pages.
Each section describes a page or component: layout, what goes where, what each element does,
and any interaction notes. Update this file as the design evolves.

---

## Design Principles

1. **Information density over decoration.** Every pixel earns its place. No hero images, no gradients, no animations for their own sake.
2. **Numbers are the UI.** The most important numbers are the biggest things on the page.
3. **Actions are never buried.** If the app wants me to do something, it says so at the top of the dashboard — not tucked in a settings page.
4. **Calm by default.** Green = good, amber = watch, red = act now. Used sparingly so they mean something.
5. **Mobile-readable, not mobile-first.** I will mostly use this on a laptop, but it should not break on a phone.

---

## Visual Language

### Colour Palette (Tailwind classes)

| Role | Class | Use |
|------|-------|-----|
| Background | `bg-gray-950` | Page background |
| Surface | `bg-gray-900` | Cards, panels |
| Border | `border-gray-800` | Card borders, dividers |
| Primary text | `text-gray-100` | Headlines, key numbers |
| Secondary text | `text-gray-400` | Labels, subtext, captions |
| Muted text | `text-gray-600` | Placeholders, disabled states |
| Accent (brand) | `text-indigo-400` | Links, active nav, primary buttons |
| Healthy / Win | `text-emerald-400` | Positive status, win cards |
| Watch | `text-amber-400` | Warning status, watch cards |
| Act Now | `text-red-400` | Urgent status, action cards |
| Neutral number | `text-gray-100` | Plain financial figures |
| Positive delta | `text-emerald-400` | Gains, increases |
| Negative delta | `text-red-400` | Losses, decreases |

### Typography

| Element | Classes |
|---------|---------|
| Page title | `text-2xl font-semibold text-gray-100` |
| Section heading | `text-lg font-medium text-gray-200` |
| Card heading | `text-sm font-medium text-gray-400 uppercase tracking-wider` |
| Hero number (net worth) | `text-5xl font-bold text-gray-100 tabular-nums` |
| Large number | `text-2xl font-semibold text-gray-100 tabular-nums` |
| Medium number | `text-lg font-medium text-gray-100 tabular-nums` |
| Body text | `text-sm text-gray-300` |
| Caption | `text-xs text-gray-500` |

### Spacing and Layout

- Page padding: `px-6 py-6` (desktop), `px-4 py-4` (mobile)
- Max content width: `max-w-6xl mx-auto`
- Card padding: `p-5`
- Card radius: `rounded-xl`
- Card border: `border border-gray-800`
- Section gap: `gap-6`
- Item gap within a card: `gap-3`

### Buttons

| Type | Classes |
|------|---------|
| Primary | `bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-lg` |
| Secondary | `bg-gray-800 hover:bg-gray-700 text-gray-200 text-sm font-medium px-4 py-2 rounded-lg` |
| Danger | `bg-red-900 hover:bg-red-800 text-red-200 text-sm font-medium px-4 py-2 rounded-lg` |
| Ghost | `text-indigo-400 hover:text-indigo-300 text-sm font-medium` |
| Icon button | `p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-gray-200` |

### Status Badges

```
Healthy  →  bg-emerald-900/50 text-emerald-400 border border-emerald-800
Watch    →  bg-amber-900/50 text-amber-400 border border-amber-800
Act Now  →  bg-red-900/50 text-red-400 border border-red-800
Info     →  bg-gray-800 text-gray-400 border border-gray-700
```

All badges: `text-xs font-medium px-2.5 py-0.5 rounded-full`

---

## Layout Shell

### Navigation (left sidebar on desktop, bottom bar on mobile)

```
┌─────────────────────────────────────────────────────────────────┐
│  FinAdvisor                                          [username]  │ ← top bar (mobile only)
├──────────┬──────────────────────────────────────────────────────┤
│          │                                                       │
│  NAV     │   PAGE CONTENT                                        │
│          │                                                       │
│ ○ Home   │                                                       │
│ ○ Plan   │                                                       │
│ ○ SIPs   │                                                       │
│ ○ Goals  │                                                       │
│ ○ Cash   │                                                       │
│ ○ Tax    │                                                       │
│          │                                                       │
│ ─────    │                                                       │
│ ○ Upload │                                                       │
│ ○ Settings│                                                      │
│          │                                                       │
└──────────┴──────────────────────────────────────────────────────┘
```

**Nav sidebar specs:**
- Width: `w-56` (desktop), hidden on mobile
- Background: `bg-gray-900 border-r border-gray-800`
- Nav item: `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm`
- Active item: `bg-indigo-600/20 text-indigo-400`
- Inactive item: `text-gray-400 hover:text-gray-200 hover:bg-gray-800`
- Action count badge on "Home": red dot with number

---

## Page: Dashboard (Home)

**Purpose:** One-glance view of financial health. Most important page.

```
┌─────────────────────────────────────────────────────────────────┐
│  Good morning, Ishant                         May 2026          │
├────────────────────────────┬────────────────────────────────────┤
│                            │  ACTIONS (2)                       │
│  NET WORTH                 │ ┌──────────────────────────────┐   │
│  ₹47,32,481                │ │ 🔴 Increase HDFC Flexi SIP   │   │
│  ↑ ₹1,24,000 this month   │ │    ₹5,000 → ₹8,000           │   │
│                            │ │    Goal shortfall: ₹12L      │   │
│  Equity MF    ₹28,10,000  │ └──────────────────────────────┘   │
│  Debt MF       ₹8,40,000  │ ┌──────────────────────────────┐   │
│  Bank           ₹4,20,000 │ │ 🔴 Complete 80C (₹32,000     │   │
│  EPF            ₹6,12,481 │ │    remaining) before March   │   │
│  Gold             ₹50,000 │ └──────────────────────────────┘   │
│                            │                                    │
│                            │  WATCHES (1)                       │
│                            │ ┌──────────────────────────────┐   │
│                            │ │ 🟡 Axis Bluechip 10 qtrs     │   │
│                            │ │    below benchmark           │   │
│                            │ └──────────────────────────────┘   │
│                            │                                    │
│                            │  WINS (1)                          │
│                            │ ┌──────────────────────────────┐   │
│                            │ │ ✅ Emergency fund at 6 months │  │
│                            │ └──────────────────────────────┘   │
├────────────────────────────┴────────────────────────────────────┤
│  MAY PLAN                        GOALS (3)                      │
│ ┌───────────────────────┐   ┌───────────────────────────────┐   │
│ │ Your surplus this     │   │ Retirement      87% on track  │   │
│ │ month is ₹42,000.     │   │ ████████████░░░  ₹28L / ₹32L │   │
│ │ After clearing your   │   │                               │   │
│ │ CC balance (₹8,200)   │   │ House DP        61% on track  │   │
│ │ you have ₹33,800 to   │   │ ████████░░░░░░  ₹9L / ₹15L   │   │
│ │ deploy across goals.  │   │                               │   │
│ │                       │   │ Emergency Fund  ✅ Complete   │   │
│ │  [See Full Plan →]    │   │ ████████████████ ₹4.2L / ₹4L │   │
│ └───────────────────────┘   └───────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

**Component breakdown:**

**Net worth card (left top)**
- `bg-gray-900 rounded-xl border border-gray-800 p-5`
- Hero number: `text-5xl font-bold text-gray-100 tabular-nums`
- Delta line: `text-sm text-emerald-400` (green if positive)
- Breakdown rows: label `text-sm text-gray-400`, value `text-sm text-gray-200 tabular-nums text-right`
- HTMX refresh: `hx-get="/dashboard/networth-partial" hx-trigger="every 60s" hx-swap="outerHTML"`

**Recommendation cards (right top)**
- Section heading has count badge: `text-xs font-medium bg-red-900/50 text-red-400 px-2 py-0.5 rounded-full`
- Each card: `bg-gray-900 border border-gray-800 rounded-lg p-4 cursor-pointer hover:border-gray-700`
- Act card left border: `border-l-2 border-l-red-500`
- Watch card left border: `border-l-2 border-l-amber-500`
- Win card left border: `border-l-2 border-l-emerald-500`
- Mark read: small X icon top-right, `hx-delete="/recommendations/{id}/read" hx-swap="outerHTML" hx-confirm="false"`

**Monthly plan card (bottom left)**
- Narrative text: `text-sm text-gray-300 leading-relaxed`
- Link: ghost button style

**Goal cards (bottom right)**
- Each goal row: name, probability badge, progress bar, amounts
- Progress bar: `bg-gray-800 rounded-full h-2` with inner `bg-indigo-500 rounded-full`
- Probability: badge coloured by threshold (≥90% emerald, 75–90% amber, <75% red)

---

## Page: Monthly Plan

**Purpose:** The flagship output. Should feel like reading a letter from your CFO.

```
┌─────────────────────────────────────────────────────────────────┐
│  Monthly Plan                                                    │
│  May 2026                                     [Generate Now]    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Your surplus this month is ₹42,000. After clearing your       │
│  credit card balance of ₹8,200, you have ₹33,800 to deploy.   │
│  Your retirement goal is slightly behind — increasing your      │
│  HDFC Flexi Cap SIP by ₹3,000 closes the gap. Your house       │
│  down payment goal is on track; no changes needed there.        │
│  Complete your remaining ₹32,000 of 80C before March.          │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│  ACTIONS                                                         │
│                                                                  │
│  1. Clear credit card balance — ₹8,200                         │
│     Your HDFC credit card has a revolving balance. At 36% APR  │
│     this costs ₹246/month in interest. Pay it first.           │
│                                                                  │
│  2. Increase HDFC Flexi Cap SIP — ₹7,000 → ₹10,000            │
│     Retirement goal is ₹12L behind the P50 projection.         │
│     This increase closes the gap over 18 months.               │
│                                                                  │
│  3. Invest ₹32,000 in PPF — complete 80C bucket               │
│     ₹68,000 used of ₹1,50,000 limit. 6 weeks until March 31.  │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│  WATCHES                                                         │
│                                                                  │
│  · Axis Bluechip: 10 consecutive quarters below benchmark       │
│    by 1.8%. One more quarter triggers a switch recommendation.  │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│  WINS                                                            │
│                                                                  │
│  ✓ Emergency fund: 6.2 months of expenses. Fully protected.    │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│  PLAN INPUTS                                            [show]  │
│  (collapsed by default — click to see the numbers behind plan)  │
│                                                                  │
│  Income: ₹1,85,000 · Fixed obligations: ₹98,000               │
│  Variable estimate: ₹45,000 · Surplus: ₹42,000                │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│  PREVIOUS PLANS                                                  │
│  April 2026 · March 2026 · February 2026 · January 2026        │
└─────────────────────────────────────────────────────────────────┘
```

**Component breakdown:**

**Narrative block**
- `bg-indigo-950/30 border border-indigo-900/50 rounded-xl p-6`
- Text: `text-base text-gray-200 leading-relaxed`
- Italic, slightly warmer than normal body text

**Action items**
- Numbered list with large numbers: `text-2xl font-bold text-indigo-400 w-8`
- Action title: `text-base font-semibold text-gray-100`
- Amount: inline, `text-emerald-400` or `text-red-400` depending on spend/invest
- Reason: `text-sm text-gray-400 mt-1`
- Separator: `border-b border-gray-800`

**Watch items**
- Bullet, amber dot: `w-2 h-2 rounded-full bg-amber-400 mt-1.5 shrink-0`
- Text: `text-sm text-gray-300`

**Win items**
- Checkmark, emerald: `text-emerald-400 font-bold`
- Text: `text-sm text-gray-300`

**Plan Inputs (collapsed)**
- HTMX toggle: `hx-get="/monthly-plan/{id}/inputs" hx-swap="innerHTML" hx-target="#plan-inputs"`
- Displays raw numbers from composer — income, expenses, surplus, each step

**Previous plans row**
- `flex gap-3 flex-wrap`
- Each plan link: `text-sm text-indigo-400 hover:text-indigo-300`

---

## Page: SIP Health

**Purpose:** At-a-glance view of every SIP with XIRR, benchmark, and status.

```
┌─────────────────────────────────────────────────────────────────┐
│  SIP Health                           Last updated: Today 9PM   │
│                                                     [Refresh]   │
├──────────────────┬────────┬────────┬──────────┬────────────────┤
│ Fund             │ Amount │ Value  │ XIRR     │ Status         │
├──────────────────┼────────┼────────┼──────────┼────────────────┤
│ HDFC Flexi Cap   │ ₹7,000 │ ₹2.8L │ 14.2%    │ ● Healthy      │
│ Nifty 50 TRI     │        │        │ 12.8%    │ +1.4% ahead    │
├──────────────────┼────────┼────────┼──────────┼────────────────┤
│ Axis Bluechip    │ ₹5,000 │ ₹1.9L │ 10.1%    │ ● Watch        │
│ Nifty 100 TRI    │        │        │ 12.3%    │ -2.2% behind   │
├──────────────────┼────────┼────────┼──────────┼────────────────┤
│ Mirae Emg Blchip │ ₹3,000 │ ₹84K  │ 16.8%    │ ● Healthy      │
│ Nifty Midcap 150 │        │        │ 15.1%    │ +1.7% ahead    │
└──────────────────┴────────┴────────┴──────────┴────────────────┘
```

**Table specs:**
- `w-full text-sm`
- Header row: `text-xs text-gray-500 uppercase tracking-wider border-b border-gray-800`
- Each fund row: `border-b border-gray-800/50 hover:bg-gray-900/50 cursor-pointer`
- Each benchmark sub-row: `text-xs text-gray-500` with indented label
- Clicking a row navigates to SIP detail page
- XIRR cell: value in `text-gray-100`, below it benchmark XIRR in `text-xs text-gray-500`
- Differential: `+X.X%` in `text-emerald-400`, `-X.X%` in `text-red-400`

**Status badge colours:**
- Healthy → `text-emerald-400`
- Watch → `text-amber-400`
- Act → `text-red-400`

---

## Page: SIP Detail

**Purpose:** Deep dive on a single SIP.

```
┌─────────────────────────────────────────────────────────────────┐
│  ← SIP Health                                                    │
│                                                                  │
│  Axis Bluechip Fund – Direct Growth               ● Watch       │
│  Nifty 100 TRI benchmark                                        │
├───────────────────────────┬─────────────────────────────────────┤
│  Monthly SIP    ₹5,000    │  Fund XIRR      10.1%              │
│  Invested       ₹2,40,000 │  Benchmark XIRR 12.3%              │
│  Current Value  ₹1,90,000 │  Differential   -2.2%              │
│  SIP Since      Apr 2021  │  Quarters below  10                 │
│  Linked Goal    Retirement │  Expense Ratio  0.58%              │
├───────────────────────────┴─────────────────────────────────────┤
│  NAV VS BENCHMARK (last 3 years)                                │
│                                                                  │
│  Date         Fund NAV    Benchmark    Differential             │
│  Jan 2026     ₹52.4       ₹18,420      —                       │
│  Oct 2025     ₹49.1       ₹17,890      —                       │
│  ...                                                             │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│  RECOMMENDATION                                                  │
│  This fund has underperformed Nifty 100 TRI by 2.2%            │
│  annualised over 3 years. If it underperforms by more than      │
│  3% after the next NAV update, we will recommend stopping       │
│  this SIP and switching to a better-performing fund.            │
└─────────────────────────────────────────────────────────────────┘
```

---

## Page: Goals

**Purpose:** All goals with progress and probability.

```
┌─────────────────────────────────────────────────────────────────┐
│  Goals                                           [+ Add Goal]   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ ┌─────────────────────────────────────────────────────────┐     │
│ │  Retirement                               87% on track  │     │
│ │  Target ₹3,00,00,000 by Dec 2045                       │     │
│ │  ████████████████████░░░░░  ₹28,10,000 of target       │     │
│ │  Monthly contribution: ₹12,000  ·  P50 completion: 2044│     │
│ │  [Details →]                          [Edit]  [Pause]  │     │
│ └─────────────────────────────────────────────────────────┘     │
│                                                                  │
│ ┌─────────────────────────────────────────────────────────┐     │
│ │  House Down Payment                       61% on track  │     │
│ │  Target ₹30,00,000 by Jun 2027                         │     │
│ │  ████████████░░░░░░░░░░░░░  ₹9,00,000 of target        │     │
│ │  Monthly contribution: ₹8,000  ·  P50 completion: 2027 │     │
│ │  [Details →]                          [Edit]  [Pause]  │     │
│ └─────────────────────────────────────────────────────────┘     │
│                                                                  │
│ ┌─────────────────────────────────────────────────────────┐     │
│ │  Emergency Fund                           ✅ Complete   │     │
│ │  Target ₹4,00,000 · Achieved Apr 2026                  │     │
│ │  ████████████████████████  ₹4,20,000 of target         │     │
│ └─────────────────────────────────────────────────────────┘     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Card specs:**
- `bg-gray-900 border border-gray-800 rounded-xl p-5`
- Goal name: `text-base font-semibold text-gray-100`
- Probability badge: coloured by threshold, top-right of card
- Progress bar: `bg-gray-800 rounded-full h-2.5 mt-3`; fill: `bg-indigo-500` (normal), `bg-emerald-500` (complete), `bg-amber-500` (behind)
- Meta row: `text-xs text-gray-500 flex gap-4 mt-2`
- Action buttons: ghost style, appear on hover (desktop) or always visible (mobile)

---

## Page: Goal Detail

```
┌─────────────────────────────────────────────────────────────────┐
│  ← Goals                                                         │
│                                                                  │
│  Retirement                                                      │
│  Target ₹3,00,00,000 by December 2045                          │
├─────────────────────────────────────────────────────────────────┤
│  Current Corpus    Monthly SIP    Time Left    Probability       │
│  ₹28,10,000        ₹12,000        19 years     87%              │
├─────────────────────────────────────────────────────────────────┤
│  PROJECTIONS (Monte Carlo, 10,000 simulations)                  │
│                                                                  │
│  Year    P10 (pessimistic)   P50 (median)   P90 (optimistic)   │
│  2030    ₹55L                ₹72L           ₹94L               │
│  2035    ₹1.1Cr              ₹1.6Cr         ₹2.3Cr             │
│  2040    ₹1.9Cr              ₹3.1Cr         ₹4.8Cr             │
│  2045    ₹2.4Cr              ₹4.2Cr         ₹7.1Cr             │
│                                                                  │
│  Target: ₹3.0Cr  ·  P50 reaches target in 2044                │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│  LINKED SIPs                                                     │
│  HDFC Flexi Cap ₹7,000/mo  ·  Mirae Emerging Bluechip ₹3,000/mo│
├─────────────────────────────────────────────────────────────────┤
│  ASSUMPTIONS                                                     │
│  Equity 12% expected return, 18% volatility                    │
│  Asset allocation: 80% equity / 15% debt / 5% gold             │
└─────────────────────────────────────────────────────────────────┘
```

---

## Page: Cash Flow

```
┌─────────────────────────────────────────────────────────────────┐
│  Cash Flow                  [← Apr]  May 2026  [Jun →]         │
├─────────────────────────────────────────────────────────────────┤
│  Income         ₹1,85,000                                       │
│  Expenses       ₹1,43,000                                       │
│  Surplus          ₹42,000                                       │
├────────────────────────┬───────────────────────────────────────┤
│  Category          May │    Apr  │  3M Avg  │  Status          │
├────────────────────────┼─────────┼──────────┼──────────────────┤
│  Investments    ₹25,000│ ₹25,000 │ ₹25,000  │                  │
│  Rent           ₹22,000│ ₹22,000 │ ₹22,000  │                  │
│  Groceries      ₹12,400│  ₹9,800 │ ₹10,200  │ ⚠ +22%          │
│  Food / Dining  ₹8,200 │  ₹7,100 │  ₹7,400  │                  │
│  Fuel           ₹3,100 │  ₹2,800 │  ₹2,900  │                  │
│  Entertainment  ₹2,400 │  ₹2,400 │  ₹2,400  │                  │
│  Shopping      ₹18,200 │  ₹6,400 │  ₹8,100  │ ⚠ +125%         │
│  Utilities      ₹4,200 │  ₹4,100 │  ₹4,150  │                  │
│  Health             ₹0 │  ₹1,200 │    ₹400  │                  │
│  Other         ₹47,500 │ ₹35,000 │ ₹38,400  │                  │
└────────────────────────┴─────────┴──────────┴──────────────────┘
```

**Table specs:**
- Category column: `text-sm text-gray-300`
- Amount columns: `text-sm text-gray-100 tabular-nums text-right`
- 3M avg: `text-sm text-gray-500 tabular-nums text-right`
- Anomaly badge (> 50% above 3M avg): `text-xs text-amber-400`
- Month navigation: HTMX `hx-get="/cashflow?month=2026-04" hx-target="#cashflow-table" hx-swap="innerHTML"`

---

## Page: Holdings

```
┌─────────────────────────────────────────────────────────────────┐
│  Holdings                                    [+ Add Holding]    │
├──────────────────────────────────────┬──────────┬──────────────┤
│  Name                   Type         │  Value   │  Last Updated │
├──────────────────────────────────────┼──────────┼──────────────┤
│  HDFC Flexi Cap – Dir Gr  Equity MF  │  ₹2.81L  │  Today        │
│  Axis Bluechip – Dir Gr   Equity MF  │  ₹1.90L  │  Today        │
│  Mirae Emrg Blchip – DG   Equity MF  │  ₹84K    │  Today        │
│  SBI Liquid Fund          Debt MF    │  ₹1.20L  │  Today        │
│  HDFC FD                  FD         │  ₹2.00L  │  Apr 15       │
│  EPF – EPFO               EPF        │  ₹6.12L  │  Apr 1        │
│  Gold Sovereign Bond      Gold       │  ₹50K    │  Today        │
│  SBI Savings – XX1234     Cash       │  ₹4.20L  │  Yesterday    │
└──────────────────────────────────────┴──────────┴──────────────┘
```

---

## Page: Tax

```
┌─────────────────────────────────────────────────────────────────┐
│  Tax                                             FY 2025–26     │
├────────────────────────────┬────────────────────────────────────┤
│  80C INVESTMENTS           │  REGIME COMPARISON                 │
│                            │                                    │
│  ████████████░░░  60%      │  Old Regime    ₹48,200 tax        │
│  ₹90,000 of ₹1,50,000     │  New Regime    ₹42,600 tax        │
│  ₹60,000 remaining         │                                    │
│                            │  ✅ Stay on New Regime            │
│  EPF (auto)     ₹72,000   │  You save ₹5,600                  │
│  PPF (manual)   ₹18,000   │                                    │
│  [+ Add 80C]              │  Breakeven: ₹2.2L in deductions   │
│                            │  (you have ₹90K)                  │
│  80D HEALTH                │                                    │
│  ₹0 of ₹25,000            │                                    │
│  [+ Add 80D]              │                                    │
├────────────────────────────┴────────────────────────────────────┤
│  REMINDERS                                                       │
│  🔴 6 weeks until March 31 — invest ₹60,000 to complete 80C    │
│  🟡 Advance tax due June 15 — estimated liability ₹12,400       │
└─────────────────────────────────────────────────────────────────┘
```

---

## Page: Upload (CAS / Bank Statement)

```
┌─────────────────────────────────────────────────────────────────┐
│  Upload                                                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  CAS STATEMENT (CAMS / KFintech)                                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                         │   │
│  │        Drag and drop your CAS PDF here                 │   │
│  │        or  [Choose File]                               │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│  Password (if protected): [________________]                    │
│  [Upload CAS]                                                   │
│                                                                  │
│  ─────────────────────────────────────────────────────────      │
│                                                                  │
│  BANK STATEMENT                                                  │
│  Bank: [HDFC ▼]                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │        Drag and drop your bank statement PDF           │   │
│  │        or  [Choose File]                               │   │
│  └─────────────────────────────────────────────────────────┘   │
│  [Upload Statement]                                             │
│                                                                  │
│  UPLOAD HISTORY                                                  │
│  May 15  CAS_May2026.pdf     ✓ 12 holdings updated            │
│  May 1   HDFC_Apr2026.pdf    ✓ 87 transactions imported        │
│  Apr 1   HDFC_Mar2026.pdf    ✓ 94 transactions imported        │
└─────────────────────────────────────────────────────────────────┘
```

**Upload zone specs:**
- `border-2 border-dashed border-gray-700 rounded-xl p-10 text-center`
- Hover: `border-indigo-600 bg-indigo-950/20`
- Dragging over: `border-indigo-400 bg-indigo-950/40`
- HTMX upload: `hx-post="/upload/cas" hx-encoding="multipart/form-data" hx-target="#upload-result" hx-indicator="#spinner"`

---

## Shared Components

### Empty State

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│              (icon)                                              │
│         No holdings yet                                          │
│   Add your first holding to get started                         │
│              [Add Holding]                                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

- Container: `flex flex-col items-center justify-center py-16 text-center`
- Icon: `w-10 h-10 text-gray-700 mb-4`
- Heading: `text-base font-medium text-gray-400`
- Subtext: `text-sm text-gray-600 mt-1`
- CTA button: primary style, `mt-4`

### Loading Skeleton

```
// For a card loading state:
<div class="animate-pulse">
  <div class="h-4 bg-gray-800 rounded w-32 mb-3"></div>
  <div class="h-8 bg-gray-800 rounded w-48 mb-2"></div>
  <div class="h-3 bg-gray-800 rounded w-24"></div>
</div>
```

- Only show if request takes > 300ms (use HTMX `hx-indicator`)

### Inline Form Validation

- Error message: `text-xs text-red-400 mt-1`
- Error input border: `border-red-700 focus:ring-red-600`
- Success: no visual change (the data is saved; user sees the updated list)

### Confirmation Dialog (HTMX)

```html
hx-confirm="Are you sure you want to delete this holding?"
```

No custom modal needed — browser native `hx-confirm` is fine for v1.

### Toast Notifications (HTMX OOB swap)

For success/error messages that need to appear outside the swap target:

```html
<div id="toast"
     class="fixed bottom-4 right-4 bg-gray-800 border border-gray-700
            text-sm text-gray-200 px-4 py-3 rounded-lg shadow-lg
            transition-opacity duration-300">
  ✓ Holdings updated
</div>
```

Auto-dismiss with a short `setTimeout` or CSS animation.

---

## HTMX Patterns Used in This App

| Pattern | Usage |
|---------|-------|
| `hx-get` + `hx-target` | Load partials (filter changes, tab switches, drill-downs) |
| `hx-post` + `hx-swap="outerHTML"` | Form submission replacing the form with result |
| `hx-delete` + `hx-swap="outerHTML"` | Delete an item, replace with nothing |
| `hx-trigger="every 60s"` | Auto-refresh net worth on dashboard |
| `hx-indicator="#spinner"` | Show spinner during upload/slow requests |
| `hx-confirm` | Native confirm dialog before destructive action |
| Out-of-band swap | Update nav badge count when recommendation is read |
| `hx-push-url` | Update browser URL on page-like navigation (SIP detail, goal detail) |

---

## Responsive Breakpoints

| Breakpoint | Layout change |
|------------|---------------|
| `< 768px` (mobile) | Single column; sidebar becomes bottom tab bar |
| `768px – 1024px` (tablet) | Single column; sidebar collapses to icons |
| `> 1024px` (desktop) | Two-column sidebar layout |

Dashboard two-column grid: `grid grid-cols-1 lg:grid-cols-2 gap-6`

---

## Design Decisions Log

| Decision | Rationale |
|----------|-----------|
| Dark theme | Financial data is easier to scan on dark background; status colours pop more |
| No chart library in v1 | Tables communicate numbers more precisely than charts for this use case; charts deferred to v2 |
| Tailwind via CDN | No build pipeline in v1; CDN is fine for single-user internal tool |
| Native browser confirm dialogs | No modal library needed; keeps the bundle tiny |
| HTMX partial swaps over full reloads | Responsive without the complexity of a JS framework |
| Monospace tabular-nums | Financial numbers must align in columns; `tabular-nums` prevents layout shift |

---

*Design document version 1.0 — update this file as pages are built and decisions are made.*
