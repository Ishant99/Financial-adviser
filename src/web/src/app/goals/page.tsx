"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { PlusIcon, PauseIcon, PlayIcon, TargetIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  useGoals, useAddGoal, useUpdateGoal, usePauseGoal, useResumeGoal, useSimulateGoal,
} from "@/lib/queries/useGoals";
import { formatCurrency, formatDate } from "@/lib/format";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import type { GoalDto } from "@/types/api";

const allocationSchema = z.object({
  equityPercent: z.number().min(0).max(100),
  debtPercent: z.number().min(0).max(100),
  goldPercent: z.number().min(0).max(100),
  cashPercent: z.number().min(0).max(100),
}).refine(
  (d) => Math.abs(d.equityPercent + d.debtPercent + d.goldPercent + d.cashPercent - 100) < 0.01,
  { message: "Allocation must sum to 100%" },
);

const goalSchema = z.object({
  name: z.string().min(1, "Name is required"),
  targetAmount: z.number().positive("Must be > 0"),
  targetDate: z.string().min(1, "Date is required"),
  priority: z.number().int().min(1).max(5),
  targetAssetAllocation: allocationSchema,
});

type GoalValues = z.infer<typeof goalSchema>;

const DEFAULT_ALLOCATION = { equityPercent: 60, debtPercent: 30, goldPercent: 5, cashPercent: 5 };

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-gray-300">{label}</Label>
      {children}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

function GoalForm({
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting,
}: {
  defaultValues?: Partial<GoalValues>;
  onSubmit: (v: GoalValues) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}) {
  const {
    register, handleSubmit,
    formState: { errors },
    watch,
  } = useForm<GoalValues>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      priority: 3,
      targetAssetAllocation: DEFAULT_ALLOCATION,
      ...defaultValues,
    },
  });

  const alloc = watch("targetAssetAllocation");
  const allocSum = alloc
    ? (Number(alloc.equityPercent) || 0) + (Number(alloc.debtPercent) || 0) + (Number(alloc.goldPercent) || 0) + (Number(alloc.cashPercent) || 0)
    : 0;
  const allocError = (errors.targetAssetAllocation as { message?: string } | undefined)?.message;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <Field label="Goal Name" error={errors.name?.message}>
        <Input {...register("name")} placeholder="e.g. Emergency Fund" className="bg-gray-800 border-gray-700 text-gray-100" />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Target Amount (₹)" error={errors.targetAmount?.message}>
          <Input {...register("targetAmount", { valueAsNumber: true })} type="number" className="bg-gray-800 border-gray-700 text-gray-100" />
        </Field>
        <Field label="Target Date" error={errors.targetDate?.message}>
          <Input {...register("targetDate")} type="date" className="bg-gray-800 border-gray-700 text-gray-100" />
        </Field>
      </div>
      <Field label="Priority (1 = highest)" error={errors.priority?.message}>
        <select
          {...register("priority", { valueAsNumber: true })}
          className="h-8 w-full rounded-lg border border-gray-700 bg-gray-800 px-2.5 py-1 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {[1, 2, 3, 4, 5].map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </Field>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-gray-300">Asset Allocation</Label>
          <span className={`text-xs ${Math.abs(allocSum - 100) < 0.01 ? "text-emerald-400" : "text-yellow-400"}`}>
            Sum: {allocSum.toFixed(1)}%
          </span>
        </div>
        {allocError && <p className="text-xs text-red-400">{allocError}</p>}
        <div className="grid grid-cols-2 gap-2">
          {(["equityPercent", "debtPercent", "goldPercent", "cashPercent"] as const).map((field) => (
            <Field key={field} label={field.replace("Percent", " %").replace(/([A-Z])/g, " $1").trim()}>
              <Input
                {...register(`targetAssetAllocation.${field}`, { valueAsNumber: true })}
                type="number"
                step="0.1"
                min="0"
                max="100"
                className="bg-gray-800 border-gray-700 text-gray-100"
              />
            </Field>
          ))}
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting}>Save Goal</Button>
      </DialogFooter>
    </form>
  );
}

const STATUS_STYLES: Record<string, string> = {
  Active: "bg-emerald-900/40 border-emerald-800 text-emerald-400",
  Paused: "bg-yellow-900/40 border-yellow-800 text-yellow-400",
  Completed: "bg-gray-800 border-gray-700 text-gray-400",
};

function GoalCard({ goal }: { goal: GoalDto }) {
  const pause = usePauseGoal();
  const resume = useResumeGoal();
  const simulate = useSimulateGoal();
  const [editOpen, setEditOpen] = useState(false);
  const update = useUpdateGoal();

  const handlePauseResume = async () => {
    try {
      if (goal.status === "Active") {
        await pause.mutateAsync(goal.id);
        toast.success("Goal paused");
      } else if (goal.status === "Paused") {
        await resume.mutateAsync(goal.id);
        toast.success("Goal resumed");
      }
    } catch {
      toast.error("Action failed");
    }
  };

  const handleUpdate = async (values: GoalValues) => {
    try {
      await update.mutateAsync({ id: goal.id, req: values });
      toast.success("Goal updated");
      setEditOpen(false);
    } catch {
      toast.error("Failed to update goal");
    }
  };

  const daysLeft = Math.ceil((new Date(goal.targetDate).getTime() - Date.now()) / 86_400_000);

  return (
    <>
      <Card className="glass-hover">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <CardTitle className="text-base text-white truncate">{goal.name}</CardTitle>
              <p className="text-xs text-gray-500 mt-0.5">
                Priority {goal.priority} · {daysLeft > 0 ? `${daysLeft}d left` : "Overdue"}
              </p>
            </div>
            <Badge variant="outline" className={`shrink-0 text-xs ${STATUS_STYLES[goal.status] ?? ""}`}>
              {goal.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Target</span>
            <span className="text-gray-200 font-medium">{formatCurrency(goal.targetAmount)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Target Date</span>
            <span className="text-gray-300">{formatDate(goal.targetDate)}</span>
          </div>
          {goal.probabilityOfSuccess != null && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Success probability</span>
                <span className={`font-medium ${goal.probabilityOfSuccess >= 70 ? "text-emerald-400" : goal.probabilityOfSuccess >= 40 ? "text-yellow-400" : "text-red-400"}`}>
                  {goal.probabilityOfSuccess.toFixed(0)}%
                </span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full transition-all ${goal.probabilityOfSuccess >= 70 ? "bg-emerald-500" : goal.probabilityOfSuccess >= 40 ? "bg-yellow-500" : "bg-red-500"}`}
                  style={{ width: `${Math.min(goal.probabilityOfSuccess, 100)}%` }}
                />
              </div>
              {goal.p10Corpus != null && (
                <div className="grid grid-cols-3 gap-1 text-xs text-center mt-1">
                  <div className="rounded bg-gray-800 px-1 py-0.5">
                    <p className="text-gray-500">P10</p>
                    <p className="text-gray-300">{formatCurrency(goal.p10Corpus!)}</p>
                  </div>
                  <div className="rounded bg-gray-800 px-1 py-0.5">
                    <p className="text-gray-500">P50</p>
                    <p className="text-gray-300">{formatCurrency(goal.p50Corpus!)}</p>
                  </div>
                  <div className="rounded bg-gray-800 px-1 py-0.5">
                    <p className="text-gray-500">P90</p>
                    <p className="text-gray-300">{formatCurrency(goal.p90Corpus!)}</p>
                  </div>
                </div>
              )}
            </div>
          )}
          {/* P50 corpus vs target — "on track" indicator */}
          {goal.p50Corpus != null && goal.targetAmount > 0 && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Projected (P50)</span>
                <span className={`font-medium ${goal.p50Corpus >= goal.targetAmount ? "text-emerald-400" : "text-yellow-400"}`}>
                  {((goal.p50Corpus / goal.targetAmount) * 100).toFixed(0)}% of target
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-gray-800 overflow-hidden">
                <div
                  className={`h-full rounded-full ${goal.p50Corpus >= goal.targetAmount ? "bg-emerald-500" : "bg-yellow-500"}`}
                  style={{ width: `${Math.min((goal.p50Corpus / goal.targetAmount) * 100, 100)}%` }}
                />
              </div>
            </div>
          )}

          <div className="text-xs text-gray-500">
            Equity {goal.targetAssetAllocation.equityPercent}% · Debt {goal.targetAssetAllocation.debtPercent}% · Gold {goal.targetAssetAllocation.goldPercent}% · Cash {goal.targetAssetAllocation.cashPercent}%
          </div>
          <div className="flex gap-2 pt-1 flex-wrap">
            <Button size="sm" variant="outline" onClick={() => setEditOpen(true)} className="flex-1">
              Edit
            </Button>
            {goal.status !== "Completed" && (
              <Button size="sm" variant="outline" onClick={handlePauseResume} className="flex-1">
                {goal.status === "Active" ? <><PauseIcon className="mr-1" />Pause</> : <><PlayIcon className="mr-1" />Resume</>}
              </Button>
            )}
            {goal.status === "Active" && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => { simulate.mutate(goal.id, { onError: () => toast.error("Simulation failed") }); }}
                disabled={simulate.isPending}
                className="flex-1"
              >
                {simulate.isPending ? "…" : "Simulate"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="glass-strong max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Goal</DialogTitle>
          </DialogHeader>
          <GoalForm
            defaultValues={{
              name: goal.name,
              targetAmount: goal.targetAmount,
              targetDate: goal.targetDate,
              priority: goal.priority,
              targetAssetAllocation: goal.targetAssetAllocation,
            }}
            onSubmit={handleUpdate}
            onCancel={() => setEditOpen(false)}
            isSubmitting={update.isPending}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function GoalsPage() {
  const { data: goals, isLoading, isError } = useGoals();
  const addGoal = useAddGoal();
  const [addOpen, setAddOpen] = useState(false);

  const handleAdd = async (values: GoalValues) => {
    try {
      await addGoal.mutateAsync(values);
      toast.success("Goal created");
      setAddOpen(false);
    } catch {
      toast.error("Failed to create goal");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Goals"
        title="Your Financial Milestones"
        description="Set targets — retirement, a home, education — and track your probability of reaching each."
        actions={
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <PlusIcon size={14} className="mr-1" /> Add Goal
          </Button>
        }
      />

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-48" />)}
        </div>
      )}
      {isError && <ErrorState message="Failed to load goals" />}
      {goals && goals.length === 0 && (
        <EmptyState
          icon={TargetIcon}
          title="No goals yet"
          description="Set financial milestones — retirement, a home, education — and track your probability of reaching them."
          action={
            <Button onClick={() => setAddOpen(true)}>
              <PlusIcon size={14} className="mr-1" /> Add first goal
            </Button>
          }
        />
      )}
      {goals && goals.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
          {goals.map((g) => <GoalCard key={g.id} goal={g} />)}
        </div>
      )}

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="glass-strong max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Add Goal</DialogTitle>
          </DialogHeader>
          <GoalForm
            onSubmit={handleAdd}
            onCancel={() => setAddOpen(false)}
            isSubmitting={addGoal.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
