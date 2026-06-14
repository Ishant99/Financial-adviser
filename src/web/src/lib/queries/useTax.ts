import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import type { TaxSummaryDto } from "@/types/api";

export function useTaxSummary() {
  return useQuery<TaxSummaryDto>({
    queryKey: ["tax"],
    queryFn: () => api.get("/api/tax").then((r) => r.data),
  });
}
