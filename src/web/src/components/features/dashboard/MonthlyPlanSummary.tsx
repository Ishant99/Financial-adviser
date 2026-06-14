"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSipPlans } from "@/lib/queries/useSipPlans";
import { formatCurrency } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";

export function MonthlyPlanSummary() {
  const { data: sips, isLoading } = useSipPlans();

  const activeSips = sips?.filter((s) => s.status === "Active") ?? [];
  const totalMonthlyCommitment = activeSips.reduce((sum, s) => sum + s.monthlyAmount, 0);

  return (
    <Card className="glass-hover">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-gray-400">Monthly Plan</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">SIP Commitment</p>
            {isLoading ? (
              <Skeleton className="h-7 w-32 bg-gray-800" />
            ) : (
              <p className="text-2xl font-bold text-white">
                {formatCurrency(totalMonthlyCommitment)}
                <span className="text-sm font-normal text-gray-400">/mo</span>
              </p>
            )}
          </div>

          {!isLoading && activeSips.length > 0 && (
            <div className="space-y-1.5">
              {activeSips.map((sip) => (
                <div key={sip.id} className="flex justify-between text-xs">
                  <span className="text-gray-400 truncate max-w-[180px]">{sip.fundName}</span>
                  <span className="text-gray-300 shrink-0 ml-2">
                    {formatCurrency(sip.monthlyAmount)}
                  </span>
                </div>
              ))}
            </div>
          )}

          <a
            href="/plan"
            className="block rounded-lg bg-indigo-950/40 border border-indigo-900 p-3 text-xs text-indigo-300 hover:bg-indigo-950/60 transition-colors"
          >
            Generate AI monthly plan →
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
