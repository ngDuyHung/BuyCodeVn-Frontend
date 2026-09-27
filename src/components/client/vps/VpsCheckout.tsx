"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ErrorState from "@/components/shared/ErrorState";
import { useDialogAccessibility } from "@/hooks/useDialogAccessibility";
import { normalizeApiError } from "@/lib/api-error";
import { formatCurrency } from "@/lib/format";
import { isMoneyLessThan } from "@/lib/money";
import { createVpsRequestId, formatBillingCycle, getLowestVpsLocationId, getVpsPrice, isValidVpsHostname } from "@/lib/vps";
import { financeService } from "@/services/client/financeService";
import { orderService } from "@/services/client/orderService";
import { useAuthStore } from "@/stores/authStore";
import type { Wallet } from "@/types/finance";
import type { BuyVpsResult } from "@/types/orders";
import type { VpsOsImage, VpsPlan } from "@/types/services";

interface Props {
  plan: VpsPlan;
  osImages: VpsOsImage[];
  onClose: () => void;
}

export default function VpsCheckout({ plan, osImages, onClose }: Props) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isSessionReady = useAuthStore((state) => state.isSessionReady);
  const cycles = Object.keys(plan.pricing);
  const [cycle, setCycle] = useState(cycles[0] ?? "");
  const [locationId, setLocationId] = useState(() => getLowestVpsLocationId(plan));
  const [osImageId, setOsImageId] = useState(osImages[0]?.id ?? 0);
  const [hostname, setHostname] = useState("");
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [walletError, setWalletError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [requestKey, setRequestKey] = useState(createVpsRequestId);
  const [result, setResult] = useState<BuyVpsResult | null>(null);
  const [reconciling, setReconciling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const dialogRef = useDialogAccessibility(true, onClose, !busy);
  const price = getVpsPrice(plan, cycle, locationId);
  const insufficient = wallet && price ? isMoneyLessThan(wallet.balance, price) : false;
  const hostnameValid = isValidVpsHostname(hostname.trim());

  useEffect(() => {
    if (!isAuthenticated) return;
    const controller = new AbortController();
    financeService.getWallet(controller.signal)
      .then(setWallet)
      .catch((requestError) => {
        if (!controller.signal.aborted) setWalletError(normalizeApiError(requestError).message);
      });
    return () => controller.abort();
  }, [isAuthenticated, reloadKey]);

  const resetOperation = () => {
    setRequestKey(createVpsRequestId());
    setError(null);
    setReconciling(false);
  };

  const submit = async () => {
    if (busy || !price || !hostnameValid || !wallet || insufficient || !osImageId) return;
    setBusy(true);
    setError(null);
    try {
      const response = await orderService.buyVps({
        vps_plan_id: plan.id,
        os_image_id: osImageId,
        billing_cycle: cycle,
        hostname: hostname.trim(),
        location_id: locationId,
        idempotency_key: requestKey,
      });
      setResult(response.data);
      setReconciling(response.data.status === "reconciling");
    } catch (requestError) {
      const apiError = normalizeApiError(requestError);
      setReconciling(apiError.status === 409 || !apiError.status || apiError.status >= 500);
      setError(apiError.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="vps-checkout-title" className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) onClose(); }}>
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white shadow-2xl">
        <header className="flex items-start justify-between border-b border-gray-border px-5 py-4">
          <div><h2 id="vps-checkout-title" className="text-lg font-extrabold text-blue-nav">Đăng ký VPS</h2><p className="mt-1 text-sm text-text-muted">{plan.name}</p></div>
          <button type="button" onClick={onClose} disabled={busy} aria-label="Đóng" className="size-9 text-gray-500 disabled:opacity-50"><i className="fas fa-xmark" aria-hidden="true" /></button>
        </header>
        <div className="space-y-4 p-5">
          {!isSessionReady ? <p className="text-sm text-text-muted">Đang kiểm tra tài khoản...</p> : !isAuthenticated ? (
            <div className="space-y-3 text-sm"><p>Đăng nhập để tiếp tục đăng ký VPS.</p><Link href="/login?returnUrl=%2Fvps" className="inline-flex rounded-md bg-blue-primary px-4 py-2.5 font-semibold text-white">Đăng nhập</Link></div>
          ) : result ? (
            <div className="space-y-3 text-sm">
              <p className="font-bold text-blue-nav">{result.status === "active" ? "VPS đã được kích hoạt" : "Đơn VPS đã được tiếp nhận"}</p>
              <p>Máy chủ: <strong>{result.hostname}</strong></p>
              <p>Trạng thái: <strong>{result.status}</strong></p>
              {reconciling && <p className="border-l-4 border-amber-400 bg-amber-50 p-3 text-amber-800">Hệ thống đang đối soát với nhà cung cấp. Không tạo yêu cầu mua mới.</p>}
              {result.idempotent && <p>Yêu cầu trước đã được xử lý, không trừ ví lần nữa.</p>}
              <Link href="/user/vps" className="inline-flex rounded-md bg-blue-primary px-4 py-2.5 font-semibold text-white">Quản lý VPS</Link>
            </div>
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-sm font-semibold text-[#475569]">Chu kỳ
                  <select value={cycle} disabled={reconciling} onChange={(event) => { setCycle(event.target.value); resetOperation(); }} className="mt-1 h-10 w-full rounded-md border border-gray-border bg-white px-3 font-normal">{cycles.map((value) => <option key={value} value={value}>{formatBillingCycle(value)}</option>)}</select>
                </label>
                <label className="text-sm font-semibold text-[#475569]">Khu vực
                  <select value={locationId} disabled={reconciling} onChange={(event) => { setLocationId(Number(event.target.value)); resetOperation(); }} className="mt-1 h-10 w-full rounded-md border border-gray-border bg-white px-3 font-normal">{plan.locations.map((location) => <option key={location.id} value={location.id}>{location.name} (+{formatCurrency(location.surcharge)})</option>)}</select>
                </label>
                <label className="text-sm font-semibold text-[#475569]">Hệ điều hành
                  <select value={osImageId} disabled={reconciling} onChange={(event) => { setOsImageId(Number(event.target.value)); resetOperation(); }} className="mt-1 h-10 w-full rounded-md border border-gray-border bg-white px-3 font-normal">{osImages.map((os) => <option key={os.id} value={os.id}>{os.name}</option>)}</select>
                </label>
                <label className="text-sm font-semibold text-[#475569]">Hostname
                  <input value={hostname} disabled={reconciling} onChange={(event) => { setHostname(event.target.value); resetOperation(); }} placeholder="web-01" maxLength={63} className="mt-1 h-10 w-full rounded-md border border-gray-border px-3 font-normal" />
                </label>
              </div>
              {hostname && !hostnameValid && <p role="alert" className="text-sm text-red-600">Hostname dài 3–63 ký tự, gồm chữ thường, số, dấu chấm, gạch dưới hoặc gạch ngang; bắt đầu và kết thúc bằng chữ hoặc số.</p>}
              <div className="space-y-1 border-y border-gray-border py-3 text-sm"><p>Giá chu kỳ và phụ thu: <strong>{price ? formatCurrency(price) : "Không khả dụng"}</strong></p><p>Số dư ví: <strong>{wallet ? formatCurrency(wallet.balance) : "Đang tải..."}</strong></p></div>
              {walletError && <ErrorState message={walletError} onRetry={() => { setWalletError(null); setReloadKey((key) => key + 1); }} />}
              {insufficient && <p className="text-sm text-amber-700">Số dư không đủ. Vui lòng nạp tiền trước khi đăng ký.</p>}
              {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
              {reconciling && <p className="border-l-4 border-amber-400 bg-amber-50 p-3 text-sm text-amber-800">Yêu cầu chưa được xác nhận hoàn tất. Kiểm tra lỗi phía trên; khi thử lại, hệ thống giữ cùng mã yêu cầu và cấu hình để tránh giao dịch trùng.</p>}
              <div className="flex justify-end gap-2"><button type="button" onClick={onClose} disabled={busy} className="rounded-md border border-gray-border px-4 py-2 text-sm">Hủy</button><button type="button" onClick={submit} disabled={busy || !hostnameValid || !price || !wallet || Boolean(insufficient) || !osImageId} className="rounded-md bg-blue-primary px-4 py-2 text-sm font-bold text-white disabled:opacity-50">{busy ? "Đang tạo VPS..." : reconciling ? "Thử lại yêu cầu" : "Xác nhận thanh toán"}</button></div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
