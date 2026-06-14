"use client";

import { AlertTriangleIcon, RotateCwIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  className?: string;
}

/** Consistent inline error banner with a retry affordance. */
export function ErrorState({ message = "Something went wrong", onRetry, className }: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 rounded-xl border border-red-500/20 bg-red-500/[0.07] px-4 py-3",
        className
      )}
    >
      <div className="flex items-center gap-2 min-w-0">
        <AlertTriangleIcon size={15} className="text-red-400 shrink-0" />
        <p className="text-sm text-red-300 truncate">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-1 text-xs font-medium text-red-300 hover:text-red-200 transition-colors shrink-0"
        >
          <RotateCwIcon size={12} /> Retry
        </button>
      )}
    </div>
  );
}
