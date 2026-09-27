"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { normalizeApiError } from "@/lib/api-error";
import { formatCurrency } from "@/lib/format";
import { isMoneyLessThan, toMoneyString } from "@/lib/money";
import { financeService } from "@/services/client/financeService";
import type { Wallet } from "@/types/finance";

interface FormErrors {
  amount?: string;
  bank_name?: string;
  account_number?: string;
  account_name?: string;
}

export default function WithdrawalForm() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [amount, setAmount] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [requestError, setRequestError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreated, setIsCreated] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    Promise.resolve()
      .then(() => {
        setIsLoading(true);
        setRequestError(null);
        return financeService.getWallet(controller.signal);
      })
      .then(setWallet)
      .catch((request) => {
        if (!controller.signal.aborted) setRequestError(normalizeApiError(request).message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    return () => controller.abort();
  }, [reloadKey]);

  const validate = () => {
    const nextErrors: FormErrors = {};
    if (!amount || isMoneyLessThan(amount, "50000")) {
      nextErrors.amount = "Số tiền rút tối thiểu là 50.000đ.";
    } else if (wallet && isMoneyLessThan(wallet.balance, amount)) {
      nextErrors.amount = "Số dư ví không đủ để tạo lệnh rút.";
    }
    if (!bankName.trim()) nextErrors.bank_name = "Vui lòng nhập tên ngân hàng.";
    else if (bankName.trim().length > 100) nextErrors.bank_name = "Tên ngân hàng không quá 100 ký tự.";
    if (!accountNumber.trim()) nextErrors.account_number = "Vui lòng nhập số tài khoản.";
    else if (accountNumber.trim().length > 50) nextErrors.account_number = "Số tài khoản không quá 50 ký tự.";
    if (!accountName.trim()) nextErrors.account_name = "Vui lòng nhập tên chủ tài khoản.";
    else if (accountName.trim().length > 100) nextErrors.account_name = "Tên chủ tài khoản không quá 100 ký tự.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate() || isSubmitting) return;

    setIsSubmitting(true);
    setRequestError(null);
    try {
      await financeService.createWithdrawal({
        amount: toMoneyString(amount),
        bank_name: bankName.trim(),
        account_number: accountNumber.trim(),
        account_name: accountName.trim(),
      });
      setIsCreated(true);
      try {
        setWallet(await financeService.getWallet());
      } catch {
        // The pending withdrawal remains the primary result.
      }
    } catch (request) {
      setRequestError(normalizeApiError(request).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isCreated) {
    return (
      <section className="rounded-lg border border-gray-border bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,.04)]">
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-900">
          <div className="flex items-start gap-3">
            <i className="fas fa-clock mt-0.5" aria-hidden="true" />
            <div><h1 className="font-bold">Lệnh rút tiền đang chờ duyệt</h1><p className="mt-1 text-sm">Số tiền {formatCurrency(amount)} đã được trừ khỏi ví. Quản trị viên sẽ xử lý chuyển khoản đến tài khoản đã cung cấp.</p></div>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap justify-end gap-3">
          <Link href="/user/withdrawals" className="inline-flex h-10 items-center rounded-md border border-gray-border px-4 text-sm font-semibold text-[#475569] hover:bg-gray-50">Xem lịch sử rút tiền</Link>
          <button type="button" onClick={() => { setIsCreated(false); setAmount(""); }} className="h-10 rounded-md bg-blue-primary px-4 text-sm font-bold text-white hover:bg-[#154ea0]">Tạo lệnh khác</button>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-2xl rounded-lg border border-gray-border bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,.04)] md:p-7">
      <header className="mb-6 border-b border-gray-border pb-4">
        <h1 className="text-xl font-extrabold text-blue-nav">Rút tiền</h1>
        <p className="mt-1 text-sm text-text-muted">Tạo yêu cầu chuyển tiền từ ví về tài khoản ngân hàng.</p>
      </header>

      <div className="mb-5 flex items-center justify-between rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-sm">
        <span className="text-[#475569]">Số dư khả dụng</span>
        <strong className="text-lg text-blue-nav">{isLoading ? "Đang tải..." : wallet ? formatCurrency(wallet.balance) : "-"}</strong>
      </div>

      {requestError && !wallet ? (
        <div className="text-center"><p role="alert" className="text-sm text-red-600">{requestError}</p><button type="button" onClick={() => setReloadKey((key) => key + 1)} className="mt-3 rounded-md bg-blue-primary px-4 py-2 text-sm font-semibold text-white">Thử lại</button></div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <Field id="withdraw-amount" label="Số tiền" value={amount} onChange={(value) => { setAmount(value); setErrors((current) => ({ ...current, amount: undefined })); }} error={errors.amount} type="number" maxLength={undefined} suffix="VNĐ" />
          <Field id="withdraw-bank" label="Ngân hàng" value={bankName} onChange={(value) => { setBankName(value); setErrors((current) => ({ ...current, bank_name: undefined })); }} error={errors.bank_name} maxLength={100} />
          <Field id="withdraw-account-number" label="Số tài khoản" value={accountNumber} onChange={(value) => { setAccountNumber(value); setErrors((current) => ({ ...current, account_number: undefined })); }} error={errors.account_number} maxLength={50} autoComplete="off" />
          <Field id="withdraw-account-name" label="Tên chủ tài khoản" value={accountName} onChange={(value) => { setAccountName(value); setErrors((current) => ({ ...current, account_name: undefined })); }} error={errors.account_name} maxLength={100} />

          <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">Tiền được trừ ngay khi tạo lệnh và sẽ được hoàn lại nếu yêu cầu bị từ chối.</p>
          {requestError && <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{requestError}</p>}
          <button type="submit" disabled={isLoading || isSubmitting || !wallet?.is_active} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-orange-main text-sm font-bold text-white hover:bg-orange-dark disabled:opacity-60">{isSubmitting && <i className="fas fa-spinner fa-spin" aria-hidden="true" />}{isSubmitting ? "Đang tạo lệnh" : "Xác nhận rút tiền"}</button>
        </form>
      )}
    </section>
  );
}

interface FieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: string;
  maxLength?: number;
  suffix?: string;
  autoComplete?: string;
}

function Field({ id, label, value, onChange, error, type = "text", maxLength, suffix, autoComplete }: FieldProps) {
  return <label htmlFor={id} className="block text-sm font-semibold text-[#374151]">{label}<span className="relative mt-1.5 block"><input id={id} type={type} min={type === "number" ? "50000" : undefined} step={type === "number" ? "1000" : undefined} value={value} onChange={(event) => onChange(event.target.value)} maxLength={maxLength} autoComplete={autoComplete} className="h-11 w-full rounded-md border border-gray-border px-3 pr-14 font-normal outline-none focus:border-blue-primary" />{suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 font-normal text-text-muted">{suffix}</span>}</span>{error && <span className="mt-1 block text-xs text-red-600">{error}</span>}</label>;
}
