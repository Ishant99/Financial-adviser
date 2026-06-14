import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import type { CashFlowMonthDto } from "@/types/api";

export function useCashFlow(months = 6) {
  return useQuery<CashFlowMonthDto[]>({
    queryKey: ["cashflow", months],
    queryFn: () =>
      api.get(`/api/cashflow?months=${months}`).then((r) => r.data),
  });
}
