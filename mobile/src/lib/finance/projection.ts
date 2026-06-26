// Net-worth trajectory + FIRE engine. New logic for the mobile flagship "Future" screen.
// Deterministic projection (median path); Monte Carlo bands come from montecarlo.ts.

export interface ProjectionInput {
  currentNetWorth: number;
  monthlySurplus: number; // income - expenses available to invest
  monthlySip: number; // existing committed SIPs
  annualReturnPct: number; // e.g. 11
  inflationPct: number; // e.g. 6
  currentAge: number;
  annualExpenses: number; // today's rupees, used for FIRE number
  years: number; // projection horizon
}

export interface ProjectionPoint {
  year: number; // calendar year
  age: number;
  nominal: number; // future rupees
  real: number; // inflation-adjusted to today
}

export interface ProjectionResult {
  points: ProjectionPoint[];
  fireNumber: number; // 25x annual expenses (4% rule), today's rupees
  fireYear: number | null; // calendar year corpus (real) first >= fireNumber
  fireAge: number | null;
  yearsToFire: number | null;
}

const FIRE_MULTIPLE = 25; // 4% safe withdrawal rate

export function projectNetWorth(input: ProjectionInput, today = new Date()): ProjectionResult {
  const {
    currentNetWorth,
    monthlySurplus,
    monthlySip,
    annualReturnPct,
    inflationPct,
    currentAge,
    annualExpenses,
    years,
  } = input;

  const monthlyReturn = annualReturnPct / 100 / 12;
  const monthlyInvest = Math.max(0, monthlySurplus) + Math.max(0, monthlySip);
  const fireNumber = annualExpenses * FIRE_MULTIPLE;
  const startYear = today.getFullYear();

  const points: ProjectionPoint[] = [];
  let corpus = currentNetWorth;
  let fireYear: number | null = null;
  let fireAge: number | null = null;

  // year 0 baseline
  points.push({ year: startYear, age: currentAge, nominal: corpus, real: corpus });

  for (let y = 1; y <= years; y++) {
    for (let m = 0; m < 12; m++) {
      corpus = corpus * (1 + monthlyReturn) + monthlyInvest;
    }
    const deflator = Math.pow(1 + inflationPct / 100, y);
    const real = corpus / deflator;
    const age = currentAge + y;
    points.push({ year: startYear + y, age, nominal: round0(corpus), real: round0(real) });

    if (fireYear === null && real >= fireNumber) {
      fireYear = startYear + y;
      fireAge = age;
    }
  }

  return {
    points,
    fireNumber: round0(fireNumber),
    fireYear,
    fireAge,
    yearsToFire: fireYear === null ? null : fireYear - startYear,
  };
}

function round0(n: number): number {
  return Math.round(n);
}
