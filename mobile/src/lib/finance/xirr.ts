// XIRR via Newton-Raphson — ported from analytics-service/app/services/xirr.py.
// No external dependency. negative amount = outflow, positive = inflow.

export interface CashFlow {
  date: Date;
  amount: number;
}

const DAY_MS = 86_400_000;

export function xirr(
  cashflows: CashFlow[],
  guess = 0.1,
  tol = 1e-6,
  maxIter = 200,
): number {
  if (!cashflows || cashflows.length < 2) return 0;

  const sorted = [...cashflows].sort((a, b) => a.date.getTime() - b.date.getTime());
  const t0 = sorted[0].date.getTime();
  const years = sorted.map((cf) => (cf.date.getTime() - t0) / DAY_MS / 365.25);
  const amounts = sorted.map((cf) => cf.amount);

  const npv = (r: number): number => {
    const rate = r <= -1 ? -0.9999 : r;
    return amounts.reduce((sum, a, i) => sum + a / Math.pow(1 + rate, years[i]), 0);
  };
  const dnpv = (r: number): number => {
    const rate = r <= -1 ? -0.9999 : r;
    return amounts.reduce(
      (sum, a, i) => sum - (a * years[i]) / Math.pow(1 + rate, years[i] + 1),
      0,
    );
  };

  let r = guess;
  for (let i = 0; i < maxIter; i++) {
    const f = npv(r);
    const df = dnpv(r);
    if (Math.abs(df) < 1e-15) break;
    let rNew = r - f / df;
    rNew = Math.max(-0.9999, Math.min(rNew, 100));
    if (Math.abs(rNew - r) < tol) return rNew;
    r = rNew;
  }
  return r;
}
