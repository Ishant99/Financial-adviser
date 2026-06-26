// On-device domain models. These map 1:1 to SQLite tables (added in the data layer phase).

export type HoldingType =
  | "MutualFund"
  | "Stock"
  | "EPF"
  | "PPF"
  | "FD"
  | "Gold"
  | "Cash"
  | "Crypto";

export interface Holding {
  id: string;
  name: string;
  holdingType: HoldingType;
  isin?: string | null; // for AMFI NAV matching
  units: number;
  purchaseNav: number;
  currentNav: number;
  purchaseDate?: string | null; // ISO yyyy-mm-dd; null = Unknown (tax excluded)
  expenseRatio?: number | null; // e.g. 0.6 (%)
  annualInterestPct?: number | null; // for EPF/PPF/FD accrual
}

export interface SipPlan {
  id: string;
  fundName: string;
  fundCode: string;
  monthlyAmount: number;
  sipDate: number; // 1–28
  startDate: string;
  status: "Active" | "Paused" | "Stopped";
  benchmarkIndex: string;
  linkedGoalId?: string | null;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  targetDate: string;
  priority: number;
  equityPct: number;
  debtPct: number;
  goldPct: number;
  cashPct: number;
}

export interface Budget {
  monthlyIncome: number;
  buckets: { name: string; amount: number }[];
}

export function holdingCurrentValue(h: Holding): number {
  return h.units * h.currentNav;
}
export function holdingInvested(h: Holding): number {
  return h.units * h.purchaseNav;
}
