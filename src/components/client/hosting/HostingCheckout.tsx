"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { normalizeApiError } from "@/lib/api-error";
import { formatCurrency } from "@/lib/format";
import { isMoneyLessThan, multiplyMoney } from "@/lib/money";
import { isValidDomain, normalizeDomain } from "@/lib/validation";
import { financeService } from "@/services/client/financeService";
import { orderService } from "@/services/client/orderService";
import { useAuthStore } from "@/stores/authStore";
import {
  HOSTING_MONTH_OPTIONS,
  type BuyHostingResult,
  type CouponPreview,
  type HostingMonths,
} from "@/types/orders";
import type { Wallet } from "@/types/finance";
import type { HostingPlan } from "@/types/services";

interface HostingCheckoutProps {
  plan: HostingPlan;
  onClose: () => void;
}

export default function HostingCheckout({ plan, onClose }: HostingCheckoutProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isSessionReady = useAuthStore((state) => state.isSessionReady);
  const [domain, setDomain] = useState("");
  const [months, setMonths] = useState<HostingMonths>(12);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [preview, setPreview] = useState<CouponPreview | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [domainError, setDomainError] = useState<string | null>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [purchaseResult, setPurchaseResult] = useState<BuyHostingResult | null>(null);

  const normalizedCoupon = couponCode.replace(/\s+/g, "").toUpperCase();
  const totalAmount = useMemo(
    () => multiplyMoney(plan.price_per_month, months),
    [months, plan.price_per_month],
  );
  const finalAmount = preview?.final_amount ?? totalAmount;
  const hasUnappliedCoupon =
    Boolean(normalizedCoupon) && normalizedCoupon !== appliedCoupon;
  const hasInsufficientBalance = wallet
    ? isMoneyLessThan(wallet.balance, finalAmount)
    : false;

  useEffect(() => {
    if (!isAuthenticated) return;
    const controller = new AbortController();
    financeService
      .getWallet(controller.signal)
      .then(setWallet)
      .catch((walletError) => {
        if (!controller.signal.aborted) {
          setError(normalizeApiError(walletError).message);
        }
      });
    return () => controller.abort();
  }, [isAuthenticated]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSubmitting) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSubmitting, onClose]);

  const resetCoupon = () => {
    setPreview(null);
    setAppliedCoupon("");
    setError(null);
  };

  const handleMonthsChange = (value: HostingMonths) => {
    setMonths(value);
    resetCoupon();
  };

  const handlePreview = async () => {
    if (!normalizedCoupon || isPreviewing) return;
    setIsPreviewing(true);
    setError(null);
    try {
      const response = await orderService.previewCoupon({
        coupon_code: normalizedCoupon,
        total_amount: totalAmount,
      });
      setPreview(response.data);
      setAppliedCoupon(normalizedCoupon);
    } catch (previewError) {
      resetCoupon();
      setError(normalizeApiError(previewError).message);
    } finally {
      setIsPreviewing(false);
    }
  };

  const handleSubmit = async () => {
    const normalizedDomain = normalizeDomain(domain);
    if (!isValidDomain(normalizedDomain)) {
      setDomainError("Tên miền không hợp lệ, ví dụ: example.com.");
      return;
    }
    if (isSubmitting || hasUnappliedCoupon || hasInsufficientBalance) return;

    setDomainError(null);
    setError(null);
    setIsSubmitting(true);
    try {
      const response = await orderService.buyHosting({
        hosting_plan_id: plan.id,
        domain: normalizedDomain,
        months,
        ...(appliedCoupon ? { coupon_code: appliedCoupon } : {}),
      });
      setPurchaseResult(response.data);
      try {
        setWallet(await financeService.getWallet());
      } catch {
        // Hosting was created; a stale balance must not replace that result.
      }
    } catch (purchaseError) {
      const apiError = normalizeApiError(purchaseError);
      setError(apiError.message);
      if (apiError.message.toLocaleLowerCase("vi").includes("hoàn")) {
        try {
          setWallet(await financeService.getWallet());
        } catch {
          // The business error remains the primary message.
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/55 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="hosting-checkout-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSubmitting) onClose();
      }}
    >
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white shadow-2xl">
        <header className="flex items-start justify-between border-b border-gray-border px-5 py-4">
          <div>
            <h2 id="hosting-checkout-title" className="text-lg font-extrabold text-blue-nav">
              Đăng ký hosting
            </h2>
            <p className="mt-1 text-sm text-text-muted">Gói {plan.name}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Đóng"
            className="flex size-9 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-50"
          >
            <i className="fas fa-times" aria-hidden="true" />
          </button>
        </header>

        {!isSessionReady ? (
          <div className="p-8 text-center text-sm text-text-muted">Đang kiểm tra tài khoản...</div>
        ) : !isAuthenticated ? (
          <div className="p-6 text-center">
            <p className="text-sm text-[#475569]">Đăng nhập để tiếp tục đăng ký gói hosting này.</p>
            <Link
              href={`/login?returnUrl=${encodeURIComponent(`/hosting?plan=${plan.id}`)}`}
              className="mt-4 inline-flex h-10 items-center gap-2 rounded-md bg-blue-primary px-4 text-sm font-bold text-white hover:bg-[#154ea0]"
            >
              <i className="fas fa-right-to-bracket" aria-hidden="true" />
              Đăng nhập
            </Link>
          </div>
        ) : purchaseResult ? (
          <div className="p-6">
            {purchaseResult.status === "pending_manual" ? (
              <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-900">
                <i className="fas fa-clock mt-0.5" aria-hidden="true" />
                <div>
                  <h3 className="font-bold">Yêu cầu hosting đang chờ kích hoạt</h3>
                  <p className="mt-1 text-sm">Tên miền: {purchaseResult.domain}</p>
                  <p className="mt-2 text-sm">
                    Đơn hàng đang được xử lý thủ công. Thông tin đăng nhập chỉ có sau khi hosting được kích hoạt.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-green-800">
                <i className="fas fa-circle-check mt-0.5" aria-hidden="true" />
                <div>
                  <h3 className="font-bold">Hosting đã được kích hoạt thành công</h3>
                  <p className="mt-1 text-sm">Tên miền: {purchaseResult.domain}</p>
                </div>
              </div>
            )}
            <div className="mt-5 flex justify-end gap-3">
              <Link href="/user/orders" className="inline-flex h-10 items-center rounded-md border border-gray-border px-4 text-sm font-semibold text-[#475569] hover:bg-gray-50">
                Xem đơn hàng
              </Link>
              <button type="button" onClick={onClose} className="h-10 rounded-md bg-blue-primary px-4 text-sm font-bold text-white hover:bg-[#154ea0]">
                Hoàn tất
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-5 p-5">
            <label className="block text-sm font-semibold text-[#334155]">
              Tên miền sử dụng
              <input
                value={domain}
                onChange={(event) => {
                  setDomain(event.target.value);
                  setDomainError(null);
                }}
                placeholder="example.com"
                autoComplete="url"
                className="mt-1.5 h-11 w-full rounded-md border border-gray-border px-3 font-normal outline-none focus:border-blue-primary"
              />
              {domainError && <span className="mt-1 block text-xs text-red-600">{domainError}</span>}
            </label>

            <label className="block text-sm font-semibold text-[#334155]">
              Chu kỳ
              <select
                value={months}
                onChange={(event) => handleMonthsChange(Number(event.target.value) as HostingMonths)}
                className="mt-1.5 h-11 w-full rounded-md border border-gray-border bg-white px-3 font-normal outline-none focus:border-blue-primary"
              >
                {HOSTING_MONTH_OPTIONS.map((option) => (
                  <option key={option} value={option}>{option} tháng</option>
                ))}
              </select>
            </label>

            <div>
              <label htmlFor="hosting-coupon" className="block text-sm font-semibold text-[#334155]">Mã giảm giá</label>
              <div className="mt-1.5 flex gap-2">
                <input
                  id="hosting-coupon"
                  value={couponCode}
                  maxLength={50}
                  onChange={(event) => {
                    setCouponCode(event.target.value.toUpperCase());
                    resetCoupon();
                  }}
                  placeholder="Nhập mã nếu có"
                  className="h-10 min-w-0 flex-1 rounded-md border border-gray-border px-3 text-sm uppercase outline-none focus:border-blue-primary"
                />
                <button type="button" onClick={handlePreview} disabled={!normalizedCoupon || isPreviewing} className="h-10 rounded-md border border-blue-primary px-3 text-sm font-bold text-blue-primary disabled:opacity-50">
                  {isPreviewing ? "Đang kiểm tra" : "Áp dụng"}
                </button>
              </div>
            </div>

            <div className="space-y-2 border-y border-gray-border py-4 text-sm">
              <div className="flex justify-between gap-4"><span>Số dư ví</span><strong>{wallet ? formatCurrency(wallet.balance) : "Đang tải..."}</strong></div>
              <div className="flex justify-between gap-4"><span>{formatCurrency(plan.price_per_month)} × {months} tháng</span><strong>{formatCurrency(totalAmount)}</strong></div>
              <div className="flex justify-between gap-4 text-[#15803d]"><span>Giảm giá</span><strong>-{formatCurrency(preview?.discount_amount ?? "0.00")}</strong></div>
              <div className="flex justify-between gap-4 pt-2 text-base font-bold text-blue-nav"><span>Thanh toán</span><strong className="text-xl text-orange-main">{formatCurrency(finalAmount)}</strong></div>
            </div>

            {hasInsufficientBalance && <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">Số dư ví không đủ. Vui lòng nạp thêm tiền.</p>}
            {hasUnappliedCoupon && <p className="text-xs text-text-muted">Áp dụng mã trước khi xác nhận thanh toán.</p>}
            {error && <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

            <div className="flex justify-end gap-3">
              <button type="button" onClick={onClose} disabled={isSubmitting} className="h-10 rounded-md border border-gray-border px-4 text-sm font-semibold text-[#475569] hover:bg-gray-50">Hủy</button>
              <button type="button" onClick={handleSubmit} disabled={isSubmitting || hasUnappliedCoupon || hasInsufficientBalance} className="inline-flex h-10 min-w-36 items-center justify-center gap-2 rounded-md bg-orange-main px-4 text-sm font-bold text-white hover:bg-orange-dark disabled:opacity-50">
                {isSubmitting && <i className="fas fa-spinner fa-spin" aria-hidden="true" />}
                {isSubmitting ? "Đang tạo hosting" : "Xác nhận đăng ký"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
