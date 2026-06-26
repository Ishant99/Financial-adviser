// Monte Carlo goal simulation — ported from analytics-service/app/services/monte_carlo.py.
// numpy vectorisation replaced with plain loops; n_sims reduced to 2000 for on-device speed.
// Two-factor correlation model: r_i = sqrt(rho)*Z_market + sqrt(1-rho)*Z_idio.

export interface AssetAllocation {
  equityPct: number;
  debtPct: number;
  goldPct: number;
  cashPct: number;
}

export interface SimulationResult {
  probabilityOfSuccess: number; // percent 0–100
  p10Corpus: number;
  p50Corpus: number;
  p90Corpus: number;
}

const PARAMS = {
  equity: { mean: 0.12, std: 0.18 },
  debt: { mean: 0.07, std: 0.04 },
  gold: { mean: 0.08, std: 0.15 },
  cash: { mean: 0.04, std: 0.005 },
};

const DEFAULT_SIMS = 2000;

// Box-Muller standard normal
function randn(): number {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function percentile(sortedAsc: number[], p: number): number {
  if (sortedAsc.length === 0) return 0;
  const idx = (p / 100) * (sortedAsc.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sortedAsc[lo];
  return sortedAsc[lo] + (sortedAsc[hi] - sortedAsc[lo]) * (idx - lo);
}

export function simulateGoal(
  targetAmount: number,
  yearsToGoal: number,
  currentValue: number,
  monthlyContribution: number,
  alloc: AssetAllocation,
  marketCorrelation = 0.3,
  nSims = DEFAULT_SIMS,
): SimulationResult {
  const months = Math.max(1, Math.round(yearsToGoal * 12));
  const weights = [alloc.equityPct, alloc.debtPct, alloc.goldPct, alloc.cashPct].map(
    (w) => w / 100,
  );
  const monthlyMeans = [
    PARAMS.equity.mean,
    PARAMS.debt.mean,
    PARAMS.gold.mean,
    PARAMS.cash.mean,
  ].map((m) => m / 12);
  const monthlyStds = [
    PARAMS.equity.std,
    PARAMS.debt.std,
    PARAMS.gold.std,
    PARAMS.cash.std,
  ].map((s) => s / Math.sqrt(12));

  const rho = Math.min(1, Math.max(0, marketCorrelation));
  const sqrtRho = Math.sqrt(rho);
  const sqrtOneMinus = Math.sqrt(1 - rho);

  const finalCorpus = new Array<number>(nSims);

  for (let s = 0; s < nSims; s++) {
    let corpus = currentValue;
    for (let m = 0; m < months; m++) {
      const zMarket = randn();
      // blended portfolio return this month
      let blended = 0;
      for (let k = 0; k < 4; k++) {
        const zIdio = randn();
        const assetReturn =
          sqrtRho * zMarket * monthlyStds[k] +
          sqrtOneMinus * zIdio * monthlyStds[k] +
          monthlyMeans[k];
        blended += assetReturn * weights[k];
      }
      corpus = corpus * (1 + blended) + monthlyContribution;
    }
    finalCorpus[s] = Math.max(0, corpus);
  }

  const successes = finalCorpus.reduce((n, c) => n + (c >= targetAmount ? 1 : 0), 0);
  const sorted = [...finalCorpus].sort((a, b) => a - b);

  return {
    probabilityOfSuccess: Math.round((successes / nSims) * 1000) / 10,
    p10Corpus: Math.round(percentile(sorted, 10) * 100) / 100,
    p50Corpus: Math.round(percentile(sorted, 50) * 100) / 100,
    p90Corpus: Math.round(percentile(sorted, 90) * 100) / 100,
  };
}
