"use client";

import { useState } from "react";
import { PlusIcon, XIcon } from "lucide-react";
import { useAccounts, useAddAccount } from "@/lib/queries/useAccounts";

const ACCOUNT_TYPES = ["SavingsBank", "CurrentBank", "EPF", "PPF", "NPS"];

function CreateAccountDialog({ onClose }: { onClose: (id?: string) => void }) {
  const addAccount = useAddAccount();
  const [name, setName] = useState("");
  const [accountType, setAccountType] = useState("SavingsBank");
  const [institutionName, setInstitutionName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [err, setErr] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    addAccount.mutate(
      { name, accountType, institutionName, accountNumber: accountNumber || undefined },
      {
        onSuccess: (data) => onClose(data.id),
        onError: (e) => setErr(e instanceof Error ? e.message : "Failed to create account"),
      }
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl glass-strong p-6 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-white">New Account</p>
          <button onClick={() => onClose()} className="text-gray-500 hover:text-gray-300 transition-colors">
            <XIcon size={16} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <label className="block text-xs text-gray-400">Account Name *</label>
            <input required value={name} onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Zerodha Demat"
              className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-gray-100 placeholder-gray-600 focus:border-indigo-500 focus:outline-none" />
          </div>
          <div className="space-y-1">
            <label className="block text-xs text-gray-400">Account Type *</label>
            <select value={accountType} onChange={(e) => setAccountType(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-gray-900 px-3 py-2 text-sm text-gray-100 focus:border-indigo-500 focus:outline-none">
              {ACCOUNT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="block text-xs text-gray-400">Institution / Broker *</label>
            <input required value={institutionName} onChange={(e) => setInstitutionName(e.target.value)}
              placeholder="e.g. Zerodha, HDFC Bank"
              className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-gray-100 placeholder-gray-600 focus:border-indigo-500 focus:outline-none" />
          </div>
          <div className="space-y-1">
            <label className="block text-xs text-gray-400">Account Number (optional)</label>
            <input value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="Last 4 digits or folio number"
              className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-gray-100 placeholder-gray-600 focus:border-indigo-500 focus:outline-none" />
          </div>
          {err && <p className="text-xs text-red-400">{err}</p>}
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={() => onClose()}
              className="flex-1 rounded-lg border border-white/10 px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={addAccount.isPending}
              className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50 transition-colors">
              {addAccount.isPending ? "Creating…" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface AccountSelectProps {
  value: string;
  onChange: (id: string) => void;
  className?: string;
  selectClassName?: string;
}

export function AccountSelect({ value, onChange, className, selectClassName }: AccountSelectProps) {
  const { data: accounts = [] } = useAccounts();
  const [showCreate, setShowCreate] = useState(false);
  const active = accounts.filter((a) => a.isActive);

  return (
    <div className={className}>
      {showCreate && (
        <CreateAccountDialog onClose={(id) => {
          setShowCreate(false);
          if (id) onChange(id);
        }} />
      )}
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-400">Account *</span>
        <button type="button" onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
          <PlusIcon size={11} /> New account
        </button>
      </div>
      {active.length === 0 ? (
        <div className="rounded-lg border border-dashed border-white/10 px-3 py-2.5 text-center">
          <p className="text-xs text-gray-500 mb-1.5">No accounts yet.</p>
          <button type="button" onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-1 rounded-lg bg-indigo-600/80 px-3 py-1 text-xs font-medium text-white hover:bg-indigo-600 transition-colors">
            <PlusIcon size={11} /> Create account
          </button>
        </div>
      ) : (
        <select value={value} onChange={(e) => onChange(e.target.value)}
          className={selectClassName ?? "h-8 w-full rounded-lg border border-gray-700 bg-gray-800 px-2.5 py-1 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"}>
          <option value="">Select account…</option>
          {active.map((a) => (
            <option key={a.id} value={a.id}>{a.name} — {a.institutionName}</option>
          ))}
        </select>
      )}
    </div>
  );
}
