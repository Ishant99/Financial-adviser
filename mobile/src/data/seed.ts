import { Holding, SipPlan, Goal, Budget } from "./models";

// Seeded from the user's real Groww export (totals: invested ₹2,65,586.83 / current ₹2,82,731.01).
// purchaseDate is null (Unknown) — Groww export omits buy date, so tax stays honest until set.
function mf(name: string, units: number, invested: number, current: number): Holding {
  return {
    id: name.replace(/\s+/g, "-").toLowerCase(),
    name,
    holdingType: "MutualFund",
    units,
    purchaseNav: invested / units,
    currentNav: current / units,
    purchaseDate: null,
  };
}

export const seedHoldings: Holding[] = [
  mf("HDFC Balanced Advantage Fund", 1.81, 999.7, 1005.34),
  mf("ICICI Prudential Commodities Fund", 135.918, 6999.67, 6941.33),
  mf("Parag Parikh Flexi Cap Fund", 404.714, 35998.21, 36138.73),
  mf("Tata Mid Cap Fund", 66.729, 31998.26, 33834.75),
  mf("ICICI Prudential Commodities Fund (2)", 1501.144, 66096.92, 76663.42),
  mf("Tata Mid Cap Fund (2)", 140.127, 65996.94, 71051),
  mf("Motilal Oswal Midcap Fund", 546.024, 57497.14, 57096.42),
];

export const seedSips: SipPlan[] = [];

export const seedGoals: Goal[] = [
  {
    id: "retirement",
    name: "Retirement",
    targetAmount: 30_000_000,
    targetDate: "2046-01-01",
    priority: 1,
    equityPct: 70,
    debtPct: 20,
    goldPct: 5,
    cashPct: 5,
  },
];

export const seedBudget: Budget = {
  monthlyIncome: 80_000,
  buckets: [
    { name: "Rent", amount: 15_000 },
    { name: "Food", amount: 10_000 },
    { name: "EMI", amount: 0 },
    { name: "Other", amount: 13_000 },
  ],
};
