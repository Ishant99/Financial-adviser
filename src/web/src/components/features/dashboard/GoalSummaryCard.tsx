"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGoals } from "@/lib/queries/useGoals";
import { formatCurrency, formatDate } from "@/lib/format";
import { TargetIcon } from "lucide-react";

export function GoalSummaryCard() {
  const { data, isLoading, isError, refetch } = useGoals();
  const active = data?.filter((g) => g.status === "Active").slice(0, 4) ?? [];

  return (
    <Card className="glass-hover">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-gray-400">Active Goals</CardTitle>
          {isError && (
            <button onClick={() => refetch()} className="text-xs text-indigo-400 hover:text-indigo-300">
              Retry
            </button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => <Skeleton key={i} className="h-14 bg-gray-800" />)}
          </div>
        )}
        {isError && <p className="text-red-400 text-sm">Failed to load goals</p>}
        {!isLoading && active.length === 0 && (
          <div className="flex flex-col items-center py-8 text-center">
            <TargetIcon size={32} className="text-gray-700 mb-3" />
            <p className="text-gray-500 text-sm">No active goals yet</p>
            <Link href="/goals" className="mt-2 text-xs text-indigo-400 hover:underline">
              Add your first goal →
            </Link>
          </div>
        )}
        <div className="space-y-4">
          {active.map((goal) => {
            const prob = goal.probabilityOfSuccess;
            const probColor =
              prob == null ? "bg-gray-600"
              : prob >= 70 ? "bg-emerald-500"
              : prob >= 40 ? "bg-yellow-500"
              : "bg-red-500";

            return (
              <div key={goal.id} className="space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-200 truncate">{goal.name}</p>
                    <p className="text-xs text-gray-500">
                      Target: {formatCurrency(goal.targetAmount)} · {formatDate(goal.targetDate)}
                    </p>
                  </div>
                  {prob != null && (
                    <span className={`shrink-0 text-xs font-semibold ${
                      prob >= 70 ? "text-emerald-400" : prob >= 40 ? "text-yellow-400" : "text-red-400"
                    }`}>
                      {prob.toFixed(0)}%
                    </span>
                  )}
                </div>
                {prob != null && (
                  <div className="h-1.5 w-full rounded-full bg-gray-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${probColor}`}
                      style={{ width: `${Math.min(prob, 100)}%` }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {active.length > 0 && (
          <Link href="/goals" className="mt-4 block text-xs text-indigo-400 hover:underline">
            View all goals →
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
