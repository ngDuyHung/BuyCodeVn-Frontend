"use client";

import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import EmptyState from "@/components/shared/EmptyState";
import ErrorState from "@/components/shared/ErrorState";
import { normalizeApiError } from "@/lib/api-error";
import { formatCurrency } from "@/lib/format";
import { formatBillingCycle, getLowestVpsLocationId, getVpsPrice } from "@/lib/vps";
import { vpsService } from "@/services/client/vpsService";
import type { VpsPlan } from "@/types/services";

const getPlanPrice = (plan: VpsPlan) => {
  const cycles = Object.keys(plan.pricing);
  const cycle = cycles.includes("monthly") ? "monthly" : cycles[0];
  const locationId = getLowestVpsLocationId(plan);
  return {
    cycle,
    price: cycle && locationId ? getVpsPrice(plan, cycle, locationId) : null,
  };
};

function PlanSkeleton() {
  return <div className="h-[330px] animate-pulse rounded-lg border border-[#dce3e5] bg-white p-5" aria-hidden="true">
    <div className="h-3 w-24 rounded bg-[#e7ebec]" />
    <div className="mt-3 h-6 w-36 rounded bg-[#dce3e5]" />
    <div className="mt-6 grid grid-cols-2 gap-3"><div className="h-14 rounded bg-[#f1f4f5]" /><div className="h-14 rounded bg-[#f1f4f5]" /><div className="h-14 rounded bg-[#f1f4f5]" /><div className="h-14 rounded bg-[#f1f4f5]" /></div>
    <div className="mt-6 h-7 w-40 rounded bg-[#dce3e5]" />
    <div className="mt-5 h-10 rounded bg-[#eef2f3]" />
  </div>;
}

export default function HomeVpsPlans() {
  const [plans, setPlans] = useState<VpsPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const gridColumns = loading || plans.length >= 3
    ? "md:grid-cols-3"
    : plans.length === 2
      ? "sm:grid-cols-2"
      : "max-w-md";

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError("");
    try {
      setPlans((await vpsService.getPlans(signal)).slice(0, 3));
    } catch (requestError) {
      if (!axios.isCancel(requestError)) setError(normalizeApiError(requestError).message);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    Promise.resolve().then(() => load(controller.signal));
    return () => controller.abort();
  }, [load, reloadKey]);

  return (
    <section className="bg-[#f4f7f8] py-10 md:py-12 lg:py-16" aria-labelledby="home-vps-title">
      <div className="mx-auto max-w-[1350px] px-4 md:px-5">
        <div className="grid overflow-hidden rounded-lg bg-[#102d46] lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.82fr)]">
          <div className="flex flex-col justify-center px-5 py-8 text-white sm:px-8 lg:px-10 lg:py-10">
            <p className="text-xs font-bold uppercase text-[#f4a340]">Hạ tầng linh hoạt</p>
            <h2 id="home-vps-title" className="mt-2 max-w-2xl text-2xl font-extrabold leading-tight sm:text-3xl">VPS hiệu năng cao cho mọi quy mô</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#d6e2ea] sm:text-[15px]">Chủ động tài nguyên, lựa chọn khu vực và hệ điều hành phù hợp. Hệ thống tự động cấp phát và quản lý VPS tập trung ngay trong tài khoản.</p>
            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[#eef5f7]">
              <span><i className="fas fa-shield-halved mr-2 text-[#65c59a]" aria-hidden="true" />Hạ tầng ổn định</span>
              <span><i className="fas fa-gauge-high mr-2 text-[#f4a340]" aria-hidden="true" />Khởi tạo nhanh</span>
              <span><i className="fas fa-sliders mr-2 text-[#63a8d8]" aria-hidden="true" />Toàn quyền quản trị</span>
            </div>
          </div>
          <div className="relative min-h-48 sm:min-h-60 lg:min-h-full">
            <Image src="/images/image_vps.png" alt="Hệ thống máy chủ VPS" fill sizes="(max-width: 1024px) 100vw, 42vw" className="object-cover object-center" />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(16,45,70,.42),transparent_45%)] lg:block" aria-hidden="true" />
          </div>
        </div>

        <div className="mb-6 mt-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="text-xl font-extrabold text-blue-nav">Gói VPS đề xuất</h3>
            <p className="mt-1 text-sm text-text-muted">Giá hiển thị đã bao gồm mức phụ thu khu vực thấp nhất.</p>
          </div>
          <Link href="/vps" className="inline-flex h-10 items-center gap-2 self-start rounded-md border border-[#b9c7cc] bg-white px-4 text-sm font-semibold text-[#314b59] transition-colors hover:border-blue-primary hover:text-blue-primary sm:self-auto">Xem tất cả cấu hình<i className="fas fa-arrow-right text-xs" aria-hidden="true" /></Link>
        </div>

        {error ? <ErrorState message={error} onRetry={() => setReloadKey((key) => key + 1)} /> : !loading && plans.length === 0 ? <EmptyState title="Chưa có gói VPS khả dụng" description="Các cấu hình VPS đang được cập nhật." /> : (
          <div className={`grid grid-cols-1 gap-4 lg:gap-5 ${gridColumns}`}>
            {loading ? Array.from({ length: 3 }, (_, index) => <PlanSkeleton key={index} />) : plans.map((plan) => {
              const { cycle, price } = getPlanPrice(plan);
              return <article key={plan.id} className="flex min-h-[330px] flex-col rounded-lg border border-[#dce3e5] bg-white p-5 transition-[border-color,box-shadow,transform] hover:-translate-y-1 hover:border-[#9eb7c1] hover:shadow-[0_12px_28px_rgba(26,54,73,.1)]">
                <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase text-[#cc6915]">{plan.group_name || "Cloud VPS"}</p><h4 className="mt-1 text-xl font-extrabold text-blue-nav">{plan.name}</h4></div><span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-[#e8f2f0] text-[#116966]"><i className="fas fa-server" aria-hidden="true" /></span></div>
                <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                  <div className="border-b border-[#edf1f2] pb-2"><dt className="text-xs text-text-muted">CPU</dt><dd className="mt-0.5 font-bold text-[#263d48]">{plan.cpu} vCPU</dd></div>
                  <div className="border-b border-[#edf1f2] pb-2"><dt className="text-xs text-text-muted">RAM</dt><dd className="mt-0.5 font-bold text-[#263d48]">{plan.ram_mb >= 1024 ? `${plan.ram_mb / 1024} GB` : `${plan.ram_mb} MB`}</dd></div>
                  <div className="border-b border-[#edf1f2] pb-2"><dt className="text-xs text-text-muted">SSD</dt><dd className="mt-0.5 font-bold text-[#263d48]">{plan.disk_gb} GB</dd></div>
                  <div className="border-b border-[#edf1f2] pb-2"><dt className="text-xs text-text-muted">Khu vực</dt><dd className="mt-0.5 font-bold text-[#263d48]">{plan.locations.length} lựa chọn</dd></div>
                  <div className="col-span-2"><dt className="text-xs text-text-muted">Băng thông</dt><dd className="mt-0.5 truncate font-bold text-[#263d48]" title={plan.bandwidth}>{plan.bandwidth}</dd></div>
                </dl>
                <div className="mt-auto pt-5"><p className="text-xs text-text-muted">Chỉ từ</p><p className="mt-0.5 text-xl font-extrabold text-[#116966]">{price ? formatCurrency(price) : "Liên hệ"}{cycle && <span className="ml-1 text-xs font-normal text-text-muted">/ {formatBillingCycle(cycle)}</span>}</p><Link href="/vps" className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-blue-primary px-4 text-sm font-bold text-white transition-colors hover:bg-[#124f9e]">Chọn cấu hình<i className="fas fa-arrow-right text-xs" aria-hidden="true" /></Link></div>
              </article>;
            })}
          </div>
        )}
      </div>
    </section>
  );
}
