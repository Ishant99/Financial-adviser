"use client";

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { PlusIcon, PencilIcon, Trash2Icon, SearchIcon, ArrowUpDownIcon, DownloadIcon, LayersIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  useHoldings, useAddHolding, useUpdateHolding, useDeleteHolding,
} from "@/lib/queries/useHoldings";
import { useAccounts } from "@/lib/queries/useAccounts";
import { formatCurrency, formatPercent, formatDate } from "@/lib/format";
import { PageHeader } from "@/components/ui/page-header";
import { Segmented } from "@/components/ui/segmented";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import type { HoldingDto } from "@/types/api";

const HOLDING_TYPES = ["MutualFund", "Stock", "FD", "Gold", "RealEstate", "Cash", "Crypto"] as const;

const addSchema = z.object({
  accountId: z.string().min(1, "Account is required"),
  holdingType: z.string().min(1, "Type is required"),
  name: z.string().min(1, "Name is required"),
  units: z.number().positive("Must be > 0"),
  purchaseNav: z.number().min(0, "Must be ≥ 0"),
  currentNav: z.number().min(0, "Must be ≥ 0"),
  asOf: z.string().min(1, "Date is required"),
});

const editSchema = z.object({
  name: z.string().min(1, "Name is required"),
  units: z.number().positive("Must be > 0"),
  purchaseNav: z.number().min(0, "Must be ≥ 0"),
  currentNav: z.number().min(0, "Must be ≥ 0"),
  asOf: z.string().min(1, "Date is required"),
});

type AddValues = z.infer<typeof addSchema>;
type EditValues = z.infer<typeof editSchema>;

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-gray-300">{label}</Label>
      {children}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

function NativeSelect({ className, ...props }: React.ComponentProps<"select">) {
  return (
    <select
      className={`h-8 w-full rounded-lg border border-gray-700 bg-gray-800 px-2.5 py-1 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 ${className ?? ""}`}
      {...props}
    />
  );
}

function AddDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { data: accounts = [] } = useAccounts();
  const addHolding = useAddHolding();
  const {
    register, handleSubmit, reset,
    formState: { errors, isSubmitting },
  } = useForm<AddValues>({ resolver: zodResolver(addSchema) });

  const onSubmit = async (values: AddValues) => {
    try {
      await addHolding.mutateAsync(values);
      toast.success("Holding added");
      reset();
      onOpenChange(false);
    } catch {
      toast.error("Failed to add holding");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-strong max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">Add Holding</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <Field label="Account" error={errors.accountId?.message}>
            <NativeSelect {...register("accountId")}>
              <option value="">Select account</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </NativeSelect>
          </Field>
          <Field label="Type" error={errors.holdingType?.message}>
            <NativeSelect {...register("holdingType")}>
              <option value="">Select type</option>
              {HOLDING_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Name" error={errors.name?.message}>
            <Input {...register("name")} placeholder="e.g. Mirae Asset Large Cap" className="bg-gray-800 border-gray-700 text-gray-100" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Units" error={errors.units?.message}>
              <Input {...register("units", { valueAsNumber: true })} type="number" step="0.001" className="bg-gray-800 border-gray-700 text-gray-100" />
            </Field>
            <Field label="As Of" error={errors.asOf?.message}>
              <Input {...register("asOf")} type="date" className="bg-gray-800 border-gray-700 text-gray-100" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Purchase NAV (₹)" error={errors.purchaseNav?.message}>
              <Input {...register("purchaseNav", { valueAsNumber: true })} type="number" step="0.01" className="bg-gray-800 border-gray-700 text-gray-100" />
            </Field>
            <Field label="Current NAV (₹)" error={errors.currentNav?.message}>
              <Input {...register("currentNav", { valueAsNumber: true })} type="number" step="0.01" className="bg-gray-800 border-gray-700 text-gray-100" />
            </Field>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>Add Holding</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditDialog({
  holding, open, onOpenChange,
}: { holding: HoldingDto | null; open: boolean; onOpenChange: (v: boolean) => void }) {
  const updateHolding = useUpdateHolding();
  const {
    register, handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EditValues>({
    resolver: zodResolver(editSchema),
    values: holding
      ? { name: holding.name, units: holding.units, purchaseNav: holding.purchaseNav, currentNav: holding.currentNav, asOf: holding.asOf.split("T")[0] }
      : undefined,
  });

  const onSubmit = async (values: EditValues) => {
    if (!holding) return;
    try {
      await updateHolding.mutateAsync({ id: holding.id, req: values });
      toast.success("Holding updated");
      onOpenChange(false);
    } catch {
      toast.error("Failed to update holding");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-strong max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">Edit Holding</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <Field label="Name" error={errors.name?.message}>
            <Input {...register("name")} className="bg-gray-800 border-gray-700 text-gray-100" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Units" error={errors.units?.message}>
              <Input {...register("units", { valueAsNumber: true })} type="number" step="0.001" className="bg-gray-800 border-gray-700 text-gray-100" />
            </Field>
            <Field label="As Of" error={errors.asOf?.message}>
              <Input {...register("asOf")} type="date" className="bg-gray-800 border-gray-700 text-gray-100" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Purchase NAV (₹)" error={errors.purchaseNav?.message}>
              <Input {...register("purchaseNav", { valueAsNumber: true })} type="number" step="0.01" className="bg-gray-800 border-gray-700 text-gray-100" />
            </Field>
            <Field label="Current NAV (₹)" error={errors.currentNav?.message}>
              <Input {...register("currentNav", { valueAsNumber: true })} type="number" step="0.01" className="bg-gray-800 border-gray-700 text-gray-100" />
            </Field>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

type SortField = "name" | "currentValue" | "gainLossPercent";
type SortDir = "asc" | "desc";

function SortTh({ label, field, current, dir, onSort }: {
  label: string; field: SortField; current: SortField; dir: SortDir; onSort: (f: SortField) => void;
}) {
  return (
    <th className="px-4 py-2.5 text-xs text-gray-500 font-medium text-right">
      <button onClick={() => onSort(field)} className="inline-flex items-center gap-0.5 hover:text-white transition-colors">
        {label}
        <ArrowUpDownIcon size={12} className={current === field ? "text-indigo-400" : "text-gray-600"} />
      </button>
    </th>
  );
}

function exportCsv(holdings: HoldingDto[]) {
  const header = "Name,Type,Units,PurchaseNAV,CurrentNAV,CurrentValue,GainLoss%,AsOf";
  const rows = holdings.map((h) =>
    [h.name, h.holdingType, h.units, h.purchaseNav, h.currentNav, h.currentValue, h.gainLossPercent.toFixed(2), h.asOf].join(",")
  );
  const blob = new Blob([header + "\n" + rows.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `holdings_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function HoldingsPage() {
  const { data: holdings, isLoading, isError, refetch } = useHoldings();
  const deleteHolding = useDeleteHolding();
  const [addOpen, setAddOpen] = useState(false);
  const [editHolding, setEditHolding] = useState<HoldingDto | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [sortField, setSortField] = useState<SortField>("currentValue");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("desc"); }
  };

  const filtered = useMemo(() => {
    if (!holdings) return [];
    return holdings
      .filter((h) => {
        if (typeFilter !== "All" && h.holdingType !== typeFilter) return false;
        if (search.trim()) return h.name.toLowerCase().includes(search.toLowerCase());
        return true;
      })
      .sort((a, b) => {
        let cmp = 0;
        if (sortField === "name") cmp = a.name.localeCompare(b.name);
        else if (sortField === "currentValue") cmp = a.currentValue - b.currentValue;
        else if (sortField === "gainLossPercent") cmp = a.gainLossPercent - b.gainLossPercent;
        return sortDir === "asc" ? cmp : -cmp;
      });
  }, [holdings, search, typeFilter, sortField, sortDir]);

  const uniqueTypes = [...new Set(holdings?.map((h) => h.holdingType) ?? [])].sort();
  const totalValue = filtered.reduce((s, h) => s + h.currentValue, 0);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteHolding.mutateAsync(deleteId);
      toast.success("Holding deleted");
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Holdings"
        title="Your Investment Positions"
        description={
          filtered.length > 0
            ? `${filtered.length} position${filtered.length !== 1 ? "s" : ""} · ${formatCurrency(totalValue)} total value.`
            : "All your investment positions in one place."
        }
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => filtered.length && exportCsv(filtered)}>
              <DownloadIcon size={14} className="mr-1" /> CSV
            </Button>
            <Button size="sm" onClick={() => setAddOpen(true)}>
              <PlusIcon size={14} className="mr-1" /> Add Holding
            </Button>
          </>
        }
      />

      {/* Filters */}
      <div className="flex gap-2 flex-wrap items-center">
        <div className="relative flex-1 min-w-[180px]">
          <SearchIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name…"
            className="pl-8 bg-white/[0.03] border-white/10 text-gray-100 text-sm"
          />
        </div>
        <Segmented
          size="sm"
          options={["All", ...uniqueTypes].map((t) => ({ label: t, value: t }))}
          value={typeFilter}
          onChange={setTypeFilter}
        />
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-2">
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-12" />)}
        </div>
      )}

      {/* Error */}
      {isError && <ErrorState message="Failed to load holdings" onRetry={() => refetch()} />}

      {/* Empty state */}
      {!isLoading && !isError && filtered.length === 0 && (
        <EmptyState
          icon={LayersIcon}
          title="No holdings found"
          description={
            search || typeFilter !== "All"
              ? "Try clearing your search or filter."
              : "Add a holding or import a CAS statement to track your portfolio."
          }
          action={
            !search && typeFilter === "All" ? (
              <Button onClick={() => setAddOpen(true)}>
                <PlusIcon size={14} className="mr-1" /> Add first holding
              </Button>
            ) : undefined
          }
        />
      )}

      {/* Table */}
      {!isLoading && filtered.length > 0 && (
        <div className="rounded-2xl glass overflow-hidden">
          {/* Desktop */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white/[0.04] border-b border-white/[0.07]">
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs text-gray-500 font-medium">
                    <button onClick={() => handleSort("name")} className="inline-flex items-center gap-0.5 hover:text-white transition-colors">
                      Name <ArrowUpDownIcon size={12} className={sortField === "name" ? "text-indigo-400" : "text-gray-600"} />
                    </button>
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs text-gray-500 font-medium">Type</th>
                  <th className="px-4 py-2.5 text-right text-xs text-gray-500 font-medium">Units</th>
                  <SortTh label="Value" field="currentValue" current={sortField} dir={sortDir} onSort={handleSort} />
                  <SortTh label="Return" field="gainLossPercent" current={sortField} dir={sortDir} onSort={handleSort} />
                  <th className="px-4 py-2.5 text-right text-xs text-gray-500 font-medium">As Of</th>
                  <th className="px-4 py-2.5 w-16" />
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {filtered.map((h) => (
                  <tr key={h.id} className="hover:bg-white/[0.03] transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-200 max-w-[200px] truncate">{h.name}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="bg-gray-800 border-gray-700 text-gray-400 text-xs">{h.holdingType}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-400 text-xs">{h.units.toFixed(3)}</td>
                    <td className="px-4 py-3 text-right text-gray-200 font-medium">{formatCurrency(h.currentValue)}</td>
                    <td className={`px-4 py-3 text-right font-medium ${h.gainLossPercent >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {formatPercent(h.gainLossPercent)}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-400 text-xs">{formatDate(h.asOf)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 justify-end">
                        <button onClick={() => setEditHolding(h)} className="p-1.5 rounded text-gray-600 hover:text-indigo-400 hover:bg-gray-800" title="Edit">
                          <PencilIcon size={13} />
                        </button>
                        <button onClick={() => setDeleteId(h.id)} className="p-1.5 rounded text-gray-600 hover:text-red-400 hover:bg-gray-800" title="Delete">
                          <Trash2Icon size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile stacked */}
          <div className="sm:hidden divide-y divide-white/[0.06]">
            {filtered.map((h) => (
              <div key={h.id} className="px-4 py-3 hover:bg-white/[0.03] flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-gray-200 truncate">{h.name}</p>
                    <span className="text-sm font-semibold text-gray-200 shrink-0">{formatCurrency(h.currentValue)}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-500">{h.holdingType}</span>
                    <span className={`text-xs font-medium ${h.gainLossPercent >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {formatPercent(h.gainLossPercent)}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => setEditHolding(h)} className="p-2 rounded text-gray-600 hover:text-indigo-400">
                    <PencilIcon size={14} />
                  </button>
                  <button onClick={() => setDeleteId(h.id)} className="p-2 rounded text-gray-600 hover:text-red-400">
                    <Trash2Icon size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <AddDialog open={addOpen} onOpenChange={setAddOpen} />
      <EditDialog holding={editHolding} open={!!editHolding} onOpenChange={(v) => { if (!v) setEditHolding(null); }} />

      <AlertDialog open={!!deleteId} onOpenChange={(v) => { if (!v) setDeleteId(null); }}>
        <AlertDialogContent className="glass-strong">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete holding?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
