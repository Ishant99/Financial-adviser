"use client";

import { useState } from "react";
import { SparklesIcon } from "lucide-react";
import { useGenerateMonthlyPlan } from "@/lib/queries/usePlan";
import { formatCurrency } from "@/lib/format";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";
import type { MonthlyPlanResponse } from "@/types/api";

function PlanResult({ plan }: { plan: MonthlyPlanResponse }) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-indigo-800 bg-indigo-950/30 p-5">
        <p className="text-xs text-indigo-400 mb-1">Monthly Surplus</p>
        <p className={`text-3xl font-bold ${plan.surplus >= 0 ? "text-emerald-400" : "text-red-400"}`}>
          {formatCurrency(plan.surplus)}
        </p>
      </div>

      <div className="rounded-2xl glass p-5 space-y-2">
        <p className="text-sm font-semibold text-white">Overview</p>
        <p className="text-sm text-gray-300 leading-relaxed">{plan.overallNarrative}</p>
      </div>

      {plan.sections.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-white">Breakdown</p>
          {plan.sections.map((s, i) => (
            <div key={i} className="rounded-2xl glass glass-hover p-4 flex gap-4">
              <div className="shrink-0 w-1 rounded-full bg-indigo-600" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-gray-200">{s.title}</p>
                  {s.amount != null && (
                    <p className="text-sm font-medium text-gray-300">{formatCurrency(s.amount)}</p>
                  )}
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">{s.narrative}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PlanPage() {
  const generate = useGenerateMonthlyPlan();
  const [plan, setPlan] = useState<MonthlyPlanResponse | null>(null);

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader
        eyebrow="Monthly Plan"
        title="Your AI Money Plan"
        description="A plan generated from this month's transactions, SIPs and goals."
        actions={
          <Button
            size="sm"
            onClick={() =>
              generate.mutate(undefined, {
                onSuccess: (data) => setPlan(data),
                onError: () => setPlan(null),
              })
            }
            disabled={generate.isPending}
          >
            <SparklesIcon size={14} className="mr-1" />
            {generate.isPending ? "Generating…" : plan ? "Regenerate" : "Generate plan"}
          </Button>
        }
      />

      {generate.error && (
        <ErrorState
          message={generate.error instanceof Error ? generate.error.message : "Generation failed"}
        />
      )}

      {plan ? (
        <PlanResult plan={plan} />
      ) : !generate.isPending ? (
        <div className="rounded-2xl glass p-12 text-center">
          <p className="text-gray-400 mb-2">No plan generated yet.</p>
          <p className="text-sm text-gray-600">
            Click &quot;Generate plan&quot; to create an AI-powered monthly financial plan
            based on your current month&apos;s data.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-2xl glass animate-pulse" />
          ))}
        </div>
      )}
    </div>
  );
}
