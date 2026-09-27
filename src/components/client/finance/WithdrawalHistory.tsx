"use client";

import { useEffect, useState } from "react";
import EmptyState from "@/components/shared/EmptyState";
import ErrorState from "@/components/shared/ErrorState";
import LoadingState from "@/components/shared/LoadingState";
import Pagination from "@/components/shared/Pagination";
import { normalizeApiError } from "@/lib/api-error";
import { formatCurrency, formatDateTime, getStatusLabel } from "@/lib/format";
import { financeService } from "@/services/client/financeService";
import type { PaginatedResponse } from "@/types/api";
import type { Withdrawal } from "@/types/finance";

const maskAccount = (value: string) => value.length <= 4 ? value : `${"•".repeat(Math.min(8, value.length - 4))}${value.slice(-4)}`;

export default function WithdrawalHistory() {
  const [page, setPage] = useState(1);
  const [response, setResponse] = useState<PaginatedResponse<Withdrawal> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    Promise.resolve()
      .then(() => {
        setIsLoading(true);
        setError(null);
        return financeService.getWithdrawals({ page, per_page: 10 }, controller.signal);
      })
      .then(setResponse)
      .catch((request) => {
        if (!controller.signal.aborted) setError(normalizeApiError(request).message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    return () => controller.abort();
  }, [page, reloadKey]);

  return (
    <section className="overflow-hidden rounded-lg border border-gray-border bg-white shadow-[0_2px_12px_rgba(0,0,0,.04)]">
      <header className="border-b border-gray-border p-5 md:p-6"><h1 className="text-xl font-extrabold text-blue-nav">Lịch sử rút tiền</h1><p className="mt-1 text-sm text-text-muted">Theo dõi trạng thái các yêu cầu chuyển tiền về ngân hàng.</p></header>
      {isLoading ? <LoadingState label="Đang tải lệnh rút tiền..." /> : error ? <ErrorState message={error} onRetry={() => setReloadKey((key) => key + 1)} /> : !response?.data.length ? <EmptyState title="Chưa có lệnh rút tiền" description="Các yêu cầu rút tiền sẽ xuất hiện tại đây." /> : <>
        <div className="divide-y divide-gray-border">
          {response.data.map((withdrawal) => <article key={withdrawal.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between md:p-5"><div><div className="flex items-center gap-2"><strong className="text-blue-nav">Lệnh #{withdrawal.id}</strong><span className={`rounded px-2 py-1 text-xs font-semibold ${withdrawal.status === "completed" ? "bg-green-50 text-green-700" : withdrawal.status === "rejected" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-800"}`}>{getStatusLabel(withdrawal.status)}</span></div><p className="mt-1 text-sm text-[#475569]">{withdrawal.bank_name} · {maskAccount(withdrawal.account_number)} · {withdrawal.account_name}</p><p className="mt-1 text-xs text-text-muted">{formatDateTime(withdrawal.created_at)}</p>{withdrawal.admin_note && <p className="mt-2 text-xs text-red-600">Ghi chú: {withdrawal.admin_note}</p>}</div><strong className="text-lg text-orange-main">{formatCurrency(withdrawal.amount)}</strong></article>)}
        </div>
        <div className="border-t border-gray-border p-4"><Pagination currentPage={response.meta.current_page} lastPage={response.meta.last_page} onPageChange={setPage} /></div>
      </>}
    </section>
  );
}
