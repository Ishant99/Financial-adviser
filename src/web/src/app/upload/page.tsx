"use client";

import { useRef, useState } from "react";
import { PlusIcon, XIcon } from "lucide-react";
import { useAccounts, useAddAccount } from "@/lib/queries/useAccounts";
import { useUploadCas, useUploadBankStatement, useUploadBrokerHoldings, useUploadSips, useUploadHistory } from "@/lib/queries/useUpload";
import { PageHeader } from "@/components/ui/page-header";
import type { BankStatementImportResult, CasImportResult, HoldingsImportResult, SipBulkImportResult } from "@/types/api";

const ACCOUNT_TYPES = ["SavingsBank", "CurrentBank", "EPF", "PPF", "NPS"];

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR", maximumFractionDigits: 0,
  }).format(n);
}

function CreateAccountDialog({ onClose }: { onClose: (id?: string) => void }) {
  const addAccount = useAddAccount();
  const [name, setName] = useState("");
  const [accountType, setAccountType] = useState("SavingsBank");
  const [institutionName, setInstitutionName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [err, setErr] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
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
              placeholder="e.g. Axis Bank Savings"
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
              placeholder="e.g. Axis Bank, HDFC Bank"
              className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-gray-100 placeholder-gray-600 focus:border-indigo-500 focus:outline-none" />
          </div>
          <div className="space-y-1">
            <label className="block text-xs text-gray-400">Account Number (optional)</label>
            <input value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="Last 4 digits"
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

function AccountSelector({
  accountId,
  activeAccounts,
  onSelect,
  onCreateClick,
}: {
  accountId: string;
  activeAccounts: { id: string; name: string; institutionName: string }[];
  onSelect: (id: string) => void;
  onCreateClick: () => void;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <label className="block text-sm text-gray-300">Link to Account <span className="text-red-400">*</span></label>
        <button type="button" onClick={onCreateClick}
          className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
          <PlusIcon size={12} /> New account
        </button>
      </div>
      {activeAccounts.length === 0 ? (
        <div className="rounded-lg border border-dashed border-white/10 px-4 py-3 text-center">
          <p className="text-xs text-gray-500 mb-2">No accounts yet.</p>
          <button type="button" onClick={onCreateClick}
            className="inline-flex items-center gap-1 rounded-lg bg-indigo-600/80 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-600 transition-colors">
            <PlusIcon size={12} /> Create your first account
          </button>
        </div>
      ) : (
        <select value={accountId} onChange={(e) => onSelect(e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-gray-900 px-3 py-2 text-sm text-gray-100 focus:border-indigo-500 focus:outline-none">
          <option value="">Select account…</option>
          {activeAccounts.map((a) => (
            <option key={a.id} value={a.id}>{a.name} — {a.institutionName}</option>
          ))}
        </select>
      )}
    </div>
  );
}

function serverError(err: unknown): string {
  const axiosErr = err as { response?: { data?: { error?: string; detail?: string } } };
  return axiosErr?.response?.data?.error || axiosErr?.response?.data?.detail || (err instanceof Error ? err.message : "Upload failed.");
}

// ─── CAS tab ────────────────────────────────────────────────────────────────

function CasUploadTab({
  activeAccounts,
  onCreateAccount,
}: {
  activeAccounts: { id: string; name: string; institutionName: string }[];
  onCreateAccount: (cb: (id: string) => void) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [accountId, setAccountId] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [result, setResult] = useState<CasImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const uploadMutation = useUploadCas();

  function handleFileChange(file: File | null) {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".pdf")) { setError("Only PDF files are accepted."); return; }
    setSelectedFile(file); setError(null); setResult(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedFile) { setError("Please select a CAS PDF file."); return; }
    if (!accountId) { setError("Please select an account."); return; }
    const form = new FormData();
    form.append("file", new Blob([selectedFile], { type: "application/pdf" }), selectedFile.name);
    form.append("accountId", accountId);
    if (password) form.append("password", password);
    setError(null); setResult(null);
    uploadMutation.mutate(form, {
      onSuccess: (data) => {
        setResult(data); setSelectedFile(null); setPassword("");
        if (fileRef.current) fileRef.current.value = "";
      },
      onError: (err: unknown) => {
        const msg = serverError(err);
        const isCasFormatError = msg.includes("investor_info") || msg.includes("file_type") || msg.includes("PartialCASData");
        setError(isCasFormatError
          ? "This doesn't look like a CAS file. Upload a Consolidated Account Statement PDF from mycams.com or kfintech.com — not a bank statement."
          : msg);
      },
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div
        className={`relative rounded-xl border-2 border-dashed p-8 text-center transition-colors cursor-pointer
          ${dragOver ? "border-indigo-500 bg-indigo-950/30" : "border-white/15 glass hover:border-white/30"}`}
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFileChange(e.dataTransfer.files[0] ?? null); }}
      >
        <input ref={fileRef} type="file" accept=".pdf" className="sr-only"
          onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)} />
        {selectedFile ? (
          <div className="space-y-1">
            <p className="text-sm font-medium text-indigo-300">{selectedFile.name}</p>
            <p className="text-xs text-gray-500">{(selectedFile.size / 1024).toFixed(1)} KB — click to change</p>
          </div>
        ) : (
          <div className="space-y-1">
            <p className="text-sm text-gray-300">Drop CAS PDF here or <span className="text-indigo-400 underline">browse</span></p>
            <p className="text-xs text-gray-600">CAS PDF only · from mycams.com or kfintech.com</p>
          </div>
        )}
      </div>

      <div className="space-y-1">
        <label className="block text-sm text-gray-300">PDF Password <span className="text-gray-600">(if protected)</span></label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
          placeholder="Leave blank if none"
          className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-gray-100 placeholder-gray-600 focus:border-indigo-500 focus:outline-none" />
      </div>

      <AccountSelector accountId={accountId} activeAccounts={activeAccounts}
        onSelect={setAccountId} onCreateClick={() => onCreateAccount(setAccountId)} />

      {error && (
        <p className="rounded-lg bg-red-950 border border-red-800 px-4 py-3 text-sm text-red-300">{error}</p>
      )}

      <button type="submit" disabled={uploadMutation.isPending || activeAccounts.length === 0}
        className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
        {uploadMutation.isPending ? "Uploading…" : "Import Holdings"}
      </button>

      {result && (
        <div className="rounded-xl border border-green-800 bg-green-950/40 p-5 space-y-3">
          <p className="text-sm font-semibold text-green-300">Import successful</p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg bg-white/[0.04] p-3">
              <p className="text-gray-400">Investor</p>
              <p className="font-medium text-white">{result.investorName}</p>
            </div>
            <div className="rounded-lg bg-white/[0.04] p-3">
              <p className="text-gray-400">Portfolio value</p>
              <p className="font-medium text-white">{formatCurrency(result.totalValue)}</p>
            </div>
            <div className="rounded-lg bg-white/[0.04] p-3">
              <p className="text-gray-400">New holdings</p>
              <p className="font-medium text-white">{result.holdingsImported}</p>
            </div>
            <div className="rounded-lg bg-white/[0.04] p-3">
              <p className="text-gray-400">Updated holdings</p>
              <p className="font-medium text-white">{result.holdingsUpdated}</p>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}

// ─── Bank Statement tab ──────────────────────────────────────────────────────

function BankStatementTab({
  activeAccounts,
  onCreateAccount,
}: {
  activeAccounts: { id: string; name: string; institutionName: string }[];
  onCreateAccount: (cb: (id: string) => void) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [accountId, setAccountId] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [result, setResult] = useState<BankStatementImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const uploadMutation = useUploadBankStatement();

  function handleFileChange(file: File | null) {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".pdf")) { setError("Only PDF files are accepted."); return; }
    setSelectedFile(file); setError(null); setResult(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedFile) { setError("Please select a bank statement PDF."); return; }
    if (!accountId) { setError("Please select an account."); return; }
    const form = new FormData();
    form.append("file", new Blob([selectedFile], { type: "application/pdf" }), selectedFile.name);
    form.append("accountId", accountId);
    if (password) form.append("password", password);
    setError(null); setResult(null);
    uploadMutation.mutate(form, {
      onSuccess: (data) => {
        setResult(data); setSelectedFile(null); setPassword("");
        if (fileRef.current) fileRef.current.value = "";
      },
      onError: (err: unknown) => setError(serverError(err)),
    });
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-indigo-900/50 bg-indigo-950/20 px-4 py-3 text-xs text-indigo-300 leading-relaxed">
        Supported: <strong>Axis Bank</strong>, HDFC Bank, ICICI Bank, SBI, Kotak Bank, Yes Bank, PNB.
        Upload the PDF bank statement downloaded from your bank&apos;s net-banking portal.
        Transactions will be auto-categorised and imported into the Transactions tab.
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div
          className={`relative rounded-xl border-2 border-dashed p-8 text-center transition-colors cursor-pointer
            ${dragOver ? "border-indigo-500 bg-indigo-950/30" : "border-white/15 glass hover:border-white/30"}`}
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFileChange(e.dataTransfer.files[0] ?? null); }}
        >
          <input ref={fileRef} type="file" accept=".pdf" className="sr-only"
            onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)} />
          {selectedFile ? (
            <div className="space-y-1">
              <p className="text-sm font-medium text-indigo-300">{selectedFile.name}</p>
              <p className="text-xs text-gray-500">{(selectedFile.size / 1024).toFixed(1)} KB — click to change</p>
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-sm text-gray-300">Drop bank statement PDF here or <span className="text-indigo-400 underline">browse</span></p>
              <p className="text-xs text-gray-600">PDF only · Axis Bank, HDFC, ICICI, SBI, Kotak…</p>
            </div>
          )}
        </div>

        <div className="space-y-1">
          <label className="block text-sm text-gray-300">PDF Password <span className="text-gray-600">(if protected)</span></label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="Leave blank if none"
            className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-gray-100 placeholder-gray-600 focus:border-indigo-500 focus:outline-none" />
        </div>

        <AccountSelector accountId={accountId} activeAccounts={activeAccounts}
          onSelect={setAccountId} onCreateClick={() => onCreateAccount(setAccountId)} />

        {error && (
          <p className="rounded-lg bg-red-950 border border-red-800 px-4 py-3 text-sm text-red-300">{error}</p>
        )}

        <button type="submit" disabled={uploadMutation.isPending || activeAccounts.length === 0}
          className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
          {uploadMutation.isPending ? "Importing transactions…" : "Import Transactions"}
        </button>

        {result && (
          <div className="rounded-xl border border-green-800 bg-green-950/40 p-5 space-y-3">
            <p className="text-sm font-semibold text-green-300">Import successful</p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-white/[0.04] p-3">
                <p className="text-gray-400">Bank</p>
                <p className="font-medium text-white">{result.bankName}</p>
              </div>
              {result.accountNumber && (
                <div className="rounded-lg bg-white/[0.04] p-3">
                  <p className="text-gray-400">Account No.</p>
                  <p className="font-medium text-white">****{result.accountNumber.slice(-4)}</p>
                </div>
              )}
              <div className="rounded-lg bg-white/[0.04] p-3">
                <p className="text-gray-400">Transactions imported</p>
                <p className="font-medium text-white">{result.imported}</p>
              </div>
              <div className="rounded-lg bg-white/[0.04] p-3">
                <p className="text-gray-400">Re-categorised</p>
                <p className="font-medium text-white">{result.updated}</p>
              </div>
              <div className="rounded-lg bg-white/[0.04] p-3">
                <p className="text-gray-400">Duplicates skipped</p>
                <p className="font-medium text-white">{result.skipped}</p>
              </div>
              {result.periodFrom && (
                <div className="rounded-lg bg-white/[0.04] p-3 col-span-2">
                  <p className="text-gray-400">Period</p>
                  <p className="font-medium text-white">{result.periodFrom} → {result.periodTo}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

// ─── Broker Holdings tab ─────────────────────────────────────────────────────

function BrokerHoldingsTab({
  activeAccounts,
  onCreateAccount,
}: {
  activeAccounts: { id: string; name: string; institutionName: string }[];
  onCreateAccount: (cb: (id: string) => void) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [accountId, setAccountId] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [result, setResult] = useState<HoldingsImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const uploadMutation = useUploadBrokerHoldings();

  function handleFileChange(file: File | null) {
    if (!file) return;
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!["xlsx", "xls", "csv"].includes(ext ?? "")) {
      setError("Only Excel (.xlsx) or CSV (.csv) files are accepted."); return;
    }
    setSelectedFile(file); setError(null); setResult(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedFile) { setError("Please select an Excel or CSV file."); return; }
    if (!accountId) { setError("Please select an account."); return; }
    const form = new FormData();
    form.append("file", selectedFile, selectedFile.name);
    form.append("accountId", accountId);
    setError(null); setResult(null);
    uploadMutation.mutate(form, {
      onSuccess: (data) => {
        setResult(data); setSelectedFile(null);
        if (fileRef.current) fileRef.current.value = "";
      },
      onError: (err: unknown) => setError(serverError(err)),
    });
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-indigo-900/50 bg-indigo-950/20 px-4 py-3 text-xs text-indigo-300 leading-relaxed">
        Paste your <strong>Groww</strong> portfolio export (Excel). Also works with Zerodha, Kuvera, and generic CSV.
        Go to Groww → Portfolio → Download (Excel icon) → upload that file here.
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div
          className={`relative rounded-xl border-2 border-dashed p-8 text-center transition-colors cursor-pointer
            ${dragOver ? "border-indigo-500 bg-indigo-950/30" : "border-white/15 glass hover:border-white/30"}`}
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFileChange(e.dataTransfer.files[0] ?? null); }}
        >
          <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="sr-only"
            onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)} />
          {selectedFile ? (
            <div className="space-y-1">
              <p className="text-sm font-medium text-indigo-300">{selectedFile.name}</p>
              <p className="text-xs text-gray-500">{(selectedFile.size / 1024).toFixed(1)} KB — click to change</p>
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-sm text-gray-300">Drop Excel / CSV here or <span className="text-indigo-400 underline">browse</span></p>
              <p className="text-xs text-gray-600">.xlsx · .csv · Groww, Zerodha, Kuvera</p>
            </div>
          )}
        </div>

        <AccountSelector accountId={accountId} activeAccounts={activeAccounts}
          onSelect={setAccountId} onCreateClick={() => onCreateAccount(setAccountId)} />

        {error && (
          <p className="rounded-lg bg-red-950 border border-red-800 px-4 py-3 text-sm text-red-300">{error}</p>
        )}

        <button type="submit" disabled={uploadMutation.isPending || activeAccounts.length === 0}
          className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
          {uploadMutation.isPending ? "Importing holdings…" : "Import Holdings"}
        </button>

        {result && (
          <div className="rounded-xl border border-green-800 bg-green-950/40 p-5 space-y-3">
            <p className="text-sm font-semibold text-green-300">Import successful · {result.source}</p>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="rounded-lg bg-white/[0.04] p-3">
                <p className="text-gray-400">New holdings</p>
                <p className="font-medium text-white">{result.imported}</p>
              </div>
              <div className="rounded-lg bg-white/[0.04] p-3">
                <p className="text-gray-400">Updated</p>
                <p className="font-medium text-white">{result.updated}</p>
              </div>
              <div className="rounded-lg bg-white/[0.04] p-3">
                <p className="text-gray-400">Portfolio value</p>
                <p className="font-medium text-white">
                  {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(result.totalCurrentValue)}
                </p>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

// ─── SIP Import tab ──────────────────────────────────────────────────────────

function SipImportTab() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [result, setResult] = useState<SipBulkImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const uploadMutation = useUploadSips();

  function handleFileChange(file: File | null) {
    if (!file) return;
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!["xlsx", "xls", "csv"].includes(ext ?? "")) {
      setError("Only Excel (.xlsx) or CSV (.csv) files are accepted."); return;
    }
    setSelectedFile(file); setError(null); setResult(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedFile) { setError("Please select a file."); return; }
    const form = new FormData();
    form.append("file", selectedFile, selectedFile.name);
    setError(null); setResult(null);
    uploadMutation.mutate(form, {
      onSuccess: (data) => {
        setResult(data); setSelectedFile(null);
        if (fileRef.current) fileRef.current.value = "";
      },
      onError: (err: unknown) => setError(serverError(err)),
    });
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-indigo-900/50 bg-indigo-950/20 px-4 py-3 text-xs text-indigo-300 leading-relaxed space-y-1.5">
        <p><strong>Where to download your SIP report:</strong></p>
        <ul className="list-disc list-inside space-y-1 text-indigo-300/80">
          <li><strong>Groww</strong> → Profile → Reports → Investment Reports → SIP Instalment Report → Download Excel</li>
          <li><strong>CAMS</strong> → mycams.com → Statements → SIP Outstanding → Download</li>
          <li><strong>KFintech</strong> → kfintech.com → Reports → SIP Details → Export</li>
          <li>Or create a <strong>CSV</strong> with columns: Fund Name, Monthly Amount, SIP Date, Start Date</li>
        </ul>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div
          className={`relative rounded-xl border-2 border-dashed p-8 text-center transition-colors cursor-pointer
            ${dragOver ? "border-indigo-500 bg-indigo-950/30" : "border-white/15 glass hover:border-white/30"}`}
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFileChange(e.dataTransfer.files[0] ?? null); }}
        >
          <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="sr-only"
            onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)} />
          {selectedFile ? (
            <div className="space-y-1">
              <p className="text-sm font-medium text-indigo-300">{selectedFile.name}</p>
              <p className="text-xs text-gray-500">{(selectedFile.size / 1024).toFixed(1)} KB — click to change</p>
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-sm text-gray-300">Drop SIP report here or <span className="text-indigo-400 underline">browse</span></p>
              <p className="text-xs text-gray-600">.xlsx · .csv · Groww, CAMS, KFintech</p>
            </div>
          )}
        </div>

        {error && (
          <p className="rounded-lg bg-red-950 border border-red-800 px-4 py-3 text-sm text-red-300">{error}</p>
        )}

        <button type="submit" disabled={uploadMutation.isPending || !selectedFile}
          className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
          {uploadMutation.isPending ? "Importing SIPs…" : "Import SIPs"}
        </button>

        {result && (
          <div className="rounded-xl border border-green-800 bg-green-950/40 p-5 space-y-3">
            <p className="text-sm font-semibold text-green-300">Import successful · {result.source}</p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-white/[0.04] p-3">
                <p className="text-gray-400">SIPs added</p>
                <p className="font-medium text-white">{result.imported}</p>
              </div>
              <div className="rounded-lg bg-white/[0.04] p-3">
                <p className="text-gray-400">Already existed</p>
                <p className="font-medium text-white">{result.skipped}</p>
              </div>
            </div>
            <p className="text-xs text-gray-500">Go to the SIPs page to link goals and run XIRR.</p>
          </div>
        )}
      </form>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

type Tab = "cas" | "broker" | "sip" | "bank";

export default function UploadPage() {
  const [activeTab, setActiveTab] = useState<Tab>("cas");
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [createAccountCb, setCreateAccountCb] = useState<((id: string) => void) | null>(null);

  const { data: accounts = [] } = useAccounts();
  const { data: history = [], isLoading: historyLoading } = useUploadHistory();
  const activeAccounts = accounts.filter((a) => a.isActive);

  function openCreateAccount(cb: (id: string) => void) {
    setCreateAccountCb(() => cb);
    setShowCreateAccount(true);
  }

  return (
    <div className="space-y-8 max-w-2xl">
      {showCreateAccount && (
        <CreateAccountDialog
          onClose={(id) => {
            setShowCreateAccount(false);
            if (id && createAccountCb) createAccountCb(id);
            setCreateAccountCb(null);
          }}
        />
      )}

      <PageHeader
        eyebrow="Import"
        title="Upload Statement"
        description="Import mutual fund holdings from a CAS PDF, or import bank transactions from your bank statement."
      />

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl glass p-1 w-fit">
        {([["cas", "Mutual Fund CAS"], ["broker", "Broker Export"], ["sip", "SIP Import"], ["bank", "Bank Statement"]] as [Tab, string][]).map(([tab, label]) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors
              ${activeTab === tab
                ? "bg-indigo-600 text-white"
                : "text-gray-400 hover:text-white"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === "cas" && (
        <CasUploadTab activeAccounts={activeAccounts} onCreateAccount={openCreateAccount} />
      )}
      {activeTab === "broker" && (
        <BrokerHoldingsTab activeAccounts={activeAccounts} onCreateAccount={openCreateAccount} />
      )}
      {activeTab === "sip" && <SipImportTab />}
      {activeTab === "bank" && (
        <BankStatementTab activeAccounts={activeAccounts} onCreateAccount={openCreateAccount} />
      )}

      {/* Upload history (CAS only for now) */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold text-white">CAS Upload History</h2>
        {historyLoading ? (
          <p className="text-sm text-gray-500">Loading…</p>
        ) : history.length === 0 ? (
          <p className="text-sm text-gray-600">No CAS uploads yet.</p>
        ) : (
          <div className="overflow-hidden rounded-2xl glass">
            <table className="w-full text-sm">
              <thead className="bg-white/[0.04] text-left">
                <tr>
                  <th className="px-4 py-3 text-xs font-medium text-gray-400">File</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-400">Date</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-400 text-right">Imported</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-400 text-right">Updated</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-400">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {history.map((log) => (
                  <tr key={log.id} className="hover:bg-white/[0.03] transition-colors">
                    <td className="px-4 py-3 text-gray-200 max-w-[180px] truncate" title={log.fileName}>
                      {log.fileName}
                    </td>
                    <td className="px-4 py-3 text-gray-400">{formatDate(log.uploadedAt)}</td>
                    <td className="px-4 py-3 text-gray-200 text-right">{log.holdingsImported}</td>
                    <td className="px-4 py-3 text-gray-200 text-right">{log.holdingsUpdated}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium
                        ${log.status === "Success"
                          ? "bg-green-950 text-green-300 border border-green-800"
                          : "bg-red-950 text-red-300 border border-red-800"}`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
