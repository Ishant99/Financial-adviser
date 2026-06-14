import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { AddHoldingRequest, HoldingDto, UpdateHoldingRequest } from "@/types/api";

export function useHoldings() {
  return useQuery<HoldingDto[]>({
    queryKey: ["holdings"],
    queryFn: () => api.get("/api/holdings").then((r) => r.data),
  });
}

export function useAddHolding() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (req: AddHoldingRequest) =>
      api.post<HoldingDto>("/api/holdings", req).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["holdings"] });
      qc.invalidateQueries({ queryKey: ["networth"] });
    },
  });
}

export function useUpdateHolding() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, req }: { id: string; req: UpdateHoldingRequest }) =>
      api.put<HoldingDto>(`/api/holdings/${id}`, req).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["holdings"] });
      qc.invalidateQueries({ queryKey: ["networth"] });
    },
  });
}

export function useDeleteHolding() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/holdings/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["holdings"] });
      qc.invalidateQueries({ queryKey: ["networth"] });
    },
  });
}
