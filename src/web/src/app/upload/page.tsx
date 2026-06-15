"use client";

import { useRef, useState } from "react";
import { PlusIcon, XIcon } from "lucide-react";
import { useAccounts, useAddAccount } from "@/lib/queries/useAccounts";
import { useUploadCas, useUploadHistory } from "@/lib/queries/useUpload";
import { PageHeader } from "@/components/ui/page-header";
import type { CasImportResult } from "@/types/api";

const ACCOUNT_TYPES = [
  "SavingsBank", "CurrentBank", "EPF", "PPF", "NPS",
];

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
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Zerodha Demat"
              className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-gray-100 placeholder-gray-600 focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs text-gray-400">Account Type *</label>
            <select
              value={accountType}
              onChange={(e) => setAccountType(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-gray-900 px-3 py-2 text-sm text-gray-100 focus:border-indigo-500 focus:outline-none"
            >
              {ACCOUNT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="block text-xs text-gray-400">Institution / Broker *</label>
            <input
              required
              value={institutionName}
              onChange={(e) => setInstitutionName(e.target.value)}
              placeholder="e.g. Zerodha, HDFC Bank"
              className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-gray-100 placeholder-gray-600 focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs text-gray-400">Account Number (optional)</label>
            <input
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="Last 4 digits or folio number"
              className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-gray-100 placeholder-gray-600 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {err && <p className="text-xs text-red-400">{err}</p>}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => onClose()}
              className="flex-1 rounded-lg border border-white/10 px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={addAccount.isPending}
              className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50 transition-colors"
            >
              {addAccount.isPending ? "Creating…" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function UploadPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [accountId, setAccountId] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [result, setResult] = useState<CasImportResult | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showCreateAccount, setShowCreateAccount] = useState(false);

  const { data: accounts = [] } = useAccounts();
  const { data: history = [], isLoading: historyLoading } = useUploadHistory();
  const uploadMutation = useUploadCas();
  const activeAccounts = accounts.filter((a) => a.isActive);

  function handleFileChange(file: File | null) {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setUploadError("Only PDF files are accepted.");
      return;
    }
    setSelectedFile(file);
    setUploadError(null);
    setResult(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedFile) { setUploadError("Please select a CAS PDF file."); return; }
    if (!accountId) { setUploadError("Please select an account."); return; }

    const form = new FormData();
    form.append("file", selectedFile);
    form.append("accountId", accountId);
    if (password) form.append("password", password);

    setUploadError(null);
    setResult(null);

    uploadMutation.mutate(form, {
      onSuccess: (data) => {
        setResult(data);
        setSelectedFile(null);
        setPassword("");
        if (fileRef.current) fileRef.current.value = "";
      },
      onError: (err: unknown) => {
        const msg = err instanceof Error ? err.message : "Upload failed. Please try again.";
        setUploadError(msg);
      },
    });
  }

  return (
    <div className="space-y-8 max-w-2xl">
      {showCreateAccount && (
        <CreateAccountDialog
          onClose={(id) => {
            setShowCreateAccount(false);
            if (id) setAccountId(id);
          }}
        />
      )}

      <PageHeader
        eyebrow="Import"
        title="Upload CAS Statement"
        description="Import mutual fund holdings from a CAMS or Karvy Consolidated Account Statement (PDF)."
      />

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* File drop zone */}
        <div
          className={`relative rounded-xl border-2 border-dashed p-8 text-center transition-colors cursor-pointer
            ${dragOver ? "border-indigo-500 bg-indigo-950/30" : "border-white/15 glass hover:border-white/30"}`}
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleFileChange(e.dataTransfer.files[0] ?? null);
          }}
        >
          <input
            ref={fileRef}
            type="file"
            accept=".pdf"
            className="sr-only"
            onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
          />
          {selectedFile ? (
            <div className="space-y-1">
              <p className="text-sm font-medium text-indigo-300">{selectedFile.name}</p>
              <p className="text-xs text-gray-500">
                {(selectedFile.size / 1024).toFixed(1)} KB — click to change
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-sm text-gray-300">Drop CAS PDF here or <span className="text-indigo-400 underline">browse</span></p>
              <p className="text-xs text-gray-600">CAMS / Karvy · PDF only</p>
            </div>
          )}
        </div>

        {/* Password (optional) */}
        <div className="space-y-1">
          <label className="block text-sm text-gray-300">
            PDF Password <span className="text-gray-600">(if password-protected)</span>
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Leave blank if none"
            className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-gray-100 placeholder-gray-600 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        {/* Account selector */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="block text-sm text-gray-300">
              Link to Account <span className="text-red-400">*</span>
            </label>
            <button
              type="button"
              onClick={() => setShowCreateAccount(true)}
              className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              <PlusIcon size={12} /> New account
            </button>
          </div>
          {activeAccounts.length === 0 ? (
            <div className="rounded-lg border border-dashed border-white/10 px-4 py-3 text-center">
              <p className="text-xs text-gray-500 mb-2">No accounts yet.</p>
              <button
                type="button"
                onClick={() => setShowCreateAccount(true)}
                className="inline-flex items-center gap-1 rounded-lg bg-indigo-600/80 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-600 transition-colors"
              >
                <PlusIcon size={12} /> Create your first account
              </button>
            </div>
          ) : (
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-gray-900 px-3 py-2 text-sm text-gray-100 focus:border-indigo-500 focus:outline-none"
            >
              <option value="">Select account…</option>
              {activeAccounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} — {a.institutionName}
                </option>
              ))}
            </select>
          )}
        </div>

        {uploadError && (
          <p className="rounded-lg bg-red-950 border border-red-800 px-4 py-3 text-sm text-red-300">
            {uploadError}
          </p>
        )}

        <button
          type="submit"
          disabled={uploadMutation.isPending || activeAccounts.length === 0}
          className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {uploadMutation.isPending ? "Uploading…" : "Import Holdings"}
        </button>
      </form>

      {/* Success result */}
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

      {/* Upload history */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold text-white">Upload History</h2>
        {historyLoading ? (
          <p className="text-sm text-gray-500">Loading…</p>
        ) : history.length === 0 ? (
          <p className="text-sm text-gray-600">No uploads yet.</p>
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
