import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { MonthlyPlanResponse } from "@/types/api";

export function useGenerateMonthlyPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      api.post<MonthlyPlanResponse>("/api/plan/generate").then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["plan"] });
    },
  });
}
