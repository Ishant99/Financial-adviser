"use client";

import { useState } from "react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { ArrowUpDownIcon } from "lucide-react";
import { usePortfolioAnalytics } from "@/lib/queries/usePortfolioAnalytics";
import { formatCurrency, formatPercent } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FinTooltip } from "@/components/FinTooltip";
import { PageHeader } from "@/components/ui/page-header";
import { StatTile } from "@/components/ui/stat-tile";
import { ErrorState } from "@/components/ui/error-state";

const COLORS: Record<string, string> = {
  MutualFund: "#6366f1",
  Stock:      "#06b6d4",
  Gold:       "#f59e0b",
  FD:         "#10b981",
  RealEstate: "#8b5cf6",
  Cash:       "#6b7280",
  Crypto:     "#f43f5e",
};

function PieTooltip({ active, payload }: { active?: boolean; payload?: { name: string; value: number }[] }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg glass-strong px-3 py-2 text-xs">
      <p className="text-white font-medium">{payload[0].name}</p>
      <p className="text-gray-300">{formatCurrency(payload[0].value)}</p>
    </div>
  );
}

type SortField = "name" | "currentValue" | "gainLossPercent" | "cagr";
type SortDir = "asc" | "desc";

function SortTh({ label, field, current, dir, onSort }: {
  label: React.ReactNode; field: SortField; current: SortField; dir: SortDir; onSort: (f: SortField) => void;
}) {
  return (
    <th className="px-4 py-2.5 text-right text-xs text-gray-500 font-medium">
      <button onClick={() => onSort(field)} className="inline-flex items-center gap-0.5 hover:text-white transition-colors">
        {label}
        <ArrowUpDownIcon size={12} className={current === field ? "text-indigo-400" : "text-gray-600"} />
      </button>
    </th>
  );
}

export default function AnalyticsPage() {
  const { data, isLoading, isError, refetch } = usePortfolioAnalytics();
  const [sortField, setSortField] = useState<SortField>("currentValue");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("desc"); }
  };

  const sortedHoldings = [...(data?.holdings ?? [])].sort((a, b) => {
    let cmp = 0;
    if (sortField === "name") cmp = a.name.localeCompare(b.name);
    else if (sortField === "currentValue") cmp = a.currentValue - b.currentValue;
    else if (sortField === "gainLossPercent") cmp = a.gainLossPercent - b.gainLossPercent;
    else if (sortField === "cagr") cmp = (a.cagr ?? -999) - (b.cagr ?? -999);
    return sortDir === "asc" ? cmp : -cmp;
  });

  const pieData = data?.allocationByType.map((a) => ({
    name: a.holdingType,
    value: a.totalValue,
  })) ?? [];

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        eyebrow="Portfolio Analytics"
        title="How Your Investments Are Doing"
        description="Allocation, concentration risk, and per-holding performance at a glance."
      />

      {isError && <ErrorState message="Failed to load analytics" onRetry={() => refetch()} />}

      {/* Top summary row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 stagger">
        <StatTile label="Portfolio Value" value={formatCurrency(data?.totalValue ?? 0)} loading={isLoading} />
        <StatTile label="Total Invested" value={formatCurrency(data?.totalPurchasedValue ?? 0)} valueClassName="text-gray-300" loading={isLoading} />
        <StatTile
          label="Total Gain / Loss"
          value={`${data && data.totalGainLoss >= 0 ? "+" : ""}${formatCurrency(data?.totalGainLoss ?? 0)}`}
          valueClassName={data && data.totalGainLoss >= 0 ? "text-emerald-400" : "text-rose-400"}
          loading={isLoading}
        />
        <StatTile
          label="Overall Return"
          value={data ? formatPercent(data.totalGainLossPercent) : "—"}
          valueClassName={data && data.totalGainLossPercent >= 0 ? "text-emerald-400" : "text-rose-400"}
          loading={isLoading}
        />
        <StatTile
          label="Sharpe Ratio"
          value={data?.sharpeRatio != null ? data.sharpeRatio.toFixed(2) : "—"}
          valueClassName={data?.sharpeRatio != null ? (data.sharpeRatio >= 1 ? "text-emerald-400" : data.sharpeRatio >= 0 ? "text-yellow-400" : "text-rose-400") : "text-gray-500"}
          loading={isLoading}
        />
      </div>

      {/* Asset Allocation — Recharts donut */}
      {!isLoading && data && data.allocationByType.length > 0 && (
        <Card className="glass-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Asset Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-6 items-center">
              {/* Donut */}
              <div className="w-full md:w-56 h-48 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={52}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {pieData.map((entry) => (
                        <Cell key={entry.name} fill={COLORS[entry.name] ?? "#6366f1"} stroke="transparent" />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Table */}
              <div className="flex-1 w-full">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="py-2 text-left text-xs text-gray-500 font-medium">Type</th>
                      <th className="py-2 text-right text-xs text-gray-500 font-medium">Value</th>
                      <th className="py-2 text-right text-xs text-gray-500 font-medium">Weight</th>
                      <th className="py-2 text-right text-xs text-gray-500 font-medium">#</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.allocationByType.map((a) => (
                      <tr key={a.holdingType} className="border-b border-gray-800/50">
                        <td className="py-2.5 flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: COLORS[a.holdingType] ?? "#6366f1" }} />
                          <span className="text-gray-300">{a.holdingType}</span>
                        </td>
                        <td className="py-2.5 text-right text-gray-300">{formatCurrency(a.totalValue)}</td>
                        <td className="py-2.5 text-right text-gray-400">{a.percentOfPortfolio.toFixed(1)}%</td>
                        <td className="py-2.5 text-right text-gray-500">{a.holdingCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Concentration risk */}
      {data && data.topConcentrations.length > 0 && (
        <Card className="glass-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Top Concentrations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.topConcentrations.map((c) => (
              <div key={c.name} className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-300 truncate">{c.name}</span>
                    <span className="text-gray-400 shrink-0 ml-2">{c.percentOfPortfolio.toFixed(1)}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-gray-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        c.percentOfPortfolio > 30 ? "bg-rose-500" :
                        c.percentOfPortfolio > 20 ? "bg-amber-500" : "bg-indigo-500"
                      }`}
                      style={{ width: `${Math.min(c.percentOfPortfolio, 100)}%` }}
                    />
                  </div>
                </div>
                <span className="text-xs text-gray-400 shrink-0">{formatCurrency(c.value)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Sector / Market-cap breakdowns */}
      {data && (data.allocationBySector.length > 0 || data.allocationByMarketCap.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.allocationBySector.length > 0 && (
            <Card className="glass-hover">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">By Sector</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {data.allocationBySector.map((s) => (
                  <div key={s.label} className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-300 truncate">{s.label}</span>
                        <span className="text-gray-400 shrink-0 ml-2">{s.percentOfPortfolio.toFixed(1)}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-gray-800 overflow-hidden">
                        <div className="h-full rounded-full bg-indigo-500 transition-all" style={{ width: `${Math.min(s.percentOfPortfolio, 100)}%` }} />
                      </div>
                    </div>
                    <span className="text-xs text-gray-400 shrink-0">{formatCurrency(s.totalValue)}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
          {data.allocationByMarketCap.length > 0 && (
            <Card className="glass-hover">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">By Market Cap</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {data.allocationByMarketCap.map((m) => (
                  <div key={m.label} className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-300 truncate">{m.label}</span>
                        <span className="text-gray-400 shrink-0 ml-2">{m.percentOfPortfolio.toFixed(1)}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-gray-800 overflow-hidden">
                        <div className="h-full rounded-full bg-violet-500 transition-all" style={{ width: `${Math.min(m.percentOfPortfolio, 100)}%` }} />
                      </div>
                    </div>
                    <span className="text-xs text-gray-400 shrink-0">{formatCurrency(m.totalValue)}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Per-holding performance table with sort */}
      {!isLoading && data && data.holdings.length > 0 && (
        <Card className="glass-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Holding Performance</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="px-4 py-2.5 text-left text-xs text-gray-500 font-medium">
                      <button onClick={() => handleSort("name")} className="inline-flex items-center gap-0.5 hover:text-white transition-colors">
                        Holding <ArrowUpDownIcon size={12} className={sortField === "name" ? "text-indigo-400" : "text-gray-600"} />
                      </button>
                    </th>
                    <th className="px-4 py-2.5 text-right text-xs text-gray-500 font-medium">Type</th>
                    <SortTh label="Value" field="currentValue" current={sortField} dir={sortDir} onSort={handleSort} />
                    <SortTh label="Return" field="gainLossPercent" current={sortField} dir={sortDir} onSort={handleSort} />
                    <SortTh label={<FinTooltip term="CAGR" />} field="cagr" current={sortField} dir={sortDir} onSort={handleSort} />
                  </tr>
                </thead>
                <tbody>
                  {sortedHoldings.map((h, i) => (
                    <tr key={i} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                      <td className="px-4 py-2.5 text-gray-200 max-w-[180px] truncate">{h.name}</td>
                      <td className="px-4 py-2.5 text-right text-gray-500 text-xs">{h.holdingType}</td>
                      <td className="px-4 py-2.5 text-right text-gray-300">{formatCurrency(h.currentValue)}</td>
                      <td className={`px-4 py-2.5 text-right font-medium ${h.gainLossPercent >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                        {formatPercent(h.gainLossPercent)}
                      </td>
                      <td className={`px-4 py-2.5 text-right text-xs ${
                        h.cagr == null ? "text-gray-600" : h.cagr >= 0 ? "text-emerald-400" : "text-rose-400"
                      }`}>
                        {h.cagr != null ? formatPercent(h.cagr) : "—"}
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
