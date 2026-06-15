"use client";

import { useState, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  PlusIcon, SearchIcon, ArrowUpDownIcon, DownloadIcon,
  PencilIcon, Trash2Icon, ReceiptIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  useTransactions, useAddTransaction, useUpdateTransaction, useDeleteTransaction,
} from "@/lib/queries/useTransactions";
import { AccountSelect } from "@/components/ui/account-select";
import { formatCurrency, formatDate } from "@/lib/format";
import { PageHeader } from "@/components/ui/page-header";
import { Segmented } from "@/components/ui/segmented";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import type { TransactionDto } from "@/types/api";

// ── Schema ────────────────────────────────────────────────────────────────────

const txSchema = z.object({
  accountId: z.string().min(1, "Account is required"),
  date: z.string().min(1, "Date is required"),
  amount: z.number().positive("Must be > 0"),
  transactionType: z.enum(["Credit", "Debit"]),
  category: z.string().min(1, "Category is required"),
  description: z.string().min(0),
});

type TxValues = z.infer<typeof txSchema>;

// ── Helpers ───────────────────────────────────────────────────────────────────

function Field({
  label, error, help, children,
}: {
  label: string; error?: string; help?: string; children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-gray-300">{label}</Label>
      {children}
      {help && !error && <p className="text-xs text-gray-600">{help}</p>}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

const CATEGORIES = [
  "Salary", "Business", "Investment", "Groceries", "Utilities",
  "Rent", "EMI", "Entertainment", "Health", "Travel", "Education", "Transfer", "Other",
];

function TxForm({
  defaultValues, onSubmit, onCancel, isSubmitting, mode,
}: {
  defaultValues?: Partial<TxValues>;
  onSubmit: (v: TxValues) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  mode: "add" | "edit";
}) {
  const { register, handleSubmit, control, formState: { errors } } = useForm<TxValues>({
    resolver: zodResolver(txSchema),
    defaultValues: { transactionType: "Debit", description: "", ...defaultValues },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      {mode === "add" && (
        <div>
          <Controller
            control={control}
            name="accountId"
            render={({ field }) => (
              <AccountSelect value={field.value ?? ""} onChange={field.onChange} />
            )}
          />
          {errors.accountId && <p className="text-xs text-red-400 mt-1">{errors.accountId.message}</p>}
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <Field label="Date" error={errors.date?.message}>
          <Input {...register("date")} type="date" className="bg-gray-800 border-gray-700 text-gray-100" />
        </Field>
        <Field label="Amount (₹)" error={errors.amount?.message}>
          <Input {...register("amount", { valueAsNumber: true })} type="number" step="0.01" className="bg-gray-800 border-gray-700 text-gray-100" />
        </Field>
      </div>
      <Field label="Type" error={errors.transactionType?.message}>
        <select
          {...register("transactionType")}
          className="h-8 w-full rounded-lg border border-gray-700 bg-gray-800 px-2.5 py-1 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="Credit">Credit (income)</option>
          <option value="Debit">Debit (expense)</option>
        </select>
      </Field>
      <Field label="Category" error={errors.category?.message}>
        <select
          {...register("category")}
          className="h-8 w-full rounded-lg border border-gray-700 bg-gray-800 px-2.5 py-1 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Select category…</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </Field>
      <Field label="Description" error={errors.description?.message} help="Optional note about this transaction">
        <Input {...register("description")} placeholder="e.g. HDFC credit card bill" className="bg-gray-800 border-gray-700 text-gray-100" />
      </Field>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting}>
          {mode === "add" ? "Add Transaction" : "Save Changes"}
        </Button>
      </DialogFooter>
    </form>
  );
}

// ── CSV export ────────────────────────────────────────────────────────────────

function exportCsv(txns: TransactionDto[]) {
  const header = "Date,Type,Category,Description,Amount";
  const rows = txns.map((t) =>
    [t.date, t.transactionType, t.category, `"${t.description.replace(/"/g, '""')}"`, t.amount].join(",")
  );
  const blob = new Blob([header + "\n" + rows.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `transactions_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Sort helpers ──────────────────────────────────────────────────────────────

type SortField = "date" | "amount" | "category";
type SortDir = "asc" | "desc";

function SortButton({ field, current, dir, onSort }: {
  field: SortField; current: SortField; dir: SortDir; onSort: (f: SortField) => void;
}) {
  return (
    <button onClick={() => onSort(field)} className="inline-flex items-center gap-0.5 hover:text-white transition-colors">
      {field.charAt(0).toUpperCase() + field.slice(1)}
      <ArrowUpDownIcon size={12} className={current === field ? "text-indigo-400" : "text-gray-600"} />
    </button>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function TransactionsPage() {
  const today = new Date();
  // Default to the last 12 months so an imported year of statements is visible at a glance.
  const defaultFrom = new Date(today.getFullYear() - 1, today.getMonth(), 1).toISOString().slice(0, 10);
  const defaultTo = today.toISOString().slice(0, 10);

  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(defaultTo);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [typeFilter, setTypeFilter] = useState<"All" | "Credit" | "Debit">("All");
  const [addOpen, setAddOpen] = useState(false);
  const [editTx, setEditTx] = useState<TransactionDto | null>(null);
  const [deleteTx, setDeleteTx] = useState<TransactionDto | null>(null);

  const { data: txns, isLoading, isError, refetch } = useTransactions(undefined, from, to);
  const addTx = useAddTransaction();
  const updateTx = useUpdateTransaction();
  const deleteMut = useDeleteTransaction();

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
  };

  const filtered = useMemo(() => {
    if (!txns) return [];
    return txns
      .filter((t) => {
        if (typeFilter !== "All" && t.transactionType !== typeFilter) return false;
        if (search.trim()) {
          const q = search.toLowerCase();
          return t.description.toLowerCase().includes(q) || t.category.toLowerCase().includes(q);
        }
        return true;
      })
      .sort((a, b) => {
        let cmp = 0;
        if (sortField === "date") cmp = a.date.localeCompare(b.date);
        else if (sortField === "amount") cmp = a.amount - b.amount;
        else if (sortField === "category") cmp = a.category.localeCompare(b.category);
        return sortDir === "asc" ? cmp : -cmp;
      });
  }, [txns, search, typeFilter, sortField, sortDir]);

  const totalCredit = filtered.filter((t) => t.transactionType === "Credit").reduce((s, t) => s + t.amount, 0);
  const totalDebit = filtered.filter((t) => t.transactionType === "Debit").reduce((s, t) => s + t.amount, 0);

  const handleAdd = async (values: TxValues) => {
    try {
      await addTx.mutateAsync(values);
      toast.success("Transaction added");
      setAddOpen(false);
    } catch {
      toast.error("Failed to add transaction");
    }
  };

  const handleEdit = async (values: TxValues) => {
    if (!editTx) return;
    try {
      await updateTx.mutateAsync({
        id: editTx.id,
        req: {
          date: values.date,
          amount: values.amount,
          transactionType: values.transactionType,
          category: values.category,
          description: values.description,
        },
      });
      toast.success("Transaction updated");
      setEditTx(null);
    } catch {
      toast.error("Failed to update transaction");
    }
  };

  const handleDelete = async () => {
    if (!deleteTx) return;
    try {
      await deleteMut.mutateAsync(deleteTx.id);
      toast.success("Transaction deleted");
      setDeleteTx(null);
    } catch {
      toast.error("Failed to delete transaction");
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Transactions"
        title="Money In & Out"
        description={`${filtered.length} record${filtered.length !== 1 ? "s" : ""} in the selected range.`}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => filtered.length && exportCsv(filtered)}>
              <DownloadIcon size={14} className="mr-1" /> CSV
            </Button>
            <Button size="sm" onClick={() => setAddOpen(true)}>
              <PlusIcon size={14} className="mr-1" /> Add
            </Button>
          </>
        }
      />

      {/* Summary chips */}
      {filtered.length > 0 && (
        <div className="flex gap-2 flex-wrap text-sm">
          <span className="figure px-3 py-1 rounded-full bg-emerald-500/10 ring-1 ring-emerald-500/20 text-emerald-400 text-xs">
            ↑ {formatCurrency(totalCredit)}
          </span>
          <span className="figure px-3 py-1 rounded-full bg-rose-500/10 ring-1 ring-rose-500/20 text-rose-400 text-xs">
            ↓ {formatCurrency(totalDebit)}
          </span>
          <span className={`figure px-3 py-1 rounded-full ring-1 text-xs ${
            totalCredit - totalDebit >= 0
              ? "bg-emerald-500/10 ring-emerald-500/20 text-emerald-400"
              : "bg-rose-500/10 ring-rose-500/20 text-rose-400"
          }`}>
            Net {formatCurrency(totalCredit - totalDebit)}
          </span>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 flex-wrap items-center">
        <div className="relative flex-1 min-w-[180px]">
          <SearchIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search description or category…"
            className="pl-8 bg-white/[0.03] border-white/10 text-gray-100 text-sm"
          />
        </div>
        <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-36 bg-white/[0.03] border-white/10 text-gray-100 text-sm" />
        <span className="text-gray-600 text-sm">to</span>
        <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-36 bg-white/[0.03] border-white/10 text-gray-100 text-sm" />
        <Segmented
          size="sm"
          options={[
            { label: "All", value: "All" as const },
            { label: "Credit", value: "Credit" as const },
            { label: "Debit", value: "Debit" as const },
          ]}
          value={typeFilter}
          onChange={setTypeFilter}
        />
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-2">
          {[0, 1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-12" />)}
        </div>
      )}

      {/* Error */}
      {isError && <ErrorState message="Failed to load transactions" onRetry={() => refetch()} />}

      {/* Empty state */}
      {!isLoading && !isError && filtered.length === 0 && (
        <EmptyState
          icon={ReceiptIcon}
          title="No transactions found"
          description={
            search || typeFilter !== "All"
              ? "Try clearing your search or filters."
              : "Add a transaction to start tracking your cash flow."
          }
          action={
            !search && typeFilter === "All" ? (
              <Button onClick={() => setAddOpen(true)}>
                <PlusIcon size={14} className="mr-1" /> Add first transaction
              </Button>
            ) : undefined
          }
        />
      )}

      {/* Table — desktop */}
      {!isLoading && filtered.length > 0 && (
        <div className="rounded-2xl glass overflow-hidden">
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white/[0.04] border-b border-white/[0.07]">
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs text-gray-500 font-medium">
                    <SortButton field="date" current={sortField} dir={sortDir} onSort={handleSort} />
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs text-gray-500 font-medium">Type</th>
                  <th className="px-4 py-2.5 text-left text-xs text-gray-500 font-medium">
                    <SortButton field="category" current={sortField} dir={sortDir} onSort={handleSort} />
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs text-gray-500 font-medium">Description</th>
                  <th className="px-4 py-2.5 text-right text-xs text-gray-500 font-medium">
                    <SortButton field="amount" current={sortField} dir={sortDir} onSort={handleSort} />
                  </th>
                  <th className="px-4 py-2.5 w-16" />
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {filtered.map((tx) => (
                  <tr key={tx.id} className="hover:bg-white/[0.03] transition-colors">
                    <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">{formatDate(tx.date)}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={`text-xs ${
                        tx.transactionType === "Credit"
                          ? "border-emerald-800 text-emerald-400 bg-emerald-900/20"
                          : "border-rose-800 text-rose-400 bg-rose-900/20"
                      }`}>
                        {tx.transactionType}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-300 text-xs">{tx.category}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs max-w-[200px] truncate">{tx.description || "—"}</td>
                    <td className={`px-4 py-3 text-right font-medium text-sm ${
                      tx.transactionType === "Credit" ? "text-emerald-400" : "text-rose-400"
                    }`}>
                      {tx.transactionType === "Credit" ? "+" : "-"}{formatCurrency(tx.amount)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 justify-end">
                        <button onClick={() => setEditTx(tx)} className="p-1.5 rounded text-gray-600 hover:text-indigo-400 hover:bg-gray-800 transition-colors" title="Edit">
                          <PencilIcon size={13} />
                        </button>
                        <button onClick={() => setDeleteTx(tx)} className="p-1.5 rounded text-gray-600 hover:text-red-400 hover:bg-gray-800 transition-colors" title="Delete">
                          <Trash2Icon size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile stacked cards */}
          <div className="sm:hidden divide-y divide-gray-800/60">
            {filtered.map((tx) => (
              <div key={tx.id} className="px-4 py-3 hover:bg-white/[0.03] flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-sm font-semibold ${tx.transactionType === "Credit" ? "text-emerald-400" : "text-rose-400"}`}>
                      {tx.transactionType === "Credit" ? "+" : "-"}{formatCurrency(tx.amount)}
                    </span>
                    <span className="text-xs text-gray-500">· {tx.category}</span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">{tx.description || "—"}</p>
                  <p className="text-xs text-gray-600 mt-0.5">{formatDate(tx.date)}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => setEditTx(tx)} className="p-2 rounded text-gray-600 hover:text-indigo-400">
                    <PencilIcon size={14} />
                  </button>
                  <button onClick={() => setDeleteTx(tx)} className="p-2 rounded text-gray-600 hover:text-red-400">
                    <Trash2Icon size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="glass-strong max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="text-white">Add Transaction</DialogTitle></DialogHeader>
          <TxForm onSubmit={handleAdd} onCancel={() => setAddOpen(false)} isSubmitting={addTx.isPending} mode="add" />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editTx} onOpenChange={(v) => !v && setEditTx(null)}>
        <DialogContent className="glass-strong max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="text-white">Edit Transaction</DialogTitle></DialogHeader>
          {editTx && (
            <TxForm
              defaultValues={{
                accountId: editTx.accountId,
                date: editTx.date,
                amount: editTx.amount,
                transactionType: editTx.transactionType as "Credit" | "Debit",
                category: editTx.category,
                description: editTx.description,
              }}
              onSubmit={handleEdit}
              onCancel={() => setEditTx(null)}
              isSubmitting={updateTx.isPending}
              mode="edit"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteTx} onOpenChange={(v) => !v && setDeleteTx(null)}>
        <AlertDialogContent className="glass-strong">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete transaction?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              {deleteTx && (
                <>{formatDate(deleteTx.date)} · {deleteTx.category} · {formatCurrency(deleteTx.amount)}<br />This action cannot be undone.</>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-700 hover:bg-red-600 text-white">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
