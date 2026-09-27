"use client";

import { useState } from "react";
import { createIdempotencyKey } from "@/lib/idempotency";
import { normalizeApiError } from "@/lib/api-error";
import { formatCurrency, formatDate } from "@/lib/format";
import { multiplyMoney } from "@/lib/money";
import { orderService } from "@/services/client/orderService";
import type { RenewDomainResult } from "@/types/orders";
import type { UserService } from "@/types/services";

const renewalMessages: Record<RenewDomainResult["status"], string> = {
  success: "Gia hạn tên miền thành công.",
  pending_manual: "Yêu cầu đã được tiếp nhận và đang chờ xử lý thủ công.",
  failed: "Nhà cung cấp không thể gia hạn tên miền.",
};

export default function DomainServiceActions({ service, onUpdated }: { service: UserService; onUpdated: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [years, setYears] = useState(1);
  const [renewalKey, setRenewalKey] = useState(() => createIdempotencyKey("domain-renew", service.id));
  const [result, setResult] = useState<RenewDomainResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!service.actions.can_renew) return null;

  const submit = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await orderService.renewDomain(service.id, {
        years,
        idempotency_key: renewalKey,
      });
      setResult(response.data);
      onUpdated();
    } catch (requestError) {
      setError(normalizeApiError(requestError).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-4 border-t border-gray-border pt-4">
      {!isOpen ? (
        <button type="button" onClick={() => setIsOpen(true)} className="inline-flex h-9 items-center gap-2 rounded-md bg-blue-primary px-3 text-sm font-bold text-white hover:bg-[#154ea0]"><i className="fas fa-rotate" aria-hidden="true" /> Gia hạn tên miền</button>
      ) : (
        <div className="border-l-4 border-blue-primary bg-[#f8fafc] p-4">
          <div className="mb-3 flex items-start justify-between gap-3"><h3 className="font-bold text-blue-nav">Gia hạn {service.domain_name}</h3><button type="button" onClick={() => { setIsOpen(false); setResult(null); setError(null); }} aria-label="Đóng" className="size-8 text-text-muted hover:text-blue-nav"><i className="fas fa-xmark" aria-hidden="true" /></button></div>
          {error && <p role="alert" className="mb-3 text-sm font-medium text-red-600">{error}</p>}
          {!result ? (
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-[#475569]">Số năm
                <select value={years} onChange={(event) => { setYears(Number(event.target.value)); setRenewalKey(createIdempotencyKey("domain-renew", service.id)); }} className="mt-1 h-10 w-full rounded-md border border-gray-border bg-white px-3 font-normal outline-none focus:border-blue-primary">
                  {Array.from({ length: 10 }, (_, index) => index + 1).map((value) => <option key={value} value={value}>{value} năm</option>)}
                </select>
              </label>
              {service.tld_pricing?.renew_price && <p className="text-sm text-[#475569]">Chi phí dự kiến: <strong className="text-orange-main">{formatCurrency(multiplyMoney(service.tld_pricing.renew_price, years))}</strong></p>}
              <button type="button" disabled={isSubmitting} onClick={submit} className="h-10 rounded-md bg-blue-primary px-4 text-sm font-bold text-white disabled:opacity-50">{isSubmitting ? "Đang gửi yêu cầu..." : "Xác nhận gia hạn"}</button>
            </div>
          ) : (
            <div className="space-y-2 text-sm">
              <p className={`font-semibold ${result.status === "failed" ? "text-red-600" : result.status === "pending_manual" ? "text-amber-700" : "text-green-700"}`}>{result.idempotent ? "Yêu cầu này đã được xử lý trước đó, không phát sinh giao dịch mới." : renewalMessages[result.status]}</p>
              <p>Trạng thái: <strong>{result.status === "success" ? "Thành công" : result.status === "pending_manual" ? "Chờ xử lý thủ công" : "Thất bại"}</strong></p>
              {result.expires_at && <p>Hạn sử dụng mới: <strong>{formatDate(result.expires_at)}</strong></p>}
              <p>Đơn hàng: <strong>#{result.order_id}</strong></p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
