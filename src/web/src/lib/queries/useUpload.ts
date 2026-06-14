import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { CasImportResult, CasUploadLogDto } from "@/types/api";

export function useUploadHistory() {
  return useQuery<CasUploadLogDto[]>({
    queryKey: ["upload-history"],
    queryFn: () => api.get("/api/upload/history").then((r) => r.data),
  });
}

export function useUploadCas() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (form: FormData) =>
      api.post<CasImportResult>("/api/upload/cas", form, {
        headers: { "Content-Type": "multipart/form-data" },
      }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["holdings"] });
      qc.invalidateQueries({ queryKey: ["networth"] });
      qc.invalidateQueries({ queryKey: ["upload-history"] });
    },
  });
}
