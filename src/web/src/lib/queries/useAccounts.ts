import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import type { AccountDto } from "@/types/api";

export function useAccounts() {
  return useQuery<AccountDto[]>({
    queryKey: ["accounts"],
    queryFn: () => api.get("/api/accounts").then((r) => r.data),
  });
}
