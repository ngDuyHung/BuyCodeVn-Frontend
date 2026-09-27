"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import EmptyState from "@/components/shared/EmptyState";
import ErrorState from "@/components/shared/ErrorState";
import LoadingState from "@/components/shared/LoadingState";
import { normalizeApiError } from "@/lib/api-error";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { financeService } from "@/services/client/financeService";
import { orderService } from "@/services/client/orderService";
import { userService } from "@/services/client/userService";
import { useAuthStore } from "@/stores/authStore";
import type { Wallet, WalletTransaction, WalletTransactionType } from "@/types/finance";

const transactionLabels: Partial<Record<WalletTransactionType, string>> = {
  deposit: "Nạp tiền",
  payment: "Thanh toán",
  refund: "Hoàn tiền",
  withdraw_pending: "Tạo lệnh rút",
  withdraw: "Rút tiền hoàn tất",
  refund_withdraw: "Hoàn lệnh rút",
};

transactionLabels.admin_credit = "Admin cộng số dư";
transactionLabels.admin_debit = "Admin trừ số dư";

const creditTypes = new Set<WalletTransactionType>([
  "deposit",
  "refund",
  "refund_withdraw",
]);

export default function UserDashboard() {
  const user = useAuthStore((state) => state.user);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [counts, setCounts] = useState({ orders: 0, hosting: 0, domains: 0, vps: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    Promise.resolve()
      .then(() => {
        setIsLoading(true);
        setError(null);
        return Promise.all([
          financeService.getWallet(controller.signal),
          financeService.getWalletTransactions(
            { page: 1, per_page: 5 },
            controller.signal,
          ),
          orderService.getOrders({ page: 1, per_page: 1 }, controller.signal),
          userService.getServices(
            { service_type: "hosting", status: "active", page: 1, per_page: 1 },
            controller.signal,
          ),
          userService.getServices(
            { service_type: "domain", status: "active", page: 1, per_page: 1 },
            controller.signal,
          ),
          userService.getServices(
            { service_type: "vps", status: "active", page: 1, per_page: 1 },
            controller.signal,
          ),
        ]);
      })
      .then(([walletResponse, transactionResponse, orderResponse, hostingResponse, domainResponse, vpsResponse]) => {
        setWallet(walletResponse);
        setTransactions(transactionResponse.data);
        setCounts({
          orders: orderResponse.meta.total,
          hosting: hostingResponse.meta.total,
          domains: domainResponse.meta.total,
          vps: vpsResponse.meta.total,
        });
      })
      .catch((request) => {
        if (!controller.signal.aborted) {
          setError(normalizeApiError(request).message);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    return () => controller.abort();
  }, [reloadKey]);

  return (
    <div className="space-y-6">
      <section className="flex flex-col items-start justify-between gap-4 rounded-lg border border-gray-border bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,.04)] md:flex-row md:items-center md:p-6">
        <div>
          <h1 className="text-xl font-extrabold text-blue-nav">Xin chào, {user?.name || "Khách hàng"}!</h1>
          <p className="mt-1 text-sm text-text-muted">Theo dõi số dư và các biến động gần nhất của ví.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/user/deposit" className="inline-flex h-10 items-center gap-2 rounded-md bg-blue-primary px-4 text-sm font-bold text-white hover:bg-[#154ea0]"><i className="fas fa-plus" aria-hidden="true" />Nạp tiền</Link>
          <Link href="/user/withdraw" className="inline-flex h-10 items-center gap-2 rounded-md border border-gray-border px-4 text-sm font-semibold text-[#475569] hover:border-blue-primary hover:text-blue-primary"><i className="fas fa-arrow-up" aria-hidden="true" />Rút tiền</Link>
        </div>
      </section>

      {isLoading ? (
        <section className="rounded-lg border border-gray-border bg-white"><LoadingState label="Đang tải thông tin ví..." /></section>
      ) : error ? (
        <section className="rounded-lg border border-gray-border bg-white"><ErrorState message={error} onRetry={() => setReloadKey((key) => key + 1)} /></section>
      ) : (
        <>
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <article className="flex items-center justify-between gap-4 rounded-lg border border-gray-border bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,.04)]"><div><p className="text-sm font-semibold text-text-muted">Số dư khả dụng</p><strong className="mt-1 block text-2xl text-blue-nav">{wallet ? formatCurrency(wallet.balance) : "-"}</strong><p className="mt-1 text-xs text-text-muted">Cập nhật {formatDateTime(wallet?.updated_at)}</p></div><div className={`flex size-11 shrink-0 items-center justify-center rounded-full text-lg ${wallet?.is_active ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}><i className="fas fa-wallet" aria-hidden="true" /></div></article>
            <Link href="/user/orders" className="flex items-center justify-between gap-4 rounded-lg border border-gray-border bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,.04)] hover:border-blue-primary"><div><p className="text-sm font-semibold text-text-muted">Tổng đơn hàng</p><strong className="mt-1 block text-2xl text-blue-nav">{counts.orders}</strong></div><i className="fas fa-bag-shopping text-xl text-blue-primary" aria-hidden="true" /></Link>
            <Link href="/user/hosting" className="flex items-center justify-between gap-4 rounded-lg border border-gray-border bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,.04)] hover:border-blue-primary"><div><p className="text-sm font-semibold text-text-muted">Hosting đang chạy</p><strong className="mt-1 block text-2xl text-blue-nav">{counts.hosting}</strong></div><i className="fas fa-server text-xl text-green-600" aria-hidden="true" /></Link>
            <Link href="/user/domains" className="flex items-center justify-between gap-4 rounded-lg border border-gray-border bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,.04)] hover:border-blue-primary"><div><p className="text-sm font-semibold text-text-muted">Tên miền đang chạy</p><strong className="mt-1 block text-2xl text-blue-nav">{counts.domains}</strong></div><i className="fas fa-globe text-xl text-orange-main" aria-hidden="true" /></Link>
            <Link href="/user/vps" className="flex items-center justify-between gap-4 rounded-lg border border-gray-border bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,.04)] hover:border-blue-primary"><div><p className="text-sm font-semibold text-text-muted">VPS đang chạy</p><strong className="mt-1 block text-2xl text-blue-nav">{counts.vps}</strong></div><i className="fas fa-cloud text-xl text-blue-primary" aria-hidden="true" /></Link>
          </section>

          <section className="overflow-hidden rounded-lg border border-gray-border bg-white shadow-[0_2px_12px_rgba(0,0,0,.04)]">
            <header className="border-b border-gray-border px-5 py-4"><h2 className="font-bold text-blue-nav">Giao dịch gần đây</h2></header>
            {transactions.length === 0 ? (
              <EmptyState title="Chưa có giao dịch ví" description="Các giao dịch nạp tiền, thanh toán, hoàn tiền và rút tiền sẽ xuất hiện tại đây." />
            ) : (
              <div className="divide-y divide-gray-border">
                {transactions.map((transaction) => {
                  const isCredit = creditTypes.has(transaction.type) || transaction.type === "admin_credit";
                  return <article key={transaction.id} className="flex items-center justify-between gap-4 px-5 py-4"><div className="min-w-0"><p className="font-semibold text-blue-nav">{transactionLabels[transaction.type] ?? transaction.type}</p><p className="mt-1 truncate text-xs text-text-muted">{transaction.description || formatDateTime(transaction.created_at)}</p></div><div className="shrink-0 text-right"><strong className={isCredit ? "text-green-600" : "text-orange-main"}>{isCredit ? "+" : ""}{formatCurrency(transaction.amount)}</strong>{transaction.balance_after && <p className="mt-1 text-xs text-text-muted">Số dư {formatCurrency(transaction.balance_after)}</p>}</div></article>;
                })}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
