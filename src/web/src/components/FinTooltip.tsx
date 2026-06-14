"use client";

import { useState } from "react";
import { InfoIcon } from "lucide-react";

const TERMS: Record<string, string> = {
  XIRR: "Extended Internal Rate of Return — time-weighted return accounting for the exact dates of each SIP instalment. A better measure than simple return for SIPs.",
  CAGR: "Compound Annual Growth Rate — the rate at which an investment would have grown if it grew at a steady annual rate. Formula: (Current/Cost)^(12/months) − 1.",
  NAV: "Net Asset Value — the per-unit price of a mutual fund, calculated as (Assets − Liabilities) / Total Units.",
  LTCG: "Long-Term Capital Gains — gains on equity assets held for more than 12 months. Taxed at 10% on gains above ₹1 lakh per year.",
  STCG: "Short-Term Capital Gains — gains on equity assets held for 12 months or less. Taxed at a flat 15%.",
  P10: "10th percentile outcome from Monte Carlo simulation — only 10% of simulations end below this value. A pessimistic scenario.",
  P50: "50th percentile (median) outcome from Monte Carlo simulation — the middle scenario.",
  P90: "90th percentile outcome from Monte Carlo simulation — 90% of simulations end below this value. An optimistic scenario.",
  "80C": "Section 80C of the Income Tax Act — allows deduction up to ₹1.5 lakh per year for eligible investments including ELSS funds and PPF.",
  SIP: "Systematic Investment Plan — an investment method of putting a fixed amount into mutual funds at regular intervals (usually monthly).",
};

interface Props {
  term: string;
  className?: string;
}

export function FinTooltip({ term, className }: Props) {
  const [visible, setVisible] = useState(false);
  const definition = TERMS[term];
  if (!definition) return <span className={className}>{term}</span>;

  return (
    <span className={`relative inline-flex items-center gap-0.5 ${className ?? ""}`}>
      <span className="border-b border-dashed border-gray-500 cursor-help">{term}</span>
      <button
        type="button"
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
        className="text-gray-600 hover:text-gray-400 transition-colors"
        aria-label={`What is ${term}?`}
      >
        <InfoIcon size={12} />
      </button>
      {visible && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-64 rounded-lg bg-gray-800 border border-gray-700 px-3 py-2.5 text-xs text-gray-300 shadow-xl leading-relaxed">
          <p className="font-semibold text-white mb-1">{term}</p>
          {definition}
          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-700" />
        </div>
      )}
    </span>
  );
}
