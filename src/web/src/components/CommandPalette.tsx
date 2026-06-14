"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { SearchIcon } from "lucide-react";

const ROUTES = [
  { href: "/", label: "Dashboard", keywords: "home overview" },
  { href: "/plan", label: "Monthly Plan", keywords: "ai budget plan surplus" },
  { href: "/sips", label: "SIP Plans", keywords: "mutual fund sip investment xirr" },
  { href: "/goals", label: "Goals", keywords: "target milestone retire" },
  { href: "/cashflow", label: "Cash Flow", keywords: "income expenses net" },
  { href: "/holdings", label: "Holdings", keywords: "portfolio stocks mutual fund" },
  { href: "/analytics", label: "Analytics", keywords: "allocation cagr performance" },
  { href: "/transactions", label: "Transactions", keywords: "credit debit transaction" },
  { href: "/tax", label: "Tax Summary", keywords: "ltcg stcg 80c capital gains" },
  { href: "/upload", label: "Upload CAS", keywords: "import cas cams karvy pdf" },
  { href: "/settings", label: "Settings", keywords: "theme currency locale reset preferences" },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (open) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const filtered = query.trim()
    ? ROUTES.filter((r) =>
        `${r.label} ${r.keywords}`.toLowerCase().includes(query.toLowerCase())
      )
    : ROUTES;

  const navigate = (href: string) => {
    router.push(href);
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70" onClick={() => setOpen(false)} aria-hidden="true" />

      {/* Palette */}
      <div className="relative w-full max-w-lg glass-strong rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.08]">
          <SearchIcon size={16} className="text-gray-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pages…"
            className="flex-1 bg-transparent text-white placeholder-gray-500 text-sm outline-none"
          />
          <kbd className="text-[10px] text-gray-600 border border-gray-700 rounded px-1.5 py-0.5">Esc</kbd>
        </div>

        <div className="max-h-72 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">No results</p>
          ) : (
            filtered.map((route) => (
              <button
                key={route.href}
                onClick={() => navigate(route.href)}
                className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-white/[0.05] hover:text-white transition-colors flex items-center gap-3"
              >
                <span className="font-medium">{route.label}</span>
                <span className="text-xs text-gray-600">{route.href}</span>
              </button>
            ))
          )}
        </div>

        <div className="px-4 py-2 border-t border-white/[0.08] flex items-center gap-4">
          <span className="text-[10px] text-gray-600">
            <kbd className="border border-gray-700 rounded px-1 py-0.5">↑↓</kbd> navigate
          </span>
          <span className="text-[10px] text-gray-600">
            <kbd className="border border-gray-700 rounded px-1 py-0.5">↵</kbd> open
          </span>
          <span className="text-[10px] text-gray-600 ml-auto">
            <kbd className="border border-gray-700 rounded px-1 py-0.5">⌘K</kbd> to close
          </span>
        </div>
      </div>
    </div>
  );
}
