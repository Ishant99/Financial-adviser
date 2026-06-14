import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface StatTileProps {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  /** Tailwind text color class for the value, e.g. "text-emerald-400" */
  valueClassName?: string;
  icon?: React.ReactNode;
  loading?: boolean;
  className?: string;
}

/**
 * Compact glass metric tile used across analytics / tax / cash-flow summaries.
 * Keeps figures aligned (tabular-nums) and labels consistent.
 */
export function StatTile({
  label,
  value,
  sub,
  valueClassName = "text-white",
  icon,
  loading,
  className,
}: StatTileProps) {
  return (
    <div className={cn("glass glass-hover rounded-2xl p-4", className)}>
      <div className="flex items-center justify-between gap-2 mb-2">
        <p className="eyebrow text-gray-500">{label}</p>
        {icon && <span className="text-gray-500">{icon}</span>}
      </div>
      {loading ? (
        <Skeleton className="h-7 w-24" />
      ) : (
        <p className={cn("figure text-2xl font-bold leading-none", valueClassName)}>{value}</p>
      )}
      {sub && !loading && <p className="text-xs text-gray-500 mt-1.5">{sub}</p>}
    </div>
  );
}
