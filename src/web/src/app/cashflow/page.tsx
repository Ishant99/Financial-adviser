"use client";

import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";
import { useCashFlow } from "@/lib/queries/useCashFlow";
import { formatCurrency } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/ui/page-header";
import { Segmented } from "@/components/ui/segmented";
import { StatTile } from "@/components/ui/stat-tile";
import { ErrorState } from "@/components/ui/error-state";

const MONTH_OPTIONS = [
  { label: "3M", value: 3 },
  { label: "6M", value: 6 },
  { label: "12M", value: 12 },
];

function CustomTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg glass-strong px-3 py-2.5 text-xs space-y-1">
      <p className="text-gray-400 font-medium mb-1.5">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center justify-between gap-4">
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="text-white font-semibold figure">{formatCurrency(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

export default function CashFlowPage() {
  const [months, setMonths] = useState(6);
  const { data, isLoading, isError, refetch } = useCashFlow(months);

  const totalIncome   = data?.reduce((s, m) => s + m.totalIncome, 0) ?? 0;
  const totalExpenses = data?.reduce((s, m) => s + m.totalExpenses, 0) ?? 0;
  const totalNet      = totalIncome - totalExpenses;

  const chartData = data?.map((m) => ({
    name: m.label.split(" ")[0], // "Jan", "Feb" etc
    Income: m.totalIncome,
    Expenses: m.totalExpenses,
  })) ?? [];

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        eyebrow="Cash Flow"
        title="Income vs Expenses"
        description="Track how money moves in and out across your selected period."
        actions={<Segmented options={MONTH_OPTIONS} value={months} onChange={setMonths} size="sm" />}
      />

      {/* Summary tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 stagger">
        <StatTile label="Total Income" value={formatCurrency(totalIncome)} valueClassName="text-emerald-400" loading={isLoading} />
        <StatTile label="Total Expenses" value={formatCurrency(totalExpenses)} valueClassName="text-rose-400" loading={isLoading} />
        <StatTile
          label="Net Savings"
          value={formatCurrency(totalNet)}
          valueClassName={totalNet >= 0 ? "text-emerald-400" : "text-rose-400"}
          sub={totalIncome > 0 ? `${((totalNet / totalIncome) * 100).toFixed(0)}% of income` : undefined}
          loading={isLoading}
        />
      </div>

      {/* Recharts bar chart */}
      <Card className="glass-hover">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-400">Monthly Overview</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-48 flex items-end gap-2">
              {Array.from({ length: months }).map((_, i) => (
                <div key={i} className="flex-1 flex gap-0.5 h-full items-end">
                  <Skeleton className="flex-1 bg-gray-800" style={{ height: `${50 + i * 5}%` }} />
                  <Skeleton className="flex-1 bg-gray-800" style={{ height: `${40 + i * 4}%` }} />
                </div>
              ))}
            </div>
          ) : isError ? (
            <ErrorState message="Failed to load cash flow data" onRetry={() => refetch()} />
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#6b7280" }} tickLine={false} axisLine={false} />
                <YAxis
                  tick={{ fontSize: 10, fill: "#6b7280" }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`}
                  width={55}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                <Legend
                  iconType="square"
                  iconSize={10}
                  wrapperStyle={{ fontSize: "11px", color: "#9ca3af" }}
                />
                <Bar dataKey="Income" fill="#10b981" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Expenses" fill="#f43f5e" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-gray-500 py-8 text-center">No transactions found for this period</p>
          )}
        </CardContent>
      </Card>

      {/* Monthly breakdown table */}
      {data && data.length > 0 && (
        <Card className="glass-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Monthly Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="px-4 py-2.5 text-left text-xs text-gray-500 font-medium">Month</th>
                    <th className="px-4 py-2.5 text-right text-xs text-gray-500 font-medium">Income</th>
                    <th className="px-4 py-2.5 text-right text-xs text-gray-500 font-medium">Expenses</th>
                    <th className="px-4 py-2.5 text-right text-xs text-gray-500 font-medium">Net</th>
                  </tr>
                </thead>
                <tbody>
                  {[...data].reverse().map((m) => (
                    <tr key={`${m.year}-${m.month}`} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                      <td className="px-4 py-2.5 text-gray-300">{m.label}</td>
                      <td className="px-4 py-2.5 text-right text-emerald-400">{formatCurrency(m.totalIncome)}</td>
                      <td className="px-4 py-2.5 text-right text-rose-400">{formatCurrency(m.totalExpenses)}</td>
                      <td className={`px-4 py-2.5 text-right font-medium ${m.net >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                        {formatCurrency(m.net)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category drill-down for most recent month */}
      {data && data.length > 0 && data[data.length - 1].categories.length > 0 && (
        <Card className="glass-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              {data[data.length - 1].label} — Categories
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="px-4 py-2.5 text-left text-xs text-gray-500 font-medium">Category</th>
                    <th className="px-4 py-2.5 text-left text-xs text-gray-500 font-medium">Type</th>
                    <th className="px-4 py-2.5 text-right text-xs text-gray-500 font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {data[data.length - 1].categories.map((c, i) => (
                    <tr key={i} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                      <td className="px-4 py-2.5 text-gray-300">{c.category}</td>
                      <td className="px-4 py-2.5">
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${
                          c.type === "Credit"
                            ? "border-emerald-800 text-emerald-400 bg-emerald-900/30"
                            : "border-rose-800 text-rose-400 bg-rose-900/30"
                        }`}>
                          {c.type}
                        </span>
                      </td>
                      <td className={`px-4 py-2.5 text-right font-medium ${c.type === "Credit" ? "text-emerald-400" : "text-rose-400"}`}>
                        {formatCurrency(c.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
