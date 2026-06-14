"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useNetWorth } from "@/lib/queries/useNetWorth";
import { useGoals } from "@/lib/queries/useGoals";
import { useCashFlow } from "@/lib/queries/useCashFlow";
import { useCountUp } from "@/lib/useCountUp";

interface Factor {
  label: string;
  score: number;   // 0..1
  weight: number;  // points
  detail: string;
}

function computeFactors(
  breakdown: { category: string; percentOfTotal: number }[] | undefined,
  goals: { status: string; probabilityOfSuccess?: number }[] | undefined,
  cashflow: { totalIncome: number; totalExpenses: number }[] | undefined
): Factor[] {
  // ── Savings rate (40 pts) ──
  let savingsScore = 0.5;
  let savingsDetail = "No cash-flow data";
  if (cashflow && cashflow.length > 0) {
    const income = cashflow.reduce((s, m) => s + m.totalIncome, 0);
    const expense = cashflow.reduce((s, m) => s + m.totalExpenses, 0);
    if (income > 0) {
      const rate = (income - expense) / income; // can be negative
      savingsScore = Math.max(0, Math.min(1, rate / 0.3)); // 30%+ savings = full marks
      savingsDetail = `${(rate * 100).toFixed(0)}% of income saved`;
    }
  }

  // ── Goal health (30 pts) ──
  let goalScore = 0.5;
  let goalDetail = "No active goals";
  const active = goals?.filter((g) => g.status === "Active" && g.probabilityOfSuccess != null) ?? [];
  if (active.length > 0) {
    const avg = active.reduce((s, g) => s + (g.probabilityOfSuccess ?? 0), 0) / active.length;
    goalScore = Math.max(0, Math.min(1, avg / 100));
    goalDetail = `${avg.toFixed(0)}% avg goal success`;
  }

  // ── Diversification (30 pts) ──
  let divScore = 0.4;
  let divDetail = "No holdings";
  if (breakdown && breakdown.length > 0) {
    const maxWeight = Math.max(...breakdown.map((b) => b.percentOfTotal)) / 100;
    const categories = breakdown.length;
    // more categories + lower concentration = better
    const spread = Math.min(1, categories / 4);
    const concentration = 1 - Math.max(0, (maxWeight - 0.5) / 0.5); // penalise >50% in one bucket
    divScore = Math.max(0, Math.min(1, spread * 0.5 + concentration * 0.5));
    divDetail = `${categories} asset classes · top ${(maxWeight * 100).toFixed(0)}%`;
  }

  return [
    { label: "Savings rate", score: savingsScore, weight: 40, detail: savingsDetail },
    { label: "Goal progress", score: goalScore, weight: 30, detail: goalDetail },
    { label: "Diversification", score: divScore, weight: 30, detail: divDetail },
  ];
}

function scoreColor(score: number): string {
  if (score >= 75) return "#10b981"; // emerald
  if (score >= 50) return "#f59e0b"; // amber
  return "#f43f5e"; // rose
}

function scoreLabel(score: number): string {
  if (score >= 80) return "Excellent";
  if (score >= 65) return "Healthy";
  if (score >= 50) return "Fair";
  if (score >= 35) return "Needs work";
  return "At risk";
}

export function FinancialHealthCard() {
  const { data: nw, isLoading: l1 } = useNetWorth();
  const { data: goals, isLoading: l2 } = useGoals();
  const { data: cashflow, isLoading: l3 } = useCashFlow(3);

  const isLoading = l1 || l2 || l3;

  const factors = computeFactors(nw?.breakdown, goals, cashflow);
  const total = Math.round(factors.reduce((s, f) => s + f.score * f.weight, 0));
  const animated = useCountUp(isLoading ? 0 : total, 1100);
  const display = Math.round(animated);
  const color = scoreColor(total);

  return (
    <Card className="glass-hover">
      <CardHeader className="pb-2">
        <CardTitle className="eyebrow text-gray-500">Financial Health</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center gap-5">
            <Skeleton className="size-28 rounded-full bg-white/5" />
            <div className="flex-1 space-y-3">
              {[0, 1, 2].map((i) => <Skeleton key={i} className="h-4 w-full bg-white/5" />)}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-5 flex-wrap">
            {/* Radial gauge */}
            <div className="relative size-28 shrink-0">
              <div
                className="size-full rounded-full"
                style={{
                  background: `conic-gradient(${color} ${display * 3.6}deg, rgba(255,255,255,0.06) ${display * 3.6}deg)`,
                }}
              />
              <div className="absolute inset-[10px] rounded-full bg-[#0b0c12] grid place-items-center">
                <div className="text-center">
                  <p className="figure text-3xl font-bold text-white leading-none">{display}</p>
                  <p className="text-[10px] font-medium mt-0.5" style={{ color }}>
                    {scoreLabel(total)}
                  </p>
                </div>
              </div>
            </div>

            {/* Factor breakdown */}
            <div className="flex-1 min-w-[160px] space-y-3">
              {factors.map((f) => (
                <div key={f.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-300">{f.label}</span>
                    <span className="text-gray-500">{Math.round(f.score * f.weight)}/{f.weight}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${f.score * 100}%`, backgroundColor: scoreColor(f.score * 100) }}
                    />
                  </div>
                  <p className="text-[10px] text-gray-600 mt-0.5">{f.detail}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
