"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import {
  LayoutDashboardIcon, SparklesIcon, WalletIcon, TargetIcon, ArrowLeftRightIcon,
  LayersIcon, PieChartIcon, ReceiptIcon, LandmarkIcon, UploadIcon, SearchIcon,
  SettingsIcon,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/api";

const navItems: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboardIcon },
  { href: "/plan", label: "Monthly Plan", icon: SparklesIcon },
  { href: "/sips", label: "SIPs", icon: WalletIcon },
  { href: "/goals", label: "Goals", icon: TargetIcon },
  { href: "/cashflow", label: "Cash Flow", icon: ArrowLeftRightIcon },
  { href: "/holdings", label: "Holdings", icon: LayersIcon },
  { href: "/analytics", label: "Analytics", icon: PieChartIcon },
  { href: "/transactions", label: "Transactions", icon: ReceiptIcon },
  { href: "/tax", label: "Tax", icon: LandmarkIcon },
  { href: "/upload", label: "Upload", icon: UploadIcon },
  { href: "/settings", label: "Settings", icon: SettingsIcon },
];

export function Sidebar() {
  const pathname = usePathname();
  const [confirming, setConfirming] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleReset = async () => {
    if (!confirming) {
      setConfirming(true);
      setTimeout(() => setConfirming(false), 3000);
      return;
    }
    setConfirming(false);
    setResetting(true);
    try {
      await api.post("/api/dev/reset");
      toast.success("Data reset — reloading…");
      setTimeout(() => { window.location.href = "/"; }, 800);
    } catch {
      toast.error("Reset failed — check the API console");
      setResetting(false);
    }
  };

  const openCommandPalette = () => {
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true, bubbles: true }));
  };

  return (
    <aside className="hidden md:flex flex-col w-60 h-screen sticky top-0 shrink-0 border-r border-white/[0.06] px-3 py-5">
      {/* Brand */}
      <div className="mb-5 px-3 flex items-center gap-2.5">
        <div className="size-8 rounded-xl accent-gradient grid place-items-center shadow-lg shadow-indigo-600/20">
          <span className="text-white font-bold text-sm">₹</span>
        </div>
        <div>
          <span className="text-[15px] font-semibold text-white tracking-tight">FinAdvisor</span>
          <p className="text-[10px] text-gray-500 -mt-0.5">Personal CFO</p>
        </div>
      </div>

      {/* Search trigger */}
      <button
        onClick={openCommandPalette}
        aria-label="Open command palette (Ctrl+K)"
        className="mx-1 mb-5 flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-gray-500 hover:text-gray-300 transition-colors glass glass-hover"
      >
        <SearchIcon size={13} aria-hidden="true" />
        <span className="flex-1 text-left">Search…</span>
        <kbd className="text-[10px] text-gray-500 border border-white/10 rounded px-1 py-0.5">⌘K</kbd>
      </button>

      {/* Nav */}
      <nav aria-label="Main navigation" className="flex flex-col gap-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                active
                  ? "text-white"
                  : "text-gray-400 hover:text-white hover:bg-white/[0.04]"
              )}
            >
              {active && (
                <span className="absolute inset-0 rounded-xl accent-gradient opacity-90 shadow-lg shadow-indigo-600/25" />
              )}
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-full bg-white" />
              )}
              <Icon size={17} className="relative shrink-0" aria-hidden="true" />
              <span className="relative">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Reset — bottom */}
      <div className="mt-auto pt-4 border-t border-white/[0.06]">
        <button
          onClick={handleReset}
          disabled={resetting}
          aria-label={confirming ? "Click again to confirm data reset" : "Reset all data"}
          aria-busy={resetting}
          className={cn(
            "w-full rounded-xl px-3 py-2 text-xs font-medium transition-colors text-left",
            confirming
              ? "bg-red-900/40 border border-red-700/60 text-red-300"
              : "text-gray-600 hover:text-red-400 hover:bg-white/[0.04]"
          )}
        >
          {resetting ? "Resetting…" : confirming ? "⚠ Click again to confirm" : "Reset data"}
        </button>
      </div>
    </aside>
  );
}
