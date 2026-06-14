"use client";

import {
  AreaChart, Area, XAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useNetWorth, useNetWorthHistory } from "@/lib/queries/useNetWorth";
import { formatCurrency, formatDate } from "@/lib/format";
import { useCountUp } from "@/lib/useCountUp";

const COLORS: Record<string, string> = {
  MutualFund: "#6366f1",
  Stock: "#06b6d4",
  Gold: "#f59e0b",
  FD: "#10b981",
  RealEstate: "#8b5cf6",
  Cash: "#6b7280",
  Crypto: "#f43f5e",
};

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg glass-strong px-3 py-2 text-xs">
      <p className="text-gray-400 mb-1">{label}</p>
      <p className="text-white font-semibold figure">{formatCurrency(payload[0].value)}</p>
    </div>
  );
}

export function NetWorthCard() {
  const { data, isLoading, isError, refetch } = useNetWorth();
  const { data: history } = useNetWorthHistory(12);

  const chartData = history?.map((pt) => ({ name: pt.label, value: Number(pt.value) })) ?? [];
  const animated = useCountUp(data?.totalNetWorth ?? 0, 1000);

  // Trend over the window (first → last)
  const trendPct =
    chartData.length > 1 && chartData[0].value > 0
      ? ((chartData[chartData.length - 1].value - chartData[0].value) / chartData[0].value) * 100
      : null;

  return (
    <Card className="glass-strong relative overflow-hidden">
      {/* Accent glow */}
      <div className="pointer-events-none absolute -top-24 -right-24 size-64 rounded-full bg-indigo-600/10 blur-3xl" />

      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="eyebrow text-gray-500">Total Net Worth</CardTitle>
          {isError && (
            <button onClick={() => refetch()} className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
              Retry
            </button>
          )}
        </div>
      </CardHeader>
      <CardContent className="relative">
        {isLoading && (
          <div className="space-y-3">
            <Skeleton className="h-12 w-56 bg-white/5" />
            <Skeleton className="h-28 w-full bg-white/5" />
          </div>
        )}
        {isError && !isLoading && <p className="text-red-400 text-sm">Failed to load net worth</p>}
        {data && (
          <>
            <div className="flex items-end gap-3 flex-wrap">
              <p className="figure gradient-text text-5xl font-bold tracking-tight leading-none rise-in">
                {formatCurrency(animated)}
              </p>
              {trendPct != null && (
                <span
                  className={`mb-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                    trendPct >= 0
                      ? "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20"
                      : "bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/20"
                  }`}
                >
                  {trendPct >= 0 ? "▲" : "▼"} {Math.abs(trendPct).toFixed(1)}% · 12mo
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1.5">As of {formatDate(data.asOf)}</p>

            {/* 12-month area chart */}
            {chartData.length > 1 && (
              <div className="mt-5 h-28 -mx-1">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
                    <defs>
                      <linearGradient id="nwGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#818cf8" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 10, fill: "#6b7280" }}
                      tickLine={false}
                      axisLine={false}
                      interval="preserveStartEnd"
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#a5b4fc"
                      strokeWidth={2}
                      fill="url(#nwGradient)"
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Breakdown */}
            <div className="mt-5 space-y-2.5">
              {data.breakdown.map((b) => (
                <div key={b.category} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[b.category] ?? "#6366f1" }} />
                    <span className="text-gray-400 truncate">{b.category}</span>
                  </div>
                  <div className="text-right shrink-0 ml-4 figure">
                    <span className="text-gray-200">{formatCurrency(b.value)}</span>
                    <span className="text-gray-600 ml-1.5 text-xs">{b.percentOfTotal.toFixed(1)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
