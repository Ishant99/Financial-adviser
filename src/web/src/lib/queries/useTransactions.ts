import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { AddTransactionRequest, TransactionDto, UpdateTransactionRequest } from "@/types/api";

export function useTransactions(accountId?: string, from?: string, to?: string) {
  const params = new URLSearchParams();
  if (accountId) params.set("accountId", accountId);
  if (from) params.set("from", from);
  if (to) params.set("to", to);

  return useQuery<TransactionDto[]>({
    queryKey: ["transactions", accountId, from, to],
    queryFn: () =>
      api.get(`/api/transactions?${params.toString()}`).then((r) => r.data),
  });
}

export function useAddTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (req: AddTransactionRequest) =>
      api.post<TransactionDto>("/api/transactions", req).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["transactions"] }),
  });
}

export function useUpdateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, req }: { id: string; req: UpdateTransactionRequest }) =>
      api.patch<TransactionDto>(`/api/transactions/${id}`, req).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["transactions"] }),
  });
}

export function useDeleteTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/transactions/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["transactions"] }),
  });
}
