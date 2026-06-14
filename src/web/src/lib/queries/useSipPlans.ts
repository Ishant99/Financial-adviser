import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { AddSipPlanRequest, SipPlanDto } from "@/types/api";

export function useSipPlans() {
  return useQuery<SipPlanDto[]>({
    queryKey: ["sipplans"],
    queryFn: () => api.get("/api/sipplans").then((r) => r.data),
  });
}

export function useAddSipPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (req: AddSipPlanRequest) =>
      api.post<SipPlanDto>("/api/sipplans", req).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sipplans"] }),
  });
}

export function usePauseSipPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.patch<SipPlanDto>(`/api/sipplans/${id}/pause`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sipplans"] }),
  });
}

export function useResumeSipPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.patch<SipPlanDto>(`/api/sipplans/${id}/resume`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sipplans"] }),
  });
}

export function useComputeXirr() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.post<SipPlanDto>(`/api/sipplans/${id}/compute-xirr`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sipplans"] }),
  });
}
