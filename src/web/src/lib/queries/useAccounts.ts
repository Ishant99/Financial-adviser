import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { AccountDto, AddAccountRequest } from "@/types/api";

export function useAccounts() {
  return useQuery<AccountDto[]>({
    queryKey: ["accounts"],
    queryFn: () => api.get("/api/accounts").then((r) => r.data),
  });
}

export function useAddAccount() {
  const qc = useQueryClient();
  return useMutation<AccountDto, Error, AddAccountRequest>({
    mutationFn: (req) => api.post("/api/accounts", req).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["accounts"] }),
  });
}
