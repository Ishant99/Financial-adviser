import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import type { PortfolioAnalyticsDto } from "@/types/api";

export function usePortfolioAnalytics() {
  return useQuery<PortfolioAnalyticsDto>({
    queryKey: ["portfolio-analytics"],
    queryFn: () => api.get("/api/analytics").then((r) => r.data),
  });
}
