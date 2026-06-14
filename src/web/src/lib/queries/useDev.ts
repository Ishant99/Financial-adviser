import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

export function useResetData() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post("/api/dev/reset").then((r) => r.data),
    onSuccess: () => {
      // Invalidate everything so every page re-fetches fresh seed data
      qc.invalidateQueries();
    },
  });
}
