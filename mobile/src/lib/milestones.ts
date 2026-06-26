// Net-worth milestones — the anti-boring progress hook.
const MILESTONES = [
  100_000, 250_000, 500_000, 1_000_000, 2_500_000, 5_000_000, 10_000_000, 25_000_000, 50_000_000,
];

export interface MilestoneState {
  lastReached: number | null;
  next: number | null;
  pctToNext: number;
  label: string;
}

function fmt(n: number): string {
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(n % 1e7 === 0 ? 0 : 1)}Cr`;
  return `₹${(n / 1e5).toFixed(n % 1e5 === 0 ? 0 : 1)}L`;
}

export function milestoneState(netWorth: number): MilestoneState {
  let lastReached: number | null = null;
  let next: number | null = null;
  for (const m of MILESTONES) {
    if (netWorth >= m) lastReached = m;
    else {
      next = m;
      break;
    }
  }
  const prev = lastReached ?? 0;
  const pctToNext = next ? ((netWorth - prev) / (next - prev)) * 100 : 100;
  const label = next
    ? `${fmt(netWorth - prev === 0 ? prev : netWorth)} → next ${fmt(next)}`
    : "Top milestone reached 🏆";
  return { lastReached, next, pctToNext: Math.max(0, Math.min(100, pctToNext)), label };
}
