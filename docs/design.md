# UI Design — Personal AI Financial Advisor

Design reference for the Next.js + shadcn/ui frontend. Use this file side by side with Claude
when building components and pages. Each section covers layout, what goes where, component
choices, and interaction patterns. Update as the design evolves.

---

## Design Principles

1. **Information density over decoration.** Every pixel earns its place. No hero images, no gradients, no animations for their own sake.
2. **Numbers are the UI.** The most important numbers are the biggest things on the page.
3. **Actions are never buried.** If the app wants me to do something, it says so at the top of the dashboard — not tucked in a settings page.
4. **Calm by default.** Green = good, amber = watch, red = act now. Used sparingly so they mean something.
5. **Mobile-readable, not mobile-first.** Mostly used on a laptop, but must not break on a phone.

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
| Positive delta | `text-emerald-400` | Gains, increases |
| Negative delta | `text-red-400` | Losses, decreases |

### Typography

| Element | Classes |
|---------|---------|
| Page title | `text-2xl font-semibold text-gray-100` |
| Section heading | `text-lg font-medium text-gray-200` |
| Card label | `text-sm font-medium text-gray-400 uppercase tracking-wider` |
| Hero number (net worth) | `text-5xl font-bold text-gray-100 tabular-nums` |
| Large number | `text-2xl font-semibold text-gray-100 tabular-nums` |
| Medium number | `text-lg font-medium text-gray-100 tabular-nums` |
| Body text | `text-sm text-gray-300` |
| Caption | `text-xs text-gray-500` |

All financial numbers use `tabular-nums` to prevent layout shift as values change.

### Spacing and Layout

- Page padding: `px-6 py-6` (desktop), `px-4 py-4` (mobile)
- Max content width: `max-w-6xl mx-auto`
- Card padding: `p-5`
- Card radius: `rounded-xl`
- Card border: `border border-gray-800`
- Section gap: `gap-6`
- Item gap within a card: `gap-3`

### Buttons (shadcn/ui `Button` variants)

| Type | Variant + extra classes |
|------|------------------------|
| Primary | `variant="default"` → `bg-indigo-600 hover:bg-indigo-500` |
| Secondary | `variant="secondary"` → `bg-gray-800 hover:bg-gray-700 text-gray-200` |
| Danger | `variant="destructive"` |
| Ghost | `variant="ghost"` → `text-indigo-400` |
| Icon | `variant="ghost" size="icon"` |

### Status Badges (shadcn/ui `Badge` with custom variants)

```tsx
// Healthy / Win
<Badge className="bg-emerald-900/50 text-emerald-400 border-emerald-800">Healthy</Badge>

// Watch
<Badge className="bg-amber-900/50 text-amber-400 border-amber-800">Watch</Badge>

// Act Now
<Badge className="bg-red-900/50 text-red-400 border-red-800">Act Now</Badge>
```

---

## Project Structure

```
src/web/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout (sidebar + theme)
│   ├── page.tsx                  # Dashboard (/)
│   ├── plan/
│   │   └── page.tsx              # Monthly Plan (/plan)
│   ├── sips/
│   │   ├── page.tsx              # SIP Health list (/sips)
│   │   └── [id]/page.tsx         # SIP detail (/sips/[id])
│   ├── goals/
│   │   ├── page.tsx              # Goals list (/goals)
│   │   └── [id]/page.tsx         # Goal detail (/goals/[id])
│   ├── cashflow/
│   │   └── page.tsx              # Cash Flow (/cashflow)
│   ├── holdings/
│   │   └── page.tsx              # Holdings (/holdings)
│   ├── tax/
│   │   └── page.tsx              # Tax (/tax)
│   └── upload/
│       └── page.tsx              # Upload CAS / bank statement (/upload)
├── components/
│   ├── ui/                       # shadcn/ui primitives (Button, Card, Badge, etc.)
│   └── features/
│       ├── dashboard/            # NetWorthCard, RecommendationCard, GoalSummaryCard
│       ├── plan/                 # MonthlyPlanView, ActionItem, WatchItem, WinItem
│       ├── sips/                 # SipTable, SipStatusBadge, SipDetailView
│       ├── goals/                # GoalCard, GoalProgressBar, ProjectionTable
│       ├── cashflow/             # CashFlowTable, CategoryRow, MonthSelector
│       ├── holdings/             # HoldingsTable, AddHoldingForm
│       ├── tax/                  # TaxDashboard, RegimeComparison, Tax80CProgress
│       └── upload/               # FileDropzone, UploadHistory
├── lib/
│   ├── api.ts                    # Axios instance with base URL + interceptors
│   ├── queries/                  # TanStack Query hooks (one file per feature)
│   │   ├── useNetWorth.ts
│   │   ├── useSips.ts
│   │   ├── useGoals.ts
│   │   ├── useMonthlyPlan.ts
│   │   └── ...
│   └── utils.ts                  # formatCurrency, formatPercent, cn() helper
└── types/
    └── api.ts                    # TypeScript types mirroring .NET API DTOs
```

---

## Data Fetching Pattern

All API calls go to the .NET backend (`http://localhost:5000` in dev, env var in prod).

```tsx
// lib/api.ts
import axios from 'axios'

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000',
  headers: { 'Content-Type': 'application/json' },
})
```

```tsx
// lib/queries/useNetWorth.ts
import { useQuery } from '@tanstack/react-query'
import { api } from '../api'

export function useNetWorth() {
  return useQuery({
    queryKey: ['net-worth'],
    queryFn: () => api.get('/api/net-worth').then(r => r.data),
    refetchInterval: 60_000,   // auto-refresh every 60s (replaces HTMX polling)
  })
}
```

```tsx
// Mutation example (add holding)
import { useMutation, useQueryClient } from '@tanstack/react-query'

export function useAddHolding() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: AddHoldingRequest) => api.post('/api/holdings', data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['holdings'] })
      qc.invalidateQueries({ queryKey: ['net-worth'] })
    },
  })
}
```

**Rules:**
- Server Components fetch data directly via `fetch()` for the initial page load
- Client Components use TanStack Query hooks for interactive/refetching data
- Never call the API from a Server Action — keep the .NET API as the single source of truth
- All query keys are defined as constants in `lib/queries/keys.ts`

---

## Layout Shell

```tsx
// app/layout.tsx — root layout
<html>
  <body className="bg-gray-950 text-gray-100 min-h-screen">
    <div className="flex">
      <Sidebar />                        {/* fixed left, w-56 on desktop */}
      <main className="flex-1 ml-56">    {/* offset for sidebar */}
        <div className="max-w-6xl mx-auto px-6 py-6">
          {children}
        </div>
      </main>
    </div>
  </body>
</html>
```

**Sidebar component:**
- `fixed left-0 top-0 h-screen w-56 bg-gray-900 border-r border-gray-800`
- Nav links using Next.js `<Link>` with `usePathname()` to detect active route
- Active link: `bg-indigo-600/20 text-indigo-400`
- Inactive: `text-gray-400 hover:text-gray-200 hover:bg-gray-800`
- Actions count badge: red dot with unread count, updated via `useRecommendations()` query

---

## Page: Dashboard (/)

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
│  [Refresh]                 │  WATCHES (1)  /  WINS (1)         │
└────────────────────────────┴────────────────────────────────────┘
│  MAY PLAN                        GOALS (3)                      │
│ ┌───────────────────────┐   ┌───────────────────────────────┐   │
│ │ Your surplus is ₹42K  │   │ Retirement      87% on track  │   │
│ │ ...                   │   │ House DP        61% on track  │   │
│ │  [See Full Plan →]    │   │ Emergency Fund  ✅ Complete   │   │
│ └───────────────────────┘   └───────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

**Component breakdown:**

**`<NetWorthCard />`**
```tsx
// Fetches via useNetWorth() — refetchInterval: 60s
// shadcn Card with custom dark styling
<Card className="bg-gray-900 border-gray-800">
  <CardContent className="p-5">
    <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">Net Worth</p>
    <p className="text-5xl font-bold text-gray-100 tabular-nums mt-2">{formatCurrency(netWorth.total)}</p>
    <p className={`text-sm mt-1 ${delta >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
      {delta >= 0 ? '↑' : '↓'} {formatCurrency(Math.abs(delta))} this month
    </p>
    <Separator className="my-4 bg-gray-800" />
    {/* breakdown rows */}
  </CardContent>
</Card>
```

**`<RecommendationFeed />`**
```tsx
// Client component — useRecommendations() query
// Tabs: "Actions" | "Watches" | "Wins" using shadcn Tabs
// Each card has left border coloured by severity
// "Mark read" button calls PATCH /api/recommendations/:id/read
// → useMutation → invalidates recommendations query
```

**`<GoalSummaryCard />`** — shadcn Card, Progress bar via shadcn `Progress` component

**`<MonthlyPlanSummary />`** — truncated narrative + link to /plan

---

## Page: Monthly Plan (/plan)

```
┌─────────────────────────────────────────────────────────────────┐
│  Monthly Plan                                                    │
│  May 2026                                     [Generate Now]    │
├─────────────────────────────────────────────────────────────────┤
│  [narrative block — indigo tinted card]                         │
├─────────────────────────────────────────────────────────────────┤
│  ACTIONS (numbered list)                                         │
│  WATCHES (bullet list)                                           │
│  WINS (checklist)                                                │
├─────────────────────────────────────────────────────────────────┤
│  PLAN INPUTS   [Collapsible — shadcn Collapsible]               │
├─────────────────────────────────────────────────────────────────┤
│  PREVIOUS PLANS (month links)                                   │
└─────────────────────────────────────────────────────────────────┘
```

**Key components:**
- `<NarrativeBlock />` — `bg-indigo-950/30 border border-indigo-900/50 rounded-xl p-6`, `text-base text-gray-200 leading-relaxed`
- `<ActionItem />` — numbered, title + amount + reason. Amount coloured red (spend) or green (invest)
- `<PlanInputs />` — shadcn `<Collapsible>`, collapsed by default, shows raw composer numbers
- Previous plans — `<Select>` dropdown to navigate to past plans, or a simple link list
- "Generate Now" — calls `POST /api/monthly-plan/generate` via `useMutation`, shows toast on success

---

## Page: SIP Health (/sips)

```
┌─────────────────────────────────────────────────────────────────┐
│  SIP Health                    Last updated: Today 9PM [↻]      │
├──────────────────┬────────┬────────┬──────────┬────────────────┤
│ Fund             │ Amount │ Value  │ XIRR     │ Status         │
├──────────────────┼────────┼────────┼──────────┼────────────────┤
│ HDFC Flexi Cap   │ ₹7,000 │ ₹2.8L │ 14.2%    │ ● Healthy      │
│   vs Nifty 50    │        │        │ +1.4%    │                │
└──────────────────┴────────┴────────┴──────────┴────────────────┘
```

**Implementation:**
```tsx
// shadcn Table with custom rows
<Table>
  <TableHeader>...</TableHeader>
  <TableBody>
    {sips.map(sip => (
      <>
        <TableRow
          key={sip.id}
          className="cursor-pointer hover:bg-gray-900/50"
          onClick={() => router.push(`/sips/${sip.id}`)}
        >
          <TableCell>{sip.fundName}</TableCell>
          <TableCell className="tabular-nums">{formatCurrency(sip.monthlyAmount)}</TableCell>
          <TableCell className="tabular-nums">{formatCurrency(sip.currentValue)}</TableCell>
          <TableCell className="tabular-nums">{formatPercent(sip.xirr)}</TableCell>
          <TableCell><SipStatusBadge status={sip.status} /></TableCell>
        </TableRow>
        <TableRow className="border-0">
          <TableCell className="text-xs text-gray-500 pt-0 pb-3" colSpan={1}>
            vs {sip.benchmarkName}
          </TableCell>
          <TableCell colSpan={2} />
          <TableCell className={`text-xs pt-0 pb-3 tabular-nums ${sip.differential >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {sip.differential >= 0 ? '+' : ''}{formatPercent(sip.differential)}
          </TableCell>
          <TableCell />
        </TableRow>
      </>
    ))}
  </TableBody>
</Table>
```

---

## Page: Goals (/goals)

Goal cards as a vertical list. Each card uses shadcn `Card`.

```tsx
<Card className="bg-gray-900 border-gray-800">
  <CardContent className="p-5">
    <div className="flex items-start justify-between">
      <div>
        <h3 className="text-base font-semibold text-gray-100">{goal.name}</h3>
        <p className="text-xs text-gray-500 mt-0.5">
          Target {formatCurrency(goal.targetAmount)} by {formatDate(goal.targetDate)}
        </p>
      </div>
      <ProbabilityBadge value={goal.probabilityOfSuccess} />
    </div>

    <Progress
      value={(goal.currentCorpus / goal.targetAmount) * 100}
      className="mt-4 h-2.5 bg-gray-800"
    />

    <div className="flex gap-4 mt-2 text-xs text-gray-500">
      <span>{formatCurrency(goal.currentCorpus)} saved</span>
      <span>·</span>
      <span>₹{goal.monthlyContribution}/mo SIP</span>
      <span>·</span>
      <span>P50 completion {goal.p50CompletionYear}</span>
    </div>

    <div className="flex gap-2 mt-4">
      <Button variant="ghost" size="sm" asChild>
        <Link href={`/goals/${goal.id}`}>Details →</Link>
      </Button>
      <Button variant="ghost" size="sm" onClick={() => openEditDialog(goal)}>Edit</Button>
      <Button variant="ghost" size="sm" onClick={() => pauseGoal(goal.id)}>Pause</Button>
    </div>
  </CardContent>
</Card>
```

**Add Goal** — shadcn `Dialog` with a form inside. No separate page needed.

**`<ProbabilityBadge />`** — colour by threshold: ≥90% emerald, 75–90% amber, <75% red.

---

## Page: Cash Flow (/cashflow)

```tsx
// Month selector — shadcn Select
<Select value={selectedMonth} onValueChange={setSelectedMonth}>
  <SelectTrigger className="w-40 bg-gray-900 border-gray-800">
    <SelectValue />
  </SelectTrigger>
  <SelectContent>
    {availableMonths.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
  </SelectContent>
</Select>

// Changing month → React state → useCashFlow(selectedMonth) query refetches
// No page reload, no router navigation needed
```

**Anomaly highlight:**
```tsx
<TableCell className={isAnomaly ? 'text-amber-400' : 'text-gray-300'}>
  {isAnomaly && <span className="mr-1">⚠</span>}
  {formatCurrency(row.thisMonth)}
</TableCell>
```

---

## Page: Upload (/upload)

```tsx
// File drop zone — react-dropzone library
<div
  {...getRootProps()}
  className={cn(
    "border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors",
    isDragActive
      ? "border-indigo-400 bg-indigo-950/40"
      : "border-gray-700 hover:border-indigo-600 hover:bg-indigo-950/20"
  )}
>
  <input {...getInputProps()} />
  <p className="text-sm text-gray-400">
    {isDragActive ? 'Drop it here' : 'Drag and drop your CAS PDF, or click to choose'}
  </p>
</div>

// Upload via useMutation → POST /api/upload/cas (multipart/form-data)
// Progress: show shadcn Progress bar while uploading
// Success: shadcn Toast via useToast()
// Error: inline error message below the dropzone
```

---

## Page: Tax (/tax)

Two-column layout on desktop, single column on mobile.

Left column: 80C progress bar, 80D progress, manual input forms.
Right column: regime comparison card, reminders list.

```tsx
// 80C progress
<div className="space-y-2">
  <div className="flex justify-between text-sm">
    <span className="text-gray-400">80C Used</span>
    <span className="text-gray-100 tabular-nums">
      {formatCurrency(tax.section80CUsed)} / {formatCurrency(tax.section80CLimit)}
    </span>
  </div>
  <Progress
    value={(tax.section80CUsed / tax.section80CLimit) * 100}
    className="h-3 bg-gray-800"
  />
  <p className="text-xs text-amber-400">
    {formatCurrency(tax.section80CLimit - tax.section80CUsed)} remaining
  </p>
</div>
```

---

## Shared Components

### `<PageHeader />` — page title + optional subtitle + optional action button

### Empty State
```tsx
<div className="flex flex-col items-center justify-center py-16 text-center">
  <Icon className="w-10 h-10 text-gray-700 mb-4" />
  <p className="text-base font-medium text-gray-400">{heading}</p>
  <p className="text-sm text-gray-600 mt-1">{subtext}</p>
  <Button className="mt-4" onClick={onAction}>{actionLabel}</Button>
</div>
```

### Loading State
```tsx
// Skeleton loaders using shadcn Skeleton
<div className="space-y-3">
  <Skeleton className="h-4 w-32 bg-gray-800" />
  <Skeleton className="h-8 w-48 bg-gray-800" />
  <Skeleton className="h-3 w-24 bg-gray-800" />
</div>
```

React Query loading state: `if (isLoading) return <CardSkeleton />`

### Toast Notifications
```tsx
// shadcn useToast — called after mutations
const { toast } = useToast()

onSuccess: () => {
  toast({ title: "Holdings updated", description: "3 holdings imported from CAS." })
}

onError: () => {
  toast({ title: "Upload failed", description: error.message, variant: "destructive" })
}
```

### Confirmation Dialog
```tsx
// shadcn AlertDialog — replaces browser confirm()
<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="destructive" size="sm">Delete</Button>
  </AlertDialogTrigger>
  <AlertDialogContent className="bg-gray-900 border-gray-800">
    <AlertDialogTitle>Delete this holding?</AlertDialogTitle>
    <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction onClick={onDelete}>Delete</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

### `formatCurrency` Utility
```tsx
// lib/utils.ts
export function formatCurrency(amount: number): string {
  if (amount >= 10_000_000) return `₹${(amount / 10_000_000).toFixed(2)}Cr`
  if (amount >= 100_000)    return `₹${(amount / 100_000).toFixed(2)}L`
  if (amount >= 1_000)      return `₹${(amount / 1_000).toFixed(1)}K`
  return `₹${amount.toLocaleString('en-IN')}`
}

export function formatPercent(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`
}
```

---

## React Patterns Used in This App

| Pattern | Usage |
|---------|-------|
| Server Component | Initial page data fetch on the server (no loading spinner for first paint) |
| Client Component | Any component with `useState`, `useEffect`, or event handlers |
| TanStack Query | All client-side data fetching, caching, and mutations |
| `useQueryClient().invalidateQueries` | Refresh related data after a mutation |
| `refetchInterval` | Auto-polling (e.g., net worth every 60s, Hangfire job status) |
| Optimistic updates | Mark recommendation as read instantly, roll back on error |
| shadcn Dialog | Add/edit forms (no separate page for forms) |
| shadcn Collapsible | Plan inputs, fund detail sections |
| shadcn Tabs | Dashboard recommendation feed (Actions / Watches / Wins) |
| react-dropzone | File upload zones (CAS, bank statement) |
| next/navigation `useRouter` | Programmatic navigation after form submission |
| `usePathname` | Active nav link highlighting |

---

## Responsive Breakpoints

| Breakpoint | Layout |
|------------|--------|
| `< 768px` (mobile) | Single column; sidebar becomes bottom tab bar via `md:hidden` / `hidden md:flex` |
| `768px – 1024px` (tablet) | Sidebar collapses to icon-only (`w-14`) |
| `> 1024px` (desktop) | Full sidebar (`w-56`) + two-column content grid |

Dashboard grid: `grid grid-cols-1 lg:grid-cols-2 gap-6`

---

## shadcn/ui Components Used

Install individually as needed: `npx shadcn@latest add <component>`

| Component | Used for |
|-----------|----------|
| `card` | All content panels |
| `button` | All buttons |
| `badge` | Status badges, probability badges |
| `progress` | Goal progress, 80C progress |
| `table` | SIP health, holdings, cash flow, transactions |
| `dialog` | Add/edit forms, confirmation |
| `alert-dialog` | Destructive action confirmation |
| `select` | Month picker, dropdowns |
| `tabs` | Recommendation feed |
| `collapsible` | Plan inputs, detail sections |
| `separator` | Visual dividers within cards |
| `skeleton` | Loading states |
| `toast` + `toaster` | Success/error notifications |
| `form` + `input` + `label` | All form fields (with react-hook-form) |

---

## Design Decisions Log

| Decision | Rationale |
|----------|-----------|
| Dark theme | Financial data scans better on dark; status colours pop more |
| shadcn/ui over a full component library | Own the components — no version lock-in, Tailwind-native, easy to customise |
| TanStack Query over SWR | More control over mutation state, invalidation, and optimistic updates |
| Dialogs for forms, not separate pages | Keeps context — user stays on the list page while adding an item |
| Server Components for initial load | First paint is fast and data-rich; no loading spinner on page entry |
| No chart library in v1 | Tables communicate numbers more precisely; charts deferred to v2 |
| react-dropzone for file upload | Better UX than a plain `<input type="file">` for PDF uploads |
| `tabular-nums` on all financial figures | Prevents layout shift as numbers update; columns align correctly |

---

*Design document version 2.0 — updated for Next.js + shadcn/ui.*
