"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { PlusIcon, PauseIcon, PlayIcon, TrendingUpIcon, TrendingDownIcon, MinusIcon, WalletIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  useSipPlans, useAddSipPlan, usePauseSipPlan, useResumeSipPlan, useComputeXirr,
} from "@/lib/queries/useSipPlans";
import { useGoals } from "@/lib/queries/useGoals";
import { formatCurrency, formatDate, formatPercent } from "@/lib/format";
import { FinTooltip } from "@/components/FinTooltip";
import { PageHeader } from "@/components/ui/page-header";
import { ErrorState } from "@/components/ui/error-state";

// XIRR health thresholds vs typical Nifty 500 long-run average (~12%)
const BENCHMARK_XIRR = 0.12;

function XirrHealthBadge({ xirr, benchmarkXirr }: { xirr: number | undefined | null; benchmarkXirr?: number | null }) {
  if (xirr == null) return <span className="text-gray-600 text-xs">—</span>;

  const threshold = benchmarkXirr ?? BENCHMARK_XIRR;
  const pct = xirr * 100;
  if (xirr >= threshold * 0.9) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
        <TrendingUpIcon size={11} /> Good
      </span>
    );
  }
  if (xirr >= threshold * 0.6) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-yellow-400">
        <MinusIcon size={11} /> Review
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs text-rose-400">
      <TrendingDownIcon size={11} /> Under
    </span>
  );
}


const addSchema = z.object({
  fundName: z.string().min(1, "Fund name is required"),
  fundCode: z.string().min(1, "Fund code is required"),
  monthlyAmount: z.number().positive("Must be > 0"),
  sipDate: z.number().int().min(1).max(28, "Must be 1–28"),
  startDate: z.string().min(1, "Start date is required"),
  benchmarkIndex: z.string().min(1, "Benchmark is required"),
  linkedGoalId: z.string().optional(),
});

type AddValues = z.infer<typeof addSchema>;

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-gray-300">{label}</Label>
      {children}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

function AddDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { data: goals = [] } = useGoals();
  const addSip = useAddSipPlan();
  const {
    register, handleSubmit, reset,
    formState: { errors, isSubmitting },
  } = useForm<AddValues>({ resolver: zodResolver(addSchema) });

  const onSubmit = async (values: AddValues) => {
    try {
      await addSip.mutateAsync({
        ...values,
        linkedGoalId: values.linkedGoalId || undefined,
      });
      toast.success("SIP plan created");
      reset();
      onOpenChange(false);
    } catch {
      toast.error("Failed to create SIP");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-strong max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">Add SIP Plan</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <Field label="Fund Name" error={errors.fundName?.message}>
            <Input {...register("fundName")} placeholder="e.g. Mirae Asset Large Cap" className="bg-gray-800 border-gray-700 text-gray-100" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Fund Code (AMFI)" error={errors.fundCode?.message}>
              <Input {...register("fundCode")} placeholder="e.g. 118989" className="bg-gray-800 border-gray-700 text-gray-100" />
            </Field>
            <Field label="Benchmark Index" error={errors.benchmarkIndex?.message}>
              <Input {...register("benchmarkIndex")} placeholder="e.g. Nifty 500" className="bg-gray-800 border-gray-700 text-gray-100" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Monthly Amount (₹)" error={errors.monthlyAmount?.message}>
              <Input {...register("monthlyAmount", { valueAsNumber: true })} type="number" className="bg-gray-800 border-gray-700 text-gray-100" />
            </Field>
            <Field label="SIP Date (1–28)" error={errors.sipDate?.message}>
              <Input {...register("sipDate", { valueAsNumber: true })} type="number" min={1} max={28} className="bg-gray-800 border-gray-700 text-gray-100" />
            </Field>
          </div>
          <Field label="Start Date" error={errors.startDate?.message}>
            <Input {...register("startDate")} type="date" className="bg-gray-800 border-gray-700 text-gray-100" />
          </Field>
          <Field label="Linked Goal (optional)" error={errors.linkedGoalId?.message}>
            <select
              {...register("linkedGoalId")}
              className="h-8 w-full rounded-lg border border-gray-700 bg-gray-800 px-2.5 py-1 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">None</option>
              {goals.filter((g) => g.status === "Active").map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </Field>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>Create SIP</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

const STATUS_STYLES: Record<string, string> = {
  Active: "bg-emerald-900/40 border-emerald-800 text-emerald-400",
  Paused: "bg-yellow-900/40 border-yellow-800 text-yellow-400",
  Stopped: "bg-gray-800 border-gray-700 text-gray-400",
};

export default function SipsPage() {
  const { data: sips, isLoading, isError, refetch } = useSipPlans();
  const pauseSip = usePauseSipPlan();
  const resumeSip = useResumeSipPlan();
  const computeXirr = useComputeXirr();
  const [addOpen, setAddOpen] = useState(false);

  const handlePauseResume = async (id: string, status: string) => {
    try {
      if (status === "Active") {
        await pauseSip.mutateAsync(id);
        toast.success("SIP paused");
      } else if (status === "Paused") {
        await resumeSip.mutateAsync(id);
        toast.success("SIP resumed");
      }
    } catch {
      toast.error("Action failed");
    }
  };

  const totalMonthly = sips?.filter((s) => s.status === "Active").reduce((sum, s) => sum + s.monthlyAmount, 0) ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="SIP Plans"
        title="Systematic Investments"
        description={`Active monthly commitment: ${formatCurrency(totalMonthly)}.`}
        actions={
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <PlusIcon size={14} className="mr-1" /> Add SIP
          </Button>
        }
      />

      {isError && <ErrorState message="Failed to load SIP plans" onRetry={() => refetch()} />}

      <Card className="glass-hover">
        <CardContent className="p-0">
          {isLoading && (
            <div className="p-4 space-y-2">
              {[0, 1, 2].map((i) => <Skeleton key={i} className="h-12" />)}
            </div>
          )}
          {sips && (
            <Table>
              <TableHeader>
                <TableRow className="border-gray-800">
                  <TableHead className="text-gray-400">Fund</TableHead>
                  <TableHead className="text-gray-400 text-right">Monthly</TableHead>
                  <TableHead className="text-gray-400">SIP Date</TableHead>
                  <TableHead className="text-gray-400">Start</TableHead>
                  <TableHead className="text-gray-400">Status</TableHead>
                  <TableHead className="text-gray-400 text-right">
                    <FinTooltip term="XIRR" />
                  </TableHead>
                  <TableHead className="text-gray-400 text-right">Health</TableHead>
                  <TableHead className="text-gray-400">Goal</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {sips.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="py-16">
                      <div className="flex flex-col items-center text-center">
                        <WalletIcon size={36} className="text-gray-700 mb-3" />
                        <p className="text-gray-400 text-sm font-medium">No SIP plans yet</p>
                        <p className="text-gray-600 text-xs mt-1">Create a SIP plan to track your monthly mutual fund investments</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
                {sips.map((sip) => (
                  <TableRow key={sip.id} className="border-gray-800">
                    <TableCell>
                      <p className="font-medium text-gray-200 max-w-[180px] truncate">{sip.fundName}</p>
                      <p className="text-xs text-gray-500">{sip.fundCode} · {sip.benchmarkIndex}</p>
                    </TableCell>
                    <TableCell className="text-right text-gray-200 font-medium">
                      {formatCurrency(sip.monthlyAmount)}
                    </TableCell>
                    <TableCell className="text-gray-400">{sip.sipDate}</TableCell>
                    <TableCell className="text-gray-400">{formatDate(sip.startDate)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-xs ${STATUS_STYLES[sip.status] ?? ""}`}>
                        {sip.status}
                      </Badge>
                    </TableCell>
                    <TableCell className={`text-right font-medium ${sip.latestXirr != null ? (sip.latestXirr >= 0 ? "text-emerald-400" : "text-red-400") : "text-gray-500"}`}>
                      {sip.latestXirr != null ? formatPercent(sip.latestXirr * 100) : "—"}
                      {sip.benchmarkXirr != null && (
                        <span className="ml-1 text-xs text-gray-500">
                          vs {formatPercent(sip.benchmarkXirr * 100)} idx
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <XirrHealthBadge xirr={sip.latestXirr} benchmarkXirr={sip.benchmarkXirr} />
                    </TableCell>
                    <TableCell className="text-gray-400 max-w-[120px] truncate">
                      {sip.linkedGoalName ?? "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {sip.status !== "Stopped" && (
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            onClick={() => handlePauseResume(sip.id, sip.status)}
                            title={sip.status === "Active" ? "Pause" : "Resume"}
                          >
                            {sip.status === "Active" ? <PauseIcon /> : <PlayIcon />}
                          </Button>
                        )}
                        {sip.status === "Active" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-xs text-gray-500 hover:text-gray-300"
                            disabled={computeXirr.isPending}
                            onClick={() => computeXirr.mutate(sip.id, { onError: () => toast.error("XIRR failed") })}
                          >
                            {computeXirr.isPending ? "…" : "XIRR"}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AddDialog open={addOpen} onOpenChange={setAddOpen} />
    </div>
  );
}
