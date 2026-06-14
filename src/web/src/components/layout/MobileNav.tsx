"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { MenuIcon, XIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/api";

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/plan", label: "Monthly Plan" },
  { href: "/sips", label: "SIPs" },
  { href: "/goals", label: "Goals" },
  { href: "/cashflow", label: "Cash Flow" },
  { href: "/holdings", label: "Holdings" },
  { href: "/analytics", label: "Analytics" },
  { href: "/transactions", label: "Transactions" },
  { href: "/tax", label: "Tax" },
  { href: "/upload", label: "Upload" },
  { href: "/settings", label: "Settings" },
];

export function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
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

  return (
    <>
      {/* Top bar — mobile only */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 glass border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <div className="size-7 rounded-lg accent-gradient grid place-items-center">
            <span className="text-white font-bold text-xs">₹</span>
          </div>
          <span className="text-base font-semibold text-white tracking-tight">FinAdvisor</span>
        </div>
        <button
          onClick={() => setOpen(!open)}
          className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          aria-label="Toggle menu"
        >
          {open ? <XIcon size={22} /> : <MenuIcon size={22} />}
        </button>
      </header>

      {/* Slide-in drawer */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="md:hidden fixed inset-0 z-30 bg-black/60"
            onClick={() => setOpen(false)}
          />
          {/* Drawer */}
          <nav aria-label="Main navigation" className="md:hidden fixed top-0 left-0 bottom-0 z-50 w-64 glass-strong border-r border-white/[0.08] flex flex-col px-3 py-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6 px-3">
              <span className="text-lg font-bold text-white tracking-tight">FinAdvisor</span>
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded text-gray-400 hover:text-white"
              >
                <XIcon size={20} />
              </button>
            </div>
            <div className="flex flex-col gap-1">
              {navItems.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  aria-current={pathname === href ? "page" : undefined}
                  className={cn(
                    "rounded-xl px-3 py-3 text-sm font-medium transition-colors",
                    pathname === href
                      ? "accent-gradient text-white shadow-lg shadow-indigo-600/25"
                      : "text-gray-400 hover:text-white hover:bg-white/[0.04]"
                  )}
                >
                  {label}
                </Link>
              ))}
            </div>
            <div className="mt-auto pt-4 border-t border-gray-800">
              <button
                onClick={handleReset}
                disabled={resetting}
                className={cn(
                  "w-full rounded-md px-3 py-2.5 text-xs font-medium transition-colors text-left",
                  confirming
                    ? "bg-red-900/60 border border-red-700 text-red-300"
                    : "text-gray-600 hover:text-red-400 hover:bg-gray-800"
                )}
              >
                {resetting ? "Resetting…" : confirming ? "⚠ Click again to confirm" : "Reset data"}
              </button>
            </div>
          </nav>
        </>
      )}
    </>
  );
}
