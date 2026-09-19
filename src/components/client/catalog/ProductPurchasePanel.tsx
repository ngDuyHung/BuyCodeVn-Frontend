"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { ApiError, normalizeApiError } from "@/lib/api-error";
import { saveBlob } from "@/lib/download";
import { formatCurrency } from "@/lib/format";
import { isMoneyLessThan } from "@/lib/money";
import { financeService } from "@/services/client/financeService";
import { orderService } from "@/services/client/orderService";
import { useAuthStore } from "@/stores/authStore";
import type { Product } from "@/types/catalog";
import type { Wallet } from "@/types/finance";
import type { CouponPreview } from "@/types/orders";

interface ProductPurchasePanelProps {
  product: Product;
}

const getDownloadErrorMessage = (error: ApiError) => {
  if (error.status === 403) return "Bạn chưa sở hữu sản phẩm này.";
  if (error.status === 404) return "File tải xuống hiện không còn tồn tại.";
  return error.message;
};

export default function ProductPurchasePanel({
  product,
}: ProductPurchasePanelProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isSessionReady = useAuthStore((state) => state.isSessionReady);
  const [isOpen, setIsOpen] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [preview, setPreview] = useState<CouponPreview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPurchased, setIsPurchased] = useState(false);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [isCheckingAccount, setIsCheckingAccount] = useState(false);
  const [accountError, setAccountError] = useState<string | null>(null);

  const normalizedCoupon = couponCode.replace(/\s+/g, "").toUpperCase();
  const productPrice = product.price;
  const hasUnappliedCoupon =
    Boolean(normalizedCoupon) && normalizedCoupon !== appliedCoupon;
  const finalAmount = preview?.final_amount ?? productPrice;
  const hasInsufficientBalance = wallet
    ? isMoneyLessThan(wallet.balance, finalAmount)
    : false;
  const returnUrl = `/source-code/${product.slug}`;

  const purchaseLabel = useMemo(() => {
    if (!product.is_active) return "Sản phẩm đã ngừng bán";
    if (isPurchasing) return "Đang xử lý thanh toán";
    return "Mua ngay";
  }, [isPurchasing, product.is_active]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isPurchasing) setIsOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isPurchasing]);

  useEffect(() => {
    if (!isSessionReady || !isAuthenticated) {
      return;
    }

    const controller = new AbortController();
    Promise.resolve()
      .then(() => {
        if (controller.signal.aborted) return null;
        setIsCheckingAccount(true);
        setAccountError(null);
        return Promise.all([
          financeService.getWallet(controller.signal),
          orderService.hasCompletedProduct(product.id, controller.signal),
        ]);
      })
      .then((result) => {
        if (!result) return;
        const [walletData, ownsProduct] = result;
        setWallet(walletData);
        setIsPurchased(ownsProduct);
      })
      .catch((accountRequestError) => {
        if (!controller.signal.aborted) {
          setAccountError(normalizeApiError(accountRequestError).message);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsCheckingAccount(false);
      });

    return () => controller.abort();
  }, [isAuthenticated, isSessionReady, product.id]);

  const handleCouponChange = (value: string) => {
    setCouponCode(value.toUpperCase());
    setPreview(null);
    setAppliedCoupon("");
    setError(null);
  };

  const handlePreviewCoupon = async () => {
    if (!normalizedCoupon || isPreviewing) return;
    setIsPreviewing(true);
    setError(null);
    try {
      const response = await orderService.previewCoupon({
        coupon_code: normalizedCoupon,
        total_amount: productPrice,
      });
      setPreview(response.data);
      setAppliedCoupon(normalizedCoupon);
    } catch (couponError) {
      setPreview(null);
      setAppliedCoupon("");
      setError(normalizeApiError(couponError).message);
    } finally {
      setIsPreviewing(false);
    }
  };

  const handleBuy = async () => {
    if (isPurchasing || hasUnappliedCoupon) return;
    setIsPurchasing(true);
    setError(null);
    try {
      const response = await orderService.buyProduct({
        product_id: product.id,
        ...(appliedCoupon ? { coupon_code: appliedCoupon } : {}),
      });
      setIsPurchased(true);
      setIsOpen(false);
      toast.success(response.message);
      try {
        setWallet(await financeService.getWallet());
      } catch {
        setAccountError("Không thể làm mới số dư ví.");
      }
    } catch (purchaseError) {
      const apiError = normalizeApiError(purchaseError);
      const normalizedMessage = apiError.message.toLocaleLowerCase("vi");
      if (
        normalizedMessage.includes("sở hữu") ||
        normalizedMessage.includes("mua lại")
      ) {
        setIsPurchased(true);
        setIsOpen(false);
      }
      setError(apiError.message);
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleDownload = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    setError(null);
    try {
      const file = await orderService.downloadProduct(product.id);
      saveBlob(file.blob, file.filename);
      toast.success("Đã bắt đầu tải sản phẩm.");
    } catch (downloadError) {
      const apiError = normalizeApiError(downloadError);
      setError(getDownloadErrorMessage(apiError));
      if (apiError.status === 403) setIsPurchased(false);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="mt-7 border-t border-gray-border pt-6">
      {!isSessionReady ? (
        <button
          type="button"
          disabled
          className="inline-flex h-11 min-w-40 items-center justify-center rounded-lg bg-gray-200 px-5 text-sm font-bold text-gray-500"
        >
          Đang kiểm tra tài khoản
        </button>
      ) : !isAuthenticated ? (
        <Link
          href={`/login?returnUrl=${encodeURIComponent(returnUrl)}`}
          className="inline-flex h-11 items-center gap-2 rounded-lg bg-orange-main px-5 text-sm font-bold text-white transition-colors hover:bg-orange-dark"
        >
          <i className="fas fa-right-to-bracket text-xs" aria-hidden="true" />
          Đăng nhập để mua
        </Link>
      ) : isCheckingAccount ? (
        <button
          type="button"
          disabled
          className="inline-flex h-11 min-w-44 items-center justify-center gap-2 rounded-lg bg-gray-200 px-5 text-sm font-bold text-gray-500"
        >
          <i className="fas fa-spinner fa-spin" aria-hidden="true" />
          Đang kiểm tra giao dịch
        </button>
      ) : isPurchased ? (
        <button
          type="button"
          onClick={handleDownload}
          disabled={isDownloading}
          className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#15803d] px-5 text-sm font-bold text-white transition-colors hover:bg-[#166534] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <i
            className={`fas ${isDownloading ? "fa-spinner fa-spin" : "fa-download"}`}
            aria-hidden="true"
          />
          {isDownloading ? "Đang chuẩn bị file" : "Tải mã nguồn"}
        </button>
      ) : (
        <button
          type="button"
          onClick={() => {
            setError(null);
            setIsOpen(true);
          }}
          disabled={!product.is_active}
          className="inline-flex h-11 items-center gap-2 rounded-lg bg-orange-main px-5 text-sm font-bold text-white transition-colors hover:bg-orange-dark disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          <i className="fas fa-wallet text-xs" aria-hidden="true" />
          {purchaseLabel}
        </button>
      )}

      {error && !isOpen && (
        <p role="alert" className="mt-3 text-sm font-medium text-red-600">
          {error}
        </p>
      )}

      {accountError && !isOpen && (
        <p className="mt-2 text-xs text-amber-700">{accountError}</p>
      )}

      {isAuthenticated && !isPurchased && product.is_active && (
        <p className="mt-2 text-xs text-text-muted">
          Thanh toán một lần bằng số dư ví.
        </p>
      )}

      {isOpen && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/55 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="purchase-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isPurchasing) {
              setIsOpen(false);
            }
          }}
        >
          <div className="w-full max-w-md rounded-lg bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-gray-border px-5 py-4">
              <div className="min-w-0 pr-4">
                <h2
                  id="purchase-title"
                  className="text-lg font-extrabold text-blue-nav"
                >
                  Xác nhận mua sản phẩm
                </h2>
                <p className="mt-1 truncate text-sm text-text-muted">
                  {product.title}
                </p>
              </div>
              <button
                type="button"
                aria-label="Đóng"
                onClick={() => setIsOpen(false)}
                disabled={isPurchasing}
                className="flex size-9 shrink-0 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-40"
              >
                <i className="fas fa-times" aria-hidden="true" />
              </button>
            </div>

            <div className="space-y-5 p-5">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between gap-4 text-[#475569]">
                  <span>Số dư ví</span>
                  <strong>
                    {wallet ? formatCurrency(wallet.balance) : "Chưa tải được"}
                  </strong>
                </div>
                <div className="flex justify-between gap-4 text-[#475569]">
                  <span>Giá sản phẩm</span>
                  <strong>{formatCurrency(product.price)}</strong>
                </div>
                <div className="flex justify-between gap-4 text-[#475569]">
                  <span>Giảm giá</span>
                  <strong className="text-[#15803d]">
                    -{formatCurrency(preview?.discount_amount ?? 0)}
                  </strong>
                </div>
                <div className="flex justify-between gap-4 border-t border-gray-border pt-3 text-base text-blue-nav">
                  <span className="font-bold">Thanh toán</span>
                  <strong className="text-xl text-orange-main">
                    {formatCurrency(finalAmount)}
                  </strong>
                </div>
              </div>

              {hasInsufficientBalance && (
                <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-800">
                  Số dư ví không đủ để hoàn tất giao dịch này.
                </p>
              )}

              <div>
                <label
                  htmlFor="coupon-code"
                  className="mb-1.5 block text-sm font-semibold text-[#334155]"
                >
                  Mã giảm giá
                </label>
                <div className="flex gap-2">
                  <input
                    id="coupon-code"
                    value={couponCode}
                    onChange={(event) => handleCouponChange(event.target.value)}
                    maxLength={50}
                    disabled={isPurchasing}
                    placeholder="Nhập mã nếu có"
                    className="h-10 min-w-0 flex-1 rounded-lg border border-gray-border px-3 text-sm uppercase outline-none focus:border-blue-primary"
                  />
                  <button
                    type="button"
                    onClick={handlePreviewCoupon}
                    disabled={!normalizedCoupon || isPreviewing || isPurchasing}
                    className="h-10 shrink-0 rounded-lg border border-blue-primary px-3 text-sm font-bold text-blue-primary hover:bg-[#eef4ff] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isPreviewing ? "Đang kiểm tra" : "Áp dụng"}
                  </button>
                </div>
                {preview && appliedCoupon && (
                  <p className="mt-2 text-xs font-semibold text-[#15803d]">
                    Mã {appliedCoupon} đã được áp dụng.
                  </p>
                )}
                {hasUnappliedCoupon && (
                  <p className="mt-2 text-xs text-text-muted">
                    Áp dụng mã trước khi xác nhận thanh toán.
                  </p>
                )}
              </div>

              {error && (
                <p
                  role="alert"
                  className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700"
                >
                  {error}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3 border-t border-gray-border px-5 py-4">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                disabled={isPurchasing}
                className="h-10 rounded-lg border border-gray-border px-4 text-sm font-semibold text-[#475569] hover:bg-gray-50 disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleBuy}
                disabled={
                  isPurchasing || hasUnappliedCoupon || hasInsufficientBalance
                }
                className="inline-flex h-10 min-w-32 items-center justify-center gap-2 rounded-lg bg-orange-main px-4 text-sm font-bold text-white hover:bg-orange-dark disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isPurchasing && (
                  <i className="fas fa-spinner fa-spin" aria-hidden="true" />
                )}
                {isPurchasing ? "Đang thanh toán" : "Xác nhận mua"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
