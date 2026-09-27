"use client";

import axios from "axios";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import ErrorState from "@/components/shared/ErrorState";
import LoadingState from "@/components/shared/LoadingState";
import Pagination from "@/components/shared/Pagination";
import { useDialogAccessibility } from "@/hooks/useDialogAccessibility";
import { normalizeApiError } from "@/lib/api-error";
import { formatDateTime } from "@/lib/format";
import { formatMoney, toMoneyString } from "@/lib/money";
import { adminService } from "@/services/admin/adminService";
import type { AdminUserWalletHistory, WalletTransactionType } from "@/types/finance";
import type { User } from "@/types/identity";

const transactionLabels: Record<WalletTransactionType, string> = {
  deposit: "Nạp tiền",
  payment: "Thanh toán",
  refund: "Hoàn tiền",
  withdraw_pending: "Chờ rút tiền",
  withdraw: "Rút tiền",
  refund_withdraw: "Hoàn yêu cầu rút",
  admin_credit: "Admin cộng",
  admin_debit: "Admin trừ",
};

const creditTypes = new Set<WalletTransactionType>([
  "deposit",
  "refund",
  "refund_withdraw",
  "admin_credit",
]);

const transactionOptions = Object.entries(transactionLabels) as [WalletTransactionType, string][];

interface AdminUserWalletDialogProps {
  user: User;
  canAdjust: boolean;
  onClose: () => void;
}

export default function AdminUserWalletDialog({
  user,
  canAdjust,
  onClose,
}: AdminUserWalletDialogProps) {
  const [response, setResponse] = useState<AdminUserWalletHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [type, setType] = useState<WalletTransactionType | "">("");
  const [direction, setDirection] = useState<"credit" | "debit">("credit");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [localError, setLocalError] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [idempotencyKey, setIdempotencyKey] = useState("");
  const dialogRef = useDialogAccessibility(true, onClose, !busy);

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError("");
    try {
      const next = await adminService.getUserWalletTransactions(
        user.id,
        { page, per_page: 10, ...(type ? { type } : {}) },
        signal,
      );
      setResponse(next);
    } catch (requestError) {
      if (!axios.isCancel(requestError)) setError(normalizeApiError(requestError).message);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [page, type, user.id]);

  useEffect(() => {
    const controller = new AbortController();
    Promise.resolve().then(() => load(controller.signal));
    return () => controller.abort();
  }, [load]);

  const normalizedAmount = useMemo(() => {
    try {
      return toMoneyString(amount || 0);
    } catch {
      return "0.00";
    }
  }, [amount]);

  const beginConfirmation = (event: FormEvent) => {
    event.preventDefault();
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setLocalError("Số tiền phải lớn hơn 0.");
      return;
    }
    if (!note.trim()) {
      setLocalError("Vui lòng nhập lý do điều chỉnh.");
      return;
    }
    setLocalError("");
    setConfirming(true);
    if (!idempotencyKey) setIdempotencyKey(crypto.randomUUID());
  };

  const adjustBalance = async () => {
    if (busy || !idempotencyKey) return;
    setBusy(true);
    try {
      const result = await adminService.adjustUserWallet(user.id, {
        direction,
        amount: normalizedAmount,
        note: note.trim(),
        idempotency_key: idempotencyKey,
      });
      toast.success(result.idempotent ? "Yêu cầu này đã được xử lý trước đó." : "Đã điều chỉnh số dư.");
      setResponse((current) => current ? {
        ...current,
        meta: { ...current.meta, wallet: result.wallet },
      } : current);
      setAmount("");
      setNote("");
      setConfirming(false);
      setIdempotencyKey("");
      setPage(1);
      await load();
    } catch (requestError) {
      toast.error(normalizeApiError(requestError).message);
    } finally {
      setBusy(false);
    }
  };

  const updateAdjustment = (nextDirection: "credit" | "debit") => {
    setDirection(nextDirection);
    setConfirming(false);
    setIdempotencyKey("");
  };

  return (
    <div
      ref={dialogRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-labelledby="user-wallet-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
    >
      <div className="max-h-[94vh] w-full max-w-6xl overflow-y-auto rounded-md bg-white shadow-xl">
        <header className="sticky top-0 z-10 flex items-start justify-between border-b border-[#dce3e5] bg-white px-5 py-4">
          <div>
            <h2 id="user-wallet-title" className="text-lg font-bold text-[#172b35]">Ví và lịch sử giao dịch</h2>
            <p className="mt-1 text-sm text-[#60727a]">{user.name} · {user.email} · User #{user.id}</p>
          </div>
          <button type="button" aria-label="Đóng" disabled={busy} onClick={onClose} className="size-9 text-[#52636c] disabled:opacity-50">
            <i className="fas fa-xmark" aria-hidden="true" />
          </button>
        </header>

        <div className="px-5 py-5">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#dce3e5] pb-5">
            <div>
              <p className="text-xs font-semibold uppercase text-[#60727a]">Số dư hiện tại</p>
              <p className="mt-1 text-2xl font-bold text-[#116966]">
                {response ? formatMoney(response.meta.wallet.balance) : "-"}
              </p>
              {response && !response.meta.wallet.is_active && <p className="mt-1 text-sm font-semibold text-red-700">Ví đang bị khóa</p>}
            </div>
            <p className="max-w-xl text-sm text-[#60727a]">Mọi điều chỉnh đều tạo một giao dịch riêng và lưu người thực hiện. Không chỉnh trực tiếp số dư để lịch sử luôn đối soát được.</p>
          </div>

          {canAdjust && (
            <form onSubmit={beginConfirmation} className="border-b border-[#dce3e5] py-5">
              <h3 className="text-sm font-bold text-[#172b35]">Điều chỉnh số dư</h3>
              <div className="mt-3 grid gap-3 lg:grid-cols-[auto_180px_1fr_auto] lg:items-end">
                <div>
                  <span className="block text-xs font-semibold text-[#52636c]">Loại điều chỉnh</span>
                  <div className="mt-1 inline-flex h-10 border border-[#cbd6d8] bg-white p-0.5">
                    <button type="button" onClick={() => updateAdjustment("credit")} aria-pressed={direction === "credit"} className={`px-3 text-sm font-semibold ${direction === "credit" ? "bg-emerald-700 text-white" : "text-[#52636c]"}`}>
                      <i className="fas fa-plus mr-2" aria-hidden="true" />Cộng
                    </button>
                    <button type="button" onClick={() => updateAdjustment("debit")} aria-pressed={direction === "debit"} className={`px-3 text-sm font-semibold ${direction === "debit" ? "bg-red-700 text-white" : "text-[#52636c]"}`}>
                      <i className="fas fa-minus mr-2" aria-hidden="true" />Trừ
                    </button>
                  </div>
                </div>
                <label className="text-xs font-semibold text-[#52636c]">
                  Số tiền (VND)
                  <input required inputMode="decimal" value={amount} onChange={(event) => { setAmount(event.target.value); setConfirming(false); setIdempotencyKey(""); }} placeholder="100000" className="mt-1 h-10 w-full rounded border border-[#cbd6d8] px-3 text-sm font-normal" />
                </label>
                <label className="text-xs font-semibold text-[#52636c]">
                  Lý do
                  <input required maxLength={255} value={note} onChange={(event) => { setNote(event.target.value); setConfirming(false); setIdempotencyKey(""); }} placeholder="Nội dung dùng để đối soát" className="mt-1 h-10 w-full rounded border border-[#cbd6d8] px-3 text-sm font-normal" />
                </label>
                <button type="submit" disabled={busy || !response?.meta.wallet.is_active} className="h-10 rounded bg-[#116966] px-4 text-sm font-semibold text-white disabled:opacity-50">Kiểm tra</button>
              </div>
              {localError && <p role="alert" className="mt-2 text-sm text-red-700">{localError}</p>}
              {confirming && (
                <div role="alert" className="mt-4 flex flex-wrap items-center justify-between gap-3 border-l-4 border-amber-500 bg-amber-50 px-4 py-3 text-sm">
                  <span>Xác nhận <strong>{direction === "credit" ? "cộng" : "trừ"} {formatMoney(normalizedAmount)}</strong> cho {user.email}?</span>
                  <div className="flex gap-2">
                    <button type="button" disabled={busy} onClick={() => setConfirming(false)} className="h-9 border border-[#cbd6d8] bg-white px-3 font-semibold">Hủy</button>
                    <button type="button" disabled={busy} onClick={() => void adjustBalance()} className={`h-9 px-3 font-semibold text-white disabled:opacity-50 ${direction === "debit" ? "bg-red-700" : "bg-emerald-700"}`}>
                      {busy ? "Đang xử lý..." : "Xác nhận điều chỉnh"}
                    </button>
                  </div>
                </div>
              )}
            </form>
          )}

          <section className="pt-5" aria-labelledby="wallet-history-heading">
            <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h3 id="wallet-history-heading" className="text-sm font-bold text-[#172b35]">Lịch sử giao dịch</h3>
                <p className="mt-1 text-xs text-[#60727a]">Sắp xếp mới nhất trước</p>
              </div>
              <label className="text-xs font-semibold text-[#52636c]">
                Loại giao dịch
                <select value={type} onChange={(event) => { setType(event.target.value as WalletTransactionType | ""); setPage(1); }} className="ml-2 h-9 rounded border border-[#cbd6d8] bg-white px-3 text-sm font-normal">
                  <option value="">Tất cả</option>
                  {transactionOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </label>
            </div>

            {loading ? <LoadingState label="Đang tải lịch sử giao dịch..." /> : error ? <ErrorState message={error} onRetry={() => void load()} /> : (
              <>
                <div className="overflow-x-auto border border-[#dce3e5]">
                  <table className="w-full border-collapse text-left text-sm">
                    <thead className="bg-[#f1f5f5] text-xs font-bold uppercase text-[#52636c]">
                      <tr><th className="px-3 py-3">Thời gian</th><th className="px-3 py-3">Loại</th><th className="px-3 py-3 text-right">Số tiền</th><th className="px-3 py-3 text-right">Trước</th><th className="px-3 py-3 text-right">Sau</th><th className="px-3 py-3">Nội dung</th></tr>
                    </thead>
                    <tbody className="divide-y divide-[#e7ebec]">
                      {response?.data.map((transaction) => {
                        const credit = creditTypes.has(transaction.type);
                        return <tr key={transaction.id}><td className="whitespace-nowrap px-3 py-3">{formatDateTime(transaction.created_at)}</td><td className="whitespace-nowrap px-3 py-3 font-semibold">{transactionLabels[transaction.type]}</td><td className={`whitespace-nowrap px-3 py-3 text-right font-bold ${credit ? "text-emerald-700" : "text-red-700"}`}>{credit ? "+" : "-"}{formatMoney(transaction.amount)}</td><td className="whitespace-nowrap px-3 py-3 text-right">{transaction.balance_before ? formatMoney(transaction.balance_before) : "-"}</td><td className="whitespace-nowrap px-3 py-3 text-right">{transaction.balance_after ? formatMoney(transaction.balance_after) : "-"}</td><td className="min-w-48 px-3 py-3 text-[#52636c]">{transaction.description || "-"}</td></tr>;
                      })}
                      {!response?.data.length && <tr><td colSpan={6} className="px-4 py-10 text-center text-[#60727a]">Chưa có giao dịch phù hợp.</td></tr>}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4"><Pagination currentPage={response?.meta.current_page ?? 1} lastPage={response?.meta.last_page ?? 1} onPageChange={setPage} /></div>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
