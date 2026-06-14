import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

/**
 * Consistent empty state — icon in a soft glass disc, title, supporting copy,
 * and an optional call to action. Used across every list/table screen.
 */
export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center text-center py-16 px-4", className)}>
      <div className="size-14 rounded-2xl glass grid place-items-center mb-4">
        <Icon size={26} className="text-gray-500" />
      </div>
      <p className="text-sm font-semibold text-gray-200">{title}</p>
      {description && <p className="text-xs text-gray-500 mt-1.5 max-w-sm leading-relaxed">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
