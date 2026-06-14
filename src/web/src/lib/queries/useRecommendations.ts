import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { RecommendationDto } from "@/types/api";

export function useRecommendations(limit = 10) {
  return useQuery<RecommendationDto[]>({
    queryKey: ["recommendations", limit],
    queryFn: () => api.get(`/api/recommendations?limit=${limit}`).then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });
}

export function useGenerateRecommendations() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      api.post<RecommendationDto[]>("/api/recommendations/generate").then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["recommendations"] });
    },
  });
}

export function useMarkRecommendationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.patch(`/api/recommendations/${id}/read`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["recommendations"] });
    },
  });
}
