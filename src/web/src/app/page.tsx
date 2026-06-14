import { NetWorthCard } from "@/components/features/dashboard/NetWorthCard";
import { FinancialHealthCard } from "@/components/features/dashboard/FinancialHealthCard";
import { GoalSummaryCard } from "@/components/features/dashboard/GoalSummaryCard";
import { RecommendationFeed } from "@/components/features/dashboard/RecommendationFeed";
import { MonthlyPlanSummary } from "@/components/features/dashboard/MonthlyPlanSummary";

export default function DashboardPage() {
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const dateLabel = now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="pb-5 border-b border-white/[0.07]">
        <p className="eyebrow text-indigo-400/80">{dateLabel}</p>
        <h1 className="text-2xl font-bold text-white tracking-tight mt-0.5">
          {greeting} <span className="gradient-accent">·</span> here&apos;s your money
        </h1>
      </div>

      {/* Hero row: net worth (wide) + health score */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <NetWorthCard />
        </div>
        <div className="lg:col-span-1">
          <FinancialHealthCard />
        </div>
      </div>

      {/* Secondary row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 stagger">
        <GoalSummaryCard />
        <RecommendationFeed />
        <MonthlyPlanSummary />
      </div>
    </div>
  );
}
