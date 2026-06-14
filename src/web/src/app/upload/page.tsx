"use client";

import { useRef, useState } from "react";
import { useAccounts } from "@/lib/queries/useAccounts";
import { useUploadCas, useUploadHistory } from "@/lib/queries/useUpload";
import { PageHeader } from "@/components/ui/page-header";
import type { CasImportResult } from "@/types/api";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function UploadPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [accountId, setAccountId] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [result, setResult] = useState<CasImportResult | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const { data: accounts = [] } = useAccounts();
  const { data: history = [], isLoading: historyLoading } = useUploadHistory();
  const uploadMutation = useUploadCas();

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
          <label className="block text-sm text-gray-300">
            Link to Account <span className="text-red-400">*</span>
          </label>
          <select
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-gray-100 focus:border-indigo-500 focus:outline-none"
          >
            <option value="">Select account…</option>
            {accounts.filter((a) => a.isActive).map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} — {a.institutionName}
              </option>
            ))}
          </select>
        </div>

        {uploadError && (
          <p className="rounded-lg bg-red-950 border border-red-800 px-4 py-3 text-sm text-red-300">
            {uploadError}
          </p>
        )}

        <button
          type="submit"
          disabled={uploadMutation.isPending}
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
