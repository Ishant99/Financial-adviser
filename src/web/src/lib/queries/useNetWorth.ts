import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import type { NetWorthDto, NetWorthHistoryPointDto } from "@/types/api";

export function useNetWorth() {
  return useQuery<NetWorthDto>({
    queryKey: ["networth"],
    queryFn: () => api.get("/api/networth").then((r) => r.data),
    refetchInterval: 60_000,
  });
}

export function useNetWorthHistory(months = 12) {
  return useQuery<NetWorthHistoryPointDto[]>({
    queryKey: ["networth", "history", months],
    queryFn: () => api.get(`/api/networth/history?months=${months}`).then((r) => r.data),
  });
}
