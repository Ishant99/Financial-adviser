// Assembles the "Today" home view from on-device data + the finance engines.
import { Holding, SipPlan, Goal, Budget, holdingCurrentValue, holdingInvested } from "../data/models";
import { computeTaxSummary, ltcgHarvestingMove, section80cMove, TaxMove } from "./finance/tax";
import { projectNetWorth, ProjectionResult } from "./finance/projection";

export interface TodayView {
  netWorth: number;
  invested: number;
  gain: number;
  gainPct: number;
  monthlySurplus: number;
  savingsRatePct: number;
  fire: ProjectionResult;
  pctToFire: number;
  unknownTaxCount: number;
  moves: TaxMove[];
}

export interface BuildOpts {
  currentAge?: number;
  annualReturnPct?: number;
  inflationPct?: number;
  section80cInvested?: number;
}

export function buildTodayView(
  holdings: Holding[],
  _sips: SipPlan[],
  _goals: Goal[],
  budget: Budget,
  opts: BuildOpts = {},
): TodayView {
  const netWorth = holdings.reduce((s, h) => s + holdingCurrentValue(h), 0);
  const invested = holdings.reduce((s, h) => s + holdingInvested(h), 0);
  const gain = netWorth - invested;
  const gainPct = invested > 0 ? (gain / invested) * 100 : 0;

  const expenses = budget.buckets.reduce((s, b) => s + b.amount, 0);
  const monthlySurplus = budget.monthlyIncome - expenses;
  const savingsRatePct = budget.monthlyIncome > 0 ? (monthlySurplus / budget.monthlyIncome) * 100 : 0;

  const fire = projectNetWorth({
    currentNetWorth: netWorth,
    monthlySurplus,
    monthlySip: 0,
    annualReturnPct: opts.annualReturnPct ?? 11,
    inflationPct: opts.inflationPct ?? 6,
    currentAge: opts.currentAge ?? 28,
    annualExpenses: expenses * 12,
    years: 40,
  });
  const pctToFire = fire.fireNumber > 0 ? Math.min(100, (netWorth / fire.fireNumber) * 100) : 0;

  const taxSummary = computeTaxSummary(
    holdings.map((h) => ({
      name: h.name,
      units: h.units,
      purchaseNav: h.purchaseNav,
      currentNav: h.currentNav,
      holdingType: h.holdingType,
      purchaseDate: h.purchaseDate,
    })),
  );

  const moves: TaxMove[] = [];
  const harvest = ltcgHarvestingMove(taxSummary);
  if (harvest) moves.push(harvest);
  const sec80c = section80cMove(opts.section80cInvested ?? 0);
  if (sec80c) moves.push(sec80c);
  if (monthlySurplus > 1000) {
    moves.push({
      kind: "harvest",
      title: "Idle surplus not invested",
      detail: `You have about ₹${Math.round(monthlySurplus).toLocaleString("en-IN")}/mo of surplus. Investing it would pull your retirement date closer.`,
      amount: monthlySurplus,
    });
  }

  return {
    netWorth,
    invested,
    gain,
    gainPct,
    monthlySurplus,
    savingsRatePct,
    fire,
    pctToFire,
    unknownTaxCount: taxSummary.unknownCount,
    moves,
  };
}
