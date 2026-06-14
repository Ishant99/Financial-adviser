"use client";

import { cn } from "@/lib/utils";

interface SegmentedProps<T extends string | number> {
  options: { label: string; value: T }[];
  value: T;
  onChange: (value: T) => void;
  size?: "sm" | "default";
  className?: string;
}

/**
 * Unified segmented control — replaces the bespoke toggle buttons that were
 * re-implemented on cash-flow, transactions, holdings, etc.
 */
export function Segmented<T extends string | number>({
  options,
  value,
  onChange,
  size = "default",
  className,
}: SegmentedProps<T>) {
  return (
    <div
      role="tablist"
      className={cn(
        "inline-flex items-center gap-1 rounded-xl glass p-1",
        className
      )}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={String(opt.value)}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              "relative rounded-lg font-medium transition-all whitespace-nowrap",
              size === "sm" ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-sm",
              active
                ? "accent-gradient text-white shadow-md shadow-indigo-600/20"
                : "text-gray-400 hover:text-white"
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
