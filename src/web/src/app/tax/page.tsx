"use client";

import { LandmarkIcon } from "lucide-react";
import { useTaxSummary } from "@/lib/queries/useTax";
import { formatCurrency } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FinTooltip } from "@/components/FinTooltip";
import { PageHeader } from "@/components/ui/page-header";
import { StatTile } from "@/components/ui/stat-tile";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";

const TAX_CATEGORY_STYLES: Record<string, string> = {
  LTCG: "border-indigo-500/30 text-indigo-300 bg-indigo-500/10",
  STCG: "border-amber-500/30 text-amber-300 bg-amber-500/10",
  Slab: "border-white/10 text-gray-400 bg-white/[0.04]",
};

function StatCard({
  label, value, sub, color = "text-white", loading,
}: {
  label: string;
  value: string;
  sub?: React.ReactNode;
  color?: string;
  loading?: boolean;
}) {
  return <StatTile label={label} value={value} sub={sub} valueClassName={color} loading={loading} />;
}

export default function TaxPage() {
  const { data: tax, isLoading, isError, refetch } = useTaxSummary();

  const ltcgTaxable = tax ? Math.max(0, tax.ltcgGains - 100_000) : 0;

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        eyebrow="Tax Summary"
        title="Capital Gains Estimate"
        description={`For ${tax?.financialYear ?? "the current FY"} — estimated from your current holdings.`}
      />

      {isError && <ErrorState message="Failed to load tax data" onRetry={() => refetch()} />}

      {/* FY summary tiles */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 stagger">
        <StatCard
          label="LTCG Gains"
          value={formatCurrency(tax?.ltcgGains ?? 0)}
          sub="Equity held > 12 months"
          color={tax && tax.ltcgGains > 0 ? "text-white" : "text-gray-400"}
          loading={isLoading}
        />
        <StatCard
          label="STCG Gains"
          value={formatCurrency(tax?.stcgGains ?? 0)}
          sub="Equity held ≤ 12 months"
          color={tax && tax.stcgGains > 0 ? "text-white" : "text-gray-400"}
          loading={isLoading}
        />
        <StatCard
          label="Est. LTCG Tax"
          value={formatCurrency(tax?.estimatedLtcgTax ?? 0)}
          sub={ltcgTaxable > 0 ? `10% on ${formatCurrency(ltcgTaxable)} above ₹1L` : "Within ₹1L exemption"}
          color={tax && tax.estimatedLtcgTax > 0 ? "text-amber-400" : "text-gray-400"}
          loading={isLoading}
        />
        <StatCard
          label="Est. STCG Tax"
          value={formatCurrency(tax?.estimatedStcgTax ?? 0)}
          sub="Flat 15%"
          color={tax && tax.estimatedStcgTax > 0 ? "text-amber-400" : "text-gray-400"}
          loading={isLoading}
        />
        <StatCard
          label="Total Est. Tax"
          value={formatCurrency((tax?.estimatedLtcgTax ?? 0) + (tax?.estimatedStcgTax ?? 0))}
          color={
            tax && tax.estimatedLtcgTax + tax.estimatedStcgTax > 0
              ? "text-amber-400"
              : "text-gray-400"
          }
          loading={isLoading}
        />
        <StatCard
          label="80C Investments"
          value={formatCurrency(tax?.totalInvestedSection80C ?? 0)}
          sub="SIP contributions (capped at ₹1.5L)"
          color="text-emerald-400"
          loading={isLoading}
        />
      </div>

      {/* Info callout */}
      {!isLoading && (
        <div className="rounded-lg border border-gray-800 bg-gray-900/50 px-4 py-3 text-xs text-gray-500 leading-relaxed">
          <strong className="text-gray-400">Disclaimer:</strong> These are estimates only. LTCG on equity mutual
          funds is taxed at 10% on gains exceeding ₹1 lakh per year. STCG is taxed at 15%. FD interest is taxed
          at your income slab rate. Consult a tax professional for precise calculations. Holding period is based
          on the last NAV update date as a proxy.
        </div>
      )}

      {/* Holdings table */}
      {!isLoading && tax && tax.holdings.length > 0 && (
        <Card className="glass-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Holdings Analysis</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="px-4 py-2.5 text-left text-xs text-gray-500 font-medium">Holding</th>
                    <th className="px-4 py-2.5 text-right text-xs text-gray-500 font-medium">Value</th>
                    <th className="px-4 py-2.5 text-right text-xs text-gray-500 font-medium">Gain / Loss</th>
                    <th className="px-4 py-2.5 text-center text-xs text-gray-500 font-medium">Held</th>
                    <th className="px-4 py-2.5 text-center text-xs text-gray-500 font-medium">
                      <span className="inline-flex items-center gap-1">
                        Category
                        <span className="text-gray-600">(</span>
                        <FinTooltip term="LTCG" />
                        <span className="text-gray-600">/</span>
                        <FinTooltip term="STCG" />
                        <span className="text-gray-600">)</span>
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {tax.holdings.map((h, i) => (
                    <tr key={i} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                      <td className="px-4 py-2.5 text-gray-200 max-w-[180px] truncate">{h.name}</td>
                      <td className="px-4 py-2.5 text-right text-gray-300">{formatCurrency(h.currentValue)}</td>
                      <td className={`px-4 py-2.5 text-right font-medium ${h.gainLoss >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                        {h.gainLoss >= 0 ? "+" : ""}{formatCurrency(h.gainLoss)}
                      </td>
                      <td className="px-4 py-2.5 text-center text-gray-400 text-xs">
                        {h.holdingMonths}m
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${TAX_CATEGORY_STYLES[h.taxCategory] ?? "border-gray-700 text-gray-400"}`}>
                          {h.taxCategory}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {!isLoading && tax && tax.holdings.length === 0 && (
        <Card className="glass-hover">
          <EmptyState
            icon={LandmarkIcon}
            title="No taxable holdings found"
            description="Add holdings or import a CAS statement to see your capital-gains tax summary."
          />
        </Card>
      )}
    </div>
  );
}
