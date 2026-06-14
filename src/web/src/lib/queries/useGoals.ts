import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { AddGoalRequest, GoalDto } from "@/types/api";

export function useGoals() {
  return useQuery<GoalDto[]>({
    queryKey: ["goals"],
    queryFn: () => api.get("/api/goals").then((r) => r.data),
  });
}

export function useGoal(id: string) {
  return useQuery<GoalDto>({
    queryKey: ["goals", id],
    queryFn: () => api.get(`/api/goals/${id}`).then((r) => r.data),
  });
}

export function useAddGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (req: AddGoalRequest) =>
      api.post<GoalDto>("/api/goals", req).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["goals"] }),
  });
}

export function useUpdateGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, req }: { id: string; req: AddGoalRequest }) =>
      api.put<GoalDto>(`/api/goals/${id}`, req).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["goals"] }),
  });
}

export function usePauseGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.patch<GoalDto>(`/api/goals/${id}/pause`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["goals"] }),
  });
}

export function useResumeGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.patch<GoalDto>(`/api/goals/${id}/resume`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["goals"] }),
  });
}

export function useSimulateGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.post<GoalDto>(`/api/goals/${id}/simulate`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["goals"] });
      qc.invalidateQueries({ queryKey: ["networth"] });
    },
  });
}
