import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { BankStatementImportResult, CasImportResult, CasUploadLogDto, HoldingsImportResult, SipBulkImportResult } from "@/types/api";

export function useUploadSips() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (form: FormData) =>
      api.post<SipBulkImportResult>("/api/upload/sips", form, {
        headers: { "Content-Type": "multipart/form-data" },
      }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sip-plans"] });
    },
  });
}

export function useUploadBrokerHoldings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (form: FormData) =>
      api.post<HoldingsImportResult>("/api/upload/broker-holdings", form, {
        headers: { "Content-Type": "multipart/form-data" },
      }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["holdings"] });
      qc.invalidateQueries({ queryKey: ["networth"] });
    },
  });
}

export function useUploadBankStatement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (form: FormData) =>
      api.post<BankStatementImportResult>("/api/upload/bank-statement", form, {
        headers: { "Content-Type": "multipart/form-data" },
      }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}

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
