"use client";

import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import EmptyState from "@/components/shared/EmptyState";
import ErrorState from "@/components/shared/ErrorState";
import VpsPlanCard from "@/components/client/vps/VpsPlanCard";
import { normalizeApiError } from "@/lib/api-error";
import { vpsService } from "@/services/client/vpsService";
import type { VpsPlan } from "@/types/services";

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

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError("");
    try {
      setPlans((await vpsService.getPlans(signal)).slice(0, 4));
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
          <div className="flex flex-col justify-center px-5 py-7 text-white sm:px-8 sm:py-9 lg:px-10 lg:py-10">
            <p className="text-xs font-bold uppercase text-[#f4a340]">Hạ tầng linh hoạt</p>
            <h2 id="home-vps-title" className="mt-2 max-w-2xl text-2xl font-extrabold leading-tight sm:text-3xl">VPS hiệu năng cao cho mọi quy mô</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#d6e2ea] sm:text-[15px]">Chủ động tài nguyên, lựa chọn khu vực và hệ điều hành phù hợp. Hệ thống tự động cấp phát và quản lý VPS tập trung ngay trong tài khoản.</p>
            <div className="mt-5 grid grid-cols-2 gap-2 text-xs font-semibold text-[#eef5f7] sm:flex sm:flex-wrap sm:gap-x-5 sm:gap-y-2 sm:text-sm">
              <span><i className="fas fa-shield-halved mr-1.5 text-[#65c59a] sm:mr-2" aria-hidden="true" />Hạ tầng ổn định</span>
              <span><i className="fas fa-gauge-high mr-1.5 text-[#f4a340] sm:mr-2" aria-hidden="true" />Khởi tạo nhanh</span>
              <span><i className="fas fa-sliders mr-1.5 text-[#63a8d8] sm:mr-2" aria-hidden="true" />Toàn quyền quản trị</span>
              <span><i className="fas fa-location-dot mr-1.5 text-[#65c59a] sm:mr-2" aria-hidden="true" />Nhiều khu vực</span>
            </div>
            <Link href="/vps" className="mt-6 inline-flex h-10 items-center gap-2 self-start rounded-md bg-white px-4 text-sm font-bold text-[#173b51] transition hover:bg-[#e8f2f0]">Khám phá VPS<i className="fas fa-arrow-right text-[10px]" aria-hidden="true" /></Link>
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 xl:gap-5">
            {loading ? Array.from({ length: 4 }, (_, index) => <PlanSkeleton key={index} />) : plans.map((plan) => <VpsPlanCard key={plan.id} plan={plan} actionHref="/vps" actionLabel="Chọn cấu hình" />)}
          </div>
        )}
      </div>
    </section>
  );
}
