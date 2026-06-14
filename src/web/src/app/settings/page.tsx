"use client";

import { useState } from "react";
import { toast } from "sonner";
import { SettingsIcon, RefreshCwIcon, InfoIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import api from "@/lib/api";

function SettingRow({
  label,
  description,
  children,
}: {
  label: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-white/[0.06] last:border-0">
      <div>
        <p className="text-sm font-medium text-white">{label}</p>
        <p className="text-xs text-gray-500 mt-0.5">{description}</p>
      </div>
      <div className="ml-4 shrink-0">{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  const [confirming, setConfirming] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleReset = async () => {
    if (!confirming) {
      setConfirming(true);
      setTimeout(() => setConfirming(false), 4000);
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
    <div className="max-w-2xl space-y-6">
      <PageHeader
        eyebrow="Preferences"
        title="Settings"
        description="App preferences and data management."
      />

      {/* Display */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <SettingsIcon size={16} aria-hidden="true" />
            Display
          </CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-white/[0.06]">
          <SettingRow
            label="Theme"
            description="Dark mode is the only supported theme in this release."
          >
            <span className="text-xs text-gray-500 bg-white/[0.06] rounded-lg px-3 py-1.5">
              Dark (fixed)
            </span>
          </SettingRow>
          <SettingRow
            label="Currency"
            description="All monetary values are displayed in Indian Rupees."
          >
            <span className="text-xs text-gray-500 bg-white/[0.06] rounded-lg px-3 py-1.5">
              ₹ INR (fixed)
            </span>
          </SettingRow>
          <SettingRow
            label="Locale"
            description="Number and date formatting follows Indian conventions."
          >
            <span className="text-xs text-gray-500 bg-white/[0.06] rounded-lg px-3 py-1.5">
              en-IN (fixed)
            </span>
          </SettingRow>
        </CardContent>
      </Card>

      {/* Tax rules info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <InfoIcon size={16} aria-hidden="true" />
            Tax Rules
          </CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-white/[0.06]">
          <SettingRow
            label="LTCG Rate"
            description="Long-term capital gains on equity funds (held > 12 months). Finance Act 2024, effective 23 Jul 2024."
          >
            <span className="text-xs font-mono text-indigo-300 bg-indigo-900/30 rounded-lg px-3 py-1.5">
              12.5% above ₹1.25L
            </span>
          </SettingRow>
          <SettingRow
            label="STCG Rate"
            description="Short-term capital gains on equity funds (held ≤ 12 months). Finance Act 2024."
          >
            <span className="text-xs font-mono text-indigo-300 bg-indigo-900/30 rounded-lg px-3 py-1.5">
              20% flat
            </span>
          </SettingRow>
          <SettingRow
            label="Section 80C Limit"
            description="Maximum ELSS SIP investment eligible for deduction per financial year."
          >
            <span className="text-xs font-mono text-indigo-300 bg-indigo-900/30 rounded-lg px-3 py-1.5">
              ₹1,50,000 / year
            </span>
          </SettingRow>
        </CardContent>
      </Card>

      {/* Data management */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <RefreshCwIcon size={16} aria-hidden="true" />
            Data Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SettingRow
            label="Reset all data"
            description="Wipes all holdings, goals, SIPs, transactions, and recommendations. Cannot be undone."
          >
            <Button
              variant="outline"
              size="sm"
              disabled={resetting}
              aria-label={confirming ? "Click again to confirm reset" : "Reset all data"}
              onClick={handleReset}
              className={
                confirming
                  ? "border-red-700/60 text-red-300 bg-red-900/30 hover:bg-red-900/40"
                  : "border-white/10 text-red-400 hover:text-red-300 hover:border-red-700/40"
              }
            >
              {resetting ? "Resetting…" : confirming ? "⚠ Confirm reset" : "Reset data"}
            </Button>
          </SettingRow>
        </CardContent>
      </Card>
    </div>
  );
}
