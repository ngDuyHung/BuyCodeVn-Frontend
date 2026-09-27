"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { normalizeApiError } from "@/lib/api-error";
import { formatCurrency } from "@/lib/format";
import { isValidDomain, normalizeDomain } from "@/lib/validation";
import { orderService } from "@/services/client/orderService";
import type { DomainCheckResult } from "@/types/orders";
import DomainCheckout from "./DomainCheckout";

export default function DomainStorefront() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialDomain = normalizeDomain(searchParams.get("domain") ?? "");
  const [domainInput, setDomainInput] = useState(initialDomain);
  const [result, setResult] = useState<DomainCheckResult | null>(null);
  const [domainError, setDomainError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const checkedInitialDomain = useRef(false);

  const checkDomain = async (rawDomain: string) => {
    const domain = normalizeDomain(rawDomain);
    if (!isValidDomain(domain)) {
      setResult(null);
      setDomainError("Tên miền không hợp lệ, ví dụ: example.com hoặc school.edu.vn.");
      return;
    }

    setDomainInput(domain);
    setDomainError(null);
    setResult(null);
    setShowCheckout(false);
    setIsChecking(true);
    router.replace(`/domains?domain=${encodeURIComponent(domain)}`, { scroll: false });
    try {
      setResult(await orderService.checkDomain(domain));
    } catch (requestError) {
      setDomainError(normalizeApiError(requestError).message);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    if (!initialDomain || checkedInitialDomain.current) return;
    checkedInitialDomain.current = true;
    void checkDomain(initialDomain);
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] py-8 md:py-12">
      <div className="mx-auto max-w-[1350px] px-4 md:px-5">
        <header className="mb-8">
          <div className="mb-2 flex items-center gap-2 text-[13px] text-text-muted">
            <Link href="/" className="transition-colors hover:text-blue-primary">Trang chủ</Link>
            <i className="fas fa-chevron-right text-[10px] text-gray-300" aria-hidden="true" />
            <span className="font-semibold text-[#1e293b]">Tên miền</span>
          </div>
          <h1 className="text-2xl font-extrabold text-blue-nav md:text-[28px]">Tìm và đăng ký tên miền</h1>
          <p className="mt-1 text-sm text-text-muted">Kiểm tra tên miền và đăng ký theo bảng giá hiện hành.</p>
        </header>

        <section className="border-y border-gray-border bg-white px-4 py-8 sm:px-8">
          <form onSubmit={(event) => { event.preventDefault(); void checkDomain(domainInput); }} className="mx-auto flex max-w-3xl flex-col gap-3 sm:flex-row">
            <label htmlFor="domain-search" className="sr-only">Tên miền cần kiểm tra</label>
            <div className="relative min-w-0 flex-1">
              <i className="fas fa-globe absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
              <input id="domain-search" value={domainInput} onChange={(event) => { setDomainInput(event.target.value); setDomainError(null); }} placeholder="Nhập tên miền, ví dụ example.com" autoComplete="url" className="h-12 w-full rounded-md border border-gray-border pl-11 pr-4 text-sm outline-none transition focus:border-blue-primary" />
            </div>
            <button type="submit" disabled={isChecking} className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-md bg-blue-primary px-6 text-sm font-bold text-white hover:bg-[#154ea0] disabled:opacity-60">
              {isChecking && <i className="fas fa-spinner fa-spin" aria-hidden="true" />}
              {isChecking ? "Đang kiểm tra" : "Kiểm tra tên miền"}
            </button>
          </form>
        </section>

        <div className="mx-auto mt-6 max-w-3xl" aria-live="polite">
          {domainError && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-5 text-sm text-red-700">{domainError}</div>}
          {result && (
            <section className={`rounded-lg border bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,.04)] ${result.is_available ? "border-green-200" : "border-red-200"}`}>
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <i className={`fas ${result.is_available ? "fa-circle-check text-green-600" : "fa-circle-xmark text-red-600"} mt-1 text-xl`} aria-hidden="true" />
                  <div>
                    <h2 className="text-lg font-extrabold text-blue-nav">{result.domain}</h2>
                    <p className={`mt-1 text-sm ${result.is_available ? "text-green-700" : "text-red-700"}`}>{result.message}</p>
                    <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-[#475569]">
                      <span>Đăng ký: <strong className="text-orange-main">{formatCurrency(result.register_price)}/năm</strong></span>
                      <span>Gia hạn: <strong className="text-blue-nav">{formatCurrency(result.renew_price)}/năm</strong></span>
                    </div>
                  </div>
                </div>
                {result.is_available && <button type="button" onClick={() => setShowCheckout(true)} className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-md bg-orange-main px-5 text-sm font-bold text-white hover:bg-orange-dark"><i className="fas fa-cart-shopping" aria-hidden="true" />Đăng ký ngay</button>}
              </div>
            </section>
          )}
        </div>
      </div>

      {showCheckout && result?.is_available && <DomainCheckout domainResult={result} onClose={() => setShowCheckout(false)} />}
    </div>
  );
}
