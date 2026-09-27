"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useDialogAccessibility } from "@/hooks/useDialogAccessibility";
import { validateDomainContact, type DomainContactErrors } from "@/lib/domain-contact";
import { normalizeApiError } from "@/lib/api-error";
import { formatCurrency } from "@/lib/format";
import { isMoneyLessThan, multiplyMoney } from "@/lib/money";
import { financeService } from "@/services/client/financeService";
import { orderService } from "@/services/client/orderService";
import { useAuthStore } from "@/stores/authStore";
import type { Wallet } from "@/types/finance";
import type {
  BuyDomainResult,
  CouponPreview,
  DomainCheckResult,
  DomainContactInfo,
} from "@/types/orders";

interface DomainCheckoutProps {
  domainResult: DomainCheckResult;
  onClose: () => void;
}

const CONTACT_DRAFT_KEY = "buycode:domain-contact-draft";

const emptyContact: DomainContactInfo = {
  name: "",
  email: "",
  phone: "",
  cccd: "",
};

export default function DomainCheckout({ domainResult, onClose }: DomainCheckoutProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isSessionReady = useAuthStore((state) => state.isSessionReady);
  const [years, setYears] = useState(1);
  const [contact, setContact] = useState<DomainContactInfo>(emptyContact);
  const [contactErrors, setContactErrors] = useState<DomainContactErrors>({});
  const [rememberContact, setRememberContact] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [preview, setPreview] = useState<CouponPreview | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [purchaseResult, setPurchaseResult] = useState<BuyDomainResult | null>(null);
  const dialogRef = useDialogAccessibility(true, onClose, !isSubmitting);

  const normalizedCoupon = couponCode.replace(/\s+/g, "").toUpperCase();
  const totalAmount = useMemo(
    () => multiplyMoney(domainResult.register_price, years),
    [domainResult.register_price, years],
  );
  const finalAmount = preview?.final_amount ?? totalAmount;
  const hasUnappliedCoupon = Boolean(normalizedCoupon) && normalizedCoupon !== appliedCoupon;
  const hasInsufficientBalance = wallet
    ? isMoneyLessThan(wallet.balance, finalAmount)
    : false;

  useEffect(() => {
    let isActive = true;
    try {
      const draft = window.localStorage.getItem(CONTACT_DRAFT_KEY);
      if (!draft) return;
      const parsed = JSON.parse(draft) as Partial<DomainContactInfo>;
      Promise.resolve().then(() => {
        if (!isActive) return;
        setContact((current) => ({
          ...current,
          name: typeof parsed.name === "string" ? parsed.name : "",
          email: typeof parsed.email === "string" ? parsed.email : "",
          phone: typeof parsed.phone === "string" ? parsed.phone : "",
        }));
        setRememberContact(true);
      });
    } catch {
      window.localStorage.removeItem(CONTACT_DRAFT_KEY);
    }
    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    const controller = new AbortController();
    financeService
      .getWallet(controller.signal)
      .then(setWallet)
      .catch((walletError) => {
        if (!controller.signal.aborted) setError(normalizeApiError(walletError).message);
      });
    return () => controller.abort();
  }, [isAuthenticated]);

  const resetCoupon = () => {
    setPreview(null);
    setAppliedCoupon("");
    setError(null);
  };

  const updateContact = (field: keyof DomainContactInfo, value: string) => {
    setContact((current) => ({ ...current, [field]: value }));
    setContactErrors((current) => ({ ...current, [field]: undefined }));
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
    const errors = validateDomainContact(contact);
    setContactErrors(errors);
    if (Object.keys(errors).length || isSubmitting || hasUnappliedCoupon || hasInsufficientBalance) return;

    setError(null);
    setIsSubmitting(true);
    try {
      const normalizedContact = {
        name: contact.name.trim(),
        email: contact.email.trim(),
        phone: contact.phone.trim(),
        ...(contact.cccd?.trim() ? { cccd: contact.cccd.trim() } : {}),
      };
      const response = await orderService.buyDomain({
        domain: domainResult.domain,
        years,
        contact_info: normalizedContact,
        ...(appliedCoupon ? { coupon_code: appliedCoupon } : {}),
      });
      if (rememberContact) {
        window.localStorage.setItem(
          CONTACT_DRAFT_KEY,
          JSON.stringify({
            name: normalizedContact.name,
            email: normalizedContact.email,
            phone: normalizedContact.phone,
          }),
        );
      } else {
        window.localStorage.removeItem(CONTACT_DRAFT_KEY);
      }
      setPurchaseResult(response.data);
      try {
        setWallet(await financeService.getWallet());
      } catch {
        // The completed order remains the primary result.
      }
    } catch (purchaseError) {
      const apiError = normalizeApiError(purchaseError);
      setError(apiError.message);
      if (apiError.message.toLocaleLowerCase("vi").includes("hoàn")) {
        try {
          setWallet(await financeService.getWallet());
        } catch {
          // Keep the backend business message visible.
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const returnUrl = `/domains?domain=${encodeURIComponent(domainResult.domain)}`;

  return (
    <div
      ref={dialogRef}
      tabIndex={-1}
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/55 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="domain-checkout-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSubmitting) onClose();
      }}
    >
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-2xl">
        <header className="flex items-start justify-between border-b border-gray-border px-5 py-4">
          <div>
            <h2 id="domain-checkout-title" className="text-lg font-extrabold text-blue-nav">Đăng ký tên miền</h2>
            <p className="mt-1 text-sm text-text-muted">{domainResult.domain}</p>
          </div>
          <button type="button" onClick={onClose} disabled={isSubmitting} aria-label="Đóng" className="flex size-9 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-50">
            <i className="fas fa-times" aria-hidden="true" />
          </button>
        </header>

        {!isSessionReady ? (
          <div className="p-8 text-center text-sm text-text-muted">Đang kiểm tra tài khoản...</div>
        ) : !isAuthenticated ? (
          <div className="p-6 text-center">
            <p className="text-sm text-[#475569]">Đăng nhập để tiếp tục đăng ký tên miền này.</p>
            <Link href={`/login?returnUrl=${encodeURIComponent(returnUrl)}`} className="mt-4 inline-flex h-10 items-center gap-2 rounded-md bg-blue-primary px-4 text-sm font-bold text-white hover:bg-[#154ea0]">
              <i className="fas fa-right-to-bracket" aria-hidden="true" />
              Đăng nhập
            </Link>
          </div>
        ) : purchaseResult ? (
          <div className="p-6">
            <div className={`flex items-start gap-3 rounded-lg border p-4 ${purchaseResult.status === "pending_manual" ? "border-amber-200 bg-amber-50 text-amber-900" : "border-green-200 bg-green-50 text-green-800"}`}>
              <i className={`fas ${purchaseResult.status === "pending_manual" ? "fa-clock" : "fa-circle-check"} mt-0.5`} aria-hidden="true" />
              <div>
                <h3 className="font-bold">{purchaseResult.status === "pending_manual" ? "Đăng ký đang chờ xử lý thủ công" : "Tên miền đã được đăng ký thành công"}</h3>
                <p className="mt-1 text-sm">{purchaseResult.domain}</p>
                {purchaseResult.status === "pending_manual" && <p className="mt-2 text-sm">Thanh toán đã được ghi nhận. Tên miền sẽ được kích hoạt sau khi quản trị viên hoàn tất xử lý.</p>}
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <Link href="/user/orders" className="inline-flex h-10 items-center rounded-md border border-gray-border px-4 text-sm font-semibold text-[#475569] hover:bg-gray-50">Xem đơn hàng</Link>
              <button type="button" onClick={onClose} className="h-10 rounded-md bg-blue-primary px-4 text-sm font-bold text-white hover:bg-[#154ea0]">Hoàn tất</button>
            </div>
          </div>
        ) : (
          <div className="space-y-5 p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <ContactField label="Họ và tên" value={contact.name} error={contactErrors.name} onChange={(value) => updateContact("name", value)} autoComplete="name" />
              <ContactField label="Email" value={contact.email} error={contactErrors.email} onChange={(value) => updateContact("email", value)} autoComplete="email" type="email" />
              <ContactField label="Số điện thoại" value={contact.phone} error={contactErrors.phone} onChange={(value) => updateContact("phone", value)} autoComplete="tel" maxLength={20} />
              <ContactField label="CCCD (không bắt buộc)" value={contact.cccd ?? ""} error={contactErrors.cccd} onChange={(value) => updateContact("cccd", value)} autoComplete="off" maxLength={20} />
            </div>

            <label className="block text-sm font-semibold text-[#334155]">
              Số năm đăng ký
              <select value={years} onChange={(event) => { setYears(Number(event.target.value)); resetCoupon(); }} className="mt-1.5 h-11 w-full rounded-md border border-gray-border bg-white px-3 font-normal outline-none focus:border-blue-primary">
                {Array.from({ length: 10 }, (_, index) => index + 1).map((year) => <option key={year} value={year}>{year} năm</option>)}
              </select>
            </label>

            <label className="flex cursor-pointer items-start gap-2 text-sm text-[#475569]">
              <input type="checkbox" checked={rememberContact} onChange={(event) => setRememberContact(event.target.checked)} className="mt-0.5 accent-blue-primary" />
              <span>Ghi nhớ họ tên, email và số điện thoại trên thiết bị này. CCCD không được lưu.</span>
            </label>

            <div>
              <label htmlFor="domain-coupon" className="block text-sm font-semibold text-[#334155]">Mã giảm giá</label>
              <div className="mt-1.5 flex gap-2">
                <input id="domain-coupon" value={couponCode} maxLength={50} onChange={(event) => { setCouponCode(event.target.value.toUpperCase()); resetCoupon(); }} placeholder="Nhập mã nếu có" className="h-10 min-w-0 flex-1 rounded-md border border-gray-border px-3 text-sm uppercase outline-none focus:border-blue-primary" />
                <button type="button" onClick={handlePreview} disabled={!normalizedCoupon || isPreviewing} className="h-10 rounded-md border border-blue-primary px-3 text-sm font-bold text-blue-primary disabled:opacity-50">{isPreviewing ? "Đang kiểm tra" : "Áp dụng"}</button>
              </div>
            </div>

            <div className="space-y-2 border-y border-gray-border py-4 text-sm">
              <div className="flex justify-between gap-4"><span>Số dư ví</span><strong>{wallet ? formatCurrency(wallet.balance) : "Đang tải..."}</strong></div>
              <div className="flex justify-between gap-4"><span>{formatCurrency(domainResult.register_price)} × {years} năm</span><strong>{formatCurrency(totalAmount)}</strong></div>
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
                {isSubmitting ? "Đang đăng ký" : "Xác nhận đăng ký"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface ContactFieldProps {
  label: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
  autoComplete: string;
  type?: string;
  maxLength?: number;
}

function ContactField({ label, value, error, onChange, autoComplete, type = "text", maxLength }: ContactFieldProps) {
  return (
    <label className="block text-sm font-semibold text-[#334155]">
      {label}
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} autoComplete={autoComplete} maxLength={maxLength} className="mt-1.5 h-11 w-full rounded-md border border-gray-border px-3 font-normal outline-none focus:border-blue-primary" />
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}
