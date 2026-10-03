"use client";

import Link from "next/link";
import Image from "next/image";
import HostingPlanCard from "@/components/client/hosting/HostingPlanCard";
import EmptyState from "@/components/shared/EmptyState";
import ErrorState from "@/components/shared/ErrorState";
import { useHostingPlans } from "@/hooks/client/useHostingPlans";

export default function HostingPlans() {
  const { plans, isLoading, error, retry } = useHostingPlans({ per_page: 4 });
  const featuredPlans = plans.slice(0, 4);

  return (
    <section className="bg-white py-10 md:py-12 lg:py-16" aria-labelledby="home-hosting-title">
      <div className="mx-auto max-w-[1350px] px-4 md:px-5">
        <div className="grid overflow-hidden rounded-lg border border-[#dce8e5] bg-[var(--color-blue-primary-soft)] lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.82fr)]">
          <div className="flex flex-col justify-center px-5 py-7 sm:px-8 sm:py-9 lg:px-10 lg:py-10">
            <p className="text-xs font-bold uppercase text-[var(--color-blue-primary)]">Nền tảng website ổn định</p>
            <h2 id="home-hosting-title" className="mt-2 max-w-2xl text-2xl font-extrabold leading-tight text-[var(--color-blue-nav)] sm:text-3xl">Hosting tốc độ cao, vận hành nhẹ nhàng</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#526b73] sm:text-[15px]">Hạ tầng tối ưu cho website, quản lý trực quan và bảo vệ dữ liệu chủ động. Chọn cấu hình phù hợp rồi kích hoạt ngay trong tài khoản.</p>
            <div className="mt-5 grid grid-cols-2 gap-2 text-xs font-semibold text-[#35535d] sm:flex sm:flex-wrap sm:gap-x-5 sm:gap-y-2 sm:text-sm">
              <span><i className="fas fa-gauge-high mr-1.5 text-[var(--color-blue-primary)] sm:mr-2" aria-hidden="true" />Tốc độ cao</span>
              <span><i className="fas fa-shield-halved mr-1.5 text-[var(--color-blue-primary)] sm:mr-2" aria-hidden="true" />Sao lưu an toàn</span>
              <span><i className="fas fa-headset mr-1.5 text-[var(--color-blue-primary)] sm:mr-2" aria-hidden="true" />Hỗ trợ 24/7</span>
              <span><i className="fas fa-arrow-trend-up mr-1.5 text-[var(--color-blue-primary)] sm:mr-2" aria-hidden="true" />Dễ nâng cấp</span>
            </div>
            <Link href="/hosting" className="mt-6 inline-flex h-10 items-center gap-2 self-start rounded-md bg-[var(--color-blue-primary)] px-4 text-sm font-bold text-white transition hover:bg-[var(--color-blue-primary-hover)]">Khám phá hosting<i className="fas fa-arrow-right text-[10px]" aria-hidden="true" /></Link>
          </div>
          <div className="relative min-h-48 sm:min-h-60 lg:min-h-full"><Image src="/images/hosting-infrastructure.webp" alt="Hạ tầng máy chủ hosting hiện đại" fill sizes="(max-width: 1024px) 100vw, 42vw" className="object-cover object-center" /></div>
        </div>

        <div className="mb-6 mt-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><h3 className="text-xl font-extrabold text-[var(--color-blue-nav)]">Gói hosting khuyến nghị</h3><p className="mt-1 text-sm text-[#64757c]">Cấu hình cân bằng giữa hiệu suất, dung lượng và chi phí.</p></div><Link href="/hosting" className="inline-flex h-10 items-center gap-2 self-start rounded-md border border-[#b9c7cc] bg-white px-4 text-sm font-semibold text-[#314b59] transition-colors hover:border-[var(--color-blue-primary)] hover:text-[var(--color-blue-primary)] sm:self-auto">Xem tất cả gói<i className="fas fa-arrow-right text-xs" aria-hidden="true" /></Link></div>

        {error ? (
          <ErrorState message={error} onRetry={retry} />
        ) : !isLoading && featuredPlans.length === 0 ? (
          <EmptyState
            title="Chưa có gói hosting khả dụng"
            description="Các gói đang hoạt động sẽ xuất hiện tại đây."
          />
        ) : (
          <div className="-mx-4 grid snap-x snap-mandatory grid-flow-col auto-cols-[minmax(280px,84vw)] items-stretch gap-4 overflow-x-auto scroll-px-4 px-4 pb-4 [scrollbar-width:none] [&>*]:snap-start [&::-webkit-scrollbar]:hidden sm:mx-0 sm:grid-flow-row sm:auto-cols-auto sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 xl:grid-cols-4 xl:gap-5">
            {isLoading
              ? Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="h-[445px] animate-pulse rounded-lg border border-gray-border bg-white p-5">
                    <div className="h-5 w-1/2 rounded bg-gray-200" />
                    <div className="mt-3 h-4 w-4/5 rounded bg-gray-100" />
                    <div className="mt-5 h-7 w-2/3 rounded bg-gray-200" />
                  </div>
                ))
              : featuredPlans.map((plan) => <HostingPlanCard key={plan.id} plan={plan} />)}
          </div>
        )}
      </div>
    </section>
  );
}
