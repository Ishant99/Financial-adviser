// Capital-gains tax engine — ported from GetTaxSummaryQueryHandler.cs.
// Finance Act 2024 (effective 23 Jul 2024): LTCG 12.5% above ₹1.25L, STCG 20%.
// Holdings with no purchase date are "Unknown" and excluded from totals (never guessed).

export const LTCG_EXEMPTION = 125_000;
export const LTCG_RATE = 0.125;
export const STCG_RATE = 0.2;
export const SECTION_80C_LIMIT = 150_000;

export type TaxCategory = "LTCG" | "STCG" | "Slab" | "Unknown";

export interface TaxHolding {
  name: string;
  units: number;
  purchaseNav: number;
  currentNav: number;
  holdingType: string; // "MutualFund" | "Stock" | "FD" | ...
  purchaseDate?: string | null; // ISO yyyy-mm-dd
}

export interface TaxHoldingResult {
  name: string;
  currentValue: number;
  gainLoss: number;
  holdingMonths: number;
  taxCategory: TaxCategory;
  acquisitionDate: string;
}

export interface TaxSummary {
  financialYear: string;
  ltcgGains: number;
  stcgGains: number;
  estimatedLtcgTax: number;
  estimatedStcgTax: number;
  holdings: TaxHoldingResult[];
  unknownCount: number;
}

function monthsBetween(from: Date, to: Date): number {
  return Math.max(0, (to.getFullYear() - from.getFullYear()) * 12 + to.getMonth() - from.getMonth());
}

export function computeTaxSummary(holdings: TaxHolding[], today = new Date()): TaxSummary {
  const fyStartYear = today.getMonth() >= 3 ? today.getFullYear() : today.getFullYear() - 1;
  const fyLabel = `FY ${fyStartYear}-${String((fyStartYear + 1) % 100).padStart(2, "0")}`;

  let ltcgGains = 0;
  let stcgGains = 0;
  let unknownCount = 0;
  const results: TaxHoldingResult[] = [];

  for (const h of holdings) {
    if (h.purchaseNav <= 0 || h.holdingType === "Cash") continue;

    const gainLoss = (h.currentNav - h.purchaseNav) * h.units;
    const currentValue = h.currentNav * h.units;
    let taxCategory: TaxCategory;
    let holdingMonths = 0;
    let acquisitionLabel = "";

    if (h.holdingType === "FD") {
      taxCategory = "Slab";
      if (h.purchaseDate) {
        holdingMonths = monthsBetween(new Date(h.purchaseDate), today);
        acquisitionLabel = h.purchaseDate;
      }
    } else if (!h.purchaseDate) {
      taxCategory = "Unknown";
      unknownCount++;
    } else {
      const d = new Date(h.purchaseDate);
      holdingMonths = monthsBetween(d, today);
      acquisitionLabel = h.purchaseDate;
      if (holdingMonths > 12) {
        taxCategory = "LTCG";
        if (gainLoss > 0) ltcgGains += gainLoss;
      } else {
        taxCategory = "STCG";
        if (gainLoss > 0) stcgGains += gainLoss;
      }
    }

    results.push({
      name: h.name,
      currentValue: round2(currentValue),
      gainLoss: round2(gainLoss),
      holdingMonths,
      taxCategory,
      acquisitionDate: acquisitionLabel,
    });
  }

  const estimatedLtcgTax =
    ltcgGains > LTCG_EXEMPTION ? round2((ltcgGains - LTCG_EXEMPTION) * LTCG_RATE) : 0;
  const estimatedStcgTax = round2(stcgGains * STCG_RATE);

  results.sort((a, b) => Math.abs(b.gainLoss) - Math.abs(a.gainLoss));

  return {
    financialYear: fyLabel,
    ltcgGains: round2(ltcgGains),
    stcgGains: round2(stcgGains),
    estimatedLtcgTax,
    estimatedStcgTax,
    holdings: results,
    unknownCount,
  };
}

// ── Optimisation suggestions (the "hook") ────────────────────────────────────

export interface TaxMove {
  kind: "harvest" | "timing" | "section80c";
  title: string;
  detail: string;
  amount?: number;
}

/** LTCG harvesting: how much tax-free gain headroom remains this FY. */
export function ltcgHarvestingMove(summary: TaxSummary): TaxMove | null {
  const headroom = LTCG_EXEMPTION - summary.ltcgGains;
  if (headroom <= 1000) return null;
  return {
    kind: "harvest",
    title: "Book tax-free LTCG before 31 Mar",
    detail: `You can realise about ₹${Math.round(headroom).toLocaleString("en-IN")} of long-term gains tax-free this year (₹1.25L exemption). Sell and rebuy to reset your cost basis.`,
    amount: headroom,
  };
}

/** STCG→LTCG timing: holdings 10–12 months old that would save tax if held longer. */
export function stcgTimingMoves(holdings: TaxHolding[], today = new Date()): TaxMove[] {
  const moves: TaxMove[] = [];
  for (const h of holdings) {
    if (h.holdingType === "FD" || h.holdingType === "Cash" || !h.purchaseDate) continue;
    const months = monthsBetween(new Date(h.purchaseDate), today);
    const gain = (h.currentNav - h.purchaseNav) * h.units;
    if (months >= 10 && months <= 12 && gain > 0) {
      const saving = gain * (STCG_RATE - LTCG_RATE);
      moves.push({
        kind: "timing",
        title: `Hold ${h.name} past 12 months`,
        detail: `Waiting ~${13 - months} month(s) converts STCG (20%) to LTCG (12.5%) — saving roughly ₹${Math.round(saving).toLocaleString("en-IN")} in tax.`,
        amount: saving,
      });
    }
  }
  return moves;
}

/** Section 80C headroom given annual ELSS/PPF/EPF invested so far. */
export function section80cMove(investedThisFy: number): TaxMove | null {
  const headroom = SECTION_80C_LIMIT - investedThisFy;
  if (headroom <= 1000) return null;
  return {
    kind: "section80c",
    title: "Use your 80C headroom",
    detail: `₹${Math.round(headroom).toLocaleString("en-IN")} of your ₹1.5L 80C limit is unused. Top up ELSS/PPF before 31 Mar to cut taxable income.`,
    amount: headroom,
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
