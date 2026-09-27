"use client";

import Image from "next/image";
import { useState } from "react";
import ErrorState from "@/components/shared/ErrorState";
import { useFinanceLogic } from "@/hooks/client/useFinanceLogic";
import { formatCurrency } from "@/lib/format";
import { isMoneyLessThan, toMoneyString } from "@/lib/money";

const QUICK_AMOUNTS = ["50000", "100000", "200000", "500000", "1000000"];

export default function DepositPage() {
  const {
    banks,
    isLoadingBanks,
    isDepositing,
    depositResult,
    error,
    setError,
    retryBanks,
    handleDeposit,
    resetDeposit,
  } = useFinanceLogic();
  const [amount, setAmount] = useState("");
  const [selectedBank, setSelectedBank] = useState<number | "">("");
  const [amountError, setAmountError] = useState<string | null>(null);
  const [bankError, setBankError] = useState<string | null>(null);
  const [copiedValue, setCopiedValue] = useState<string | null>(null);

  const copyValue = async (value: string) => {
    await navigator.clipboard.writeText(value);
    setCopiedValue(value);
    window.setTimeout(() => setCopiedValue(null), 1500);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const invalidAmount = !amount || isMoneyLessThan(amount, "10000");
    setAmountError(invalidAmount ? "Số tiền nạp tối thiểu là 10.000đ." : null);
    setBankError(!selectedBank ? "Vui lòng chọn ngân hàng thụ hưởng." : null);
    if (invalidAmount || !selectedBank) return;

    void handleDeposit({
      bank_account_id: Number(selectedBank),
      amount: toMoneyString(amount),
    });
  };

  if (depositResult) {
    const rawAmount = depositResult.amount.replace(/\.00$/, "");
    return (
      <section className="rounded-lg border border-gray-border bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,.04)] md:p-6">
        <header className="mb-6 border-b border-gray-border pb-4">
          <h1 className="text-xl font-extrabold text-blue-nav">Chuyển khoản nạp ví</h1>
          <p className="mt-1 text-sm text-text-muted">Quét QR hoặc dùng chính xác thông tin bên dưới.</p>
        </header>

        <div className="flex flex-col items-center gap-7 md:flex-row md:items-start">
          <div className="flex w-[250px] shrink-0 flex-col items-center rounded-lg border border-gray-border bg-gray-50 p-4">
            <Image src={depositResult.qr_url} alt="Mã QR chuyển khoản nạp ví" width={220} height={220} unoptimized className="h-auto w-full rounded-md" />
            <p className="mt-3 text-center text-xs text-text-muted">Quét bằng ứng dụng ngân hàng.</p>
          </div>

          <div className="w-full flex-1 space-y-4">
            <div className="rounded-lg border border-blue-primary/20 bg-[#f0f6ff] p-4">
              <TransferRow label="Ngân hàng" value={depositResult.bank_name} />
              <TransferRow label="Chủ tài khoản" value={depositResult.account_name} />
              <TransferRow label="Số tài khoản" value={depositResult.account_number} onCopy={() => copyValue(depositResult.account_number)} copied={copiedValue === depositResult.account_number} />
              <TransferRow label="Số tiền" value={formatCurrency(depositResult.amount)} onCopy={() => copyValue(rawAmount)} copied={copiedValue === rawAmount} />
              <TransferRow label="Nội dung bắt buộc" value={depositResult.transaction_code} onCopy={() => copyValue(depositResult.transaction_code)} copied={copiedValue === depositResult.transaction_code} last />
            </div>
            <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              Chuyển đúng số tiền và nội dung <strong>{depositResult.transaction_code}</strong>. Lệnh đang chờ ngân hàng hoặc quản trị viên xác nhận.
            </div>
            <button type="button" onClick={() => { resetDeposit(); setAmount(""); setSelectedBank(""); }} className="h-10 w-full rounded-md border border-gray-border text-sm font-semibold text-[#475569] hover:bg-gray-50">
              Tạo lệnh nạp mới
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-2xl rounded-lg border border-gray-border bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,.04)] md:p-7">
      <header className="mb-6 border-b border-gray-border pb-4">
        <h1 className="text-xl font-extrabold text-blue-nav">Nạp tiền vào ví</h1>
        <p className="mt-1 text-sm text-text-muted">Tạo lệnh chuyển khoản qua QR ngân hàng.</p>
      </header>

      {error && !isLoadingBanks && banks.length === 0 ? (
        <ErrorState message={error} onRetry={retryBanks} />
      ) : (
        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          <div>
            <label htmlFor="deposit-amount" className="text-sm font-semibold text-[#374151]">Số tiền cần nạp</label>
            <div className="mb-3 mt-2 grid grid-cols-3 gap-2 sm:grid-cols-5">
              {QUICK_AMOUNTS.map((value) => (
                <button key={value} type="button" onClick={() => { setAmount(value); setAmountError(null); }} className={`h-9 rounded-md border text-xs font-semibold transition-colors ${amount === value ? "border-blue-primary bg-blue-50 text-blue-primary" : "border-gray-border text-[#475569] hover:border-blue-primary"}`}>
                  {formatCurrency(value)}
                </button>
              ))}
            </div>
            <div className="relative">
              <input id="deposit-amount" type="number" min="10000" step="1000" value={amount} onChange={(event) => { setAmount(event.target.value); setAmountError(null); setError(null); }} placeholder="Tối thiểu 10.000" className="h-11 w-full rounded-md border border-gray-border px-3 pr-14 text-sm outline-none focus:border-blue-primary" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-text-muted">VNĐ</span>
            </div>
            {amountError && <p className="mt-1 text-xs text-red-600">{amountError}</p>}
          </div>

          <fieldset>
            <legend className="text-sm font-semibold text-[#374151]">Ngân hàng thụ hưởng</legend>
            {isLoadingBanks ? (
              <div className="mt-2 grid gap-3 sm:grid-cols-2" role="status" aria-label="Đang tải ngân hàng"><div className="h-20 animate-pulse rounded-md bg-gray-100" /><div className="h-20 animate-pulse rounded-md bg-gray-100" /></div>
            ) : (
              <div className="mt-2 grid gap-3 sm:grid-cols-2">
                {banks.map((bank) => (
                  <label key={bank.id} className={`flex cursor-pointer items-start gap-3 rounded-md border p-3 ${selectedBank === bank.id ? "border-blue-primary bg-blue-50" : "border-gray-border hover:border-blue-primary"}`}>
                    <input type="radio" name="bank" value={bank.id} checked={selectedBank === bank.id} onChange={() => { setSelectedBank(bank.id); setBankError(null); }} className="mt-1 accent-blue-primary" />
                    <span className="min-w-0"><strong className="block text-sm text-blue-nav">{bank.bank_name}</strong><span className="block text-xs text-text-muted">{bank.account_number}</span><span className="block truncate text-xs uppercase text-gray-500">{bank.account_name}</span></span>
                  </label>
                ))}
              </div>
            )}
            {bankError && <p className="mt-1 text-xs text-red-600">{bankError}</p>}
          </fieldset>

          {error && <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <button type="submit" disabled={isDepositing || isLoadingBanks || banks.length === 0} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-blue-primary text-sm font-bold text-white hover:bg-[#154ea0] disabled:opacity-60">
            {isDepositing && <i className="fas fa-spinner fa-spin" aria-hidden="true" />}
            {isDepositing ? "Đang tạo lệnh" : "Tạo lệnh nạp tiền"}
          </button>
        </form>
      )}
    </section>
  );
}

interface TransferRowProps {
  label: string;
  value: string;
  onCopy?: () => void;
  copied?: boolean;
  last?: boolean;
}

function TransferRow({ label, value, onCopy, copied, last }: TransferRowProps) {
  return (
    <div className={`flex items-center justify-between gap-4 py-2.5 ${last ? "" : "border-b border-blue-primary/10"}`}>
      <span className="text-xs text-text-muted">{label}</span>
      <div className="flex min-w-0 items-center gap-2">
        <strong className="truncate text-sm text-blue-nav">{value}</strong>
        {onCopy && <button type="button" onClick={onCopy} aria-label={`Sao chép ${label.toLowerCase()}`} title={`Sao chép ${label.toLowerCase()}`} className="flex size-8 shrink-0 items-center justify-center rounded-md text-blue-primary hover:bg-white"><i className={`fas ${copied ? "fa-check" : "fa-copy"}`} aria-hidden="true" /></button>}
      </div>
    </div>
  );
}
