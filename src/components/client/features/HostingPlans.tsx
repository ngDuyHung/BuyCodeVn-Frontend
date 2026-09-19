"use client";

import Link from "next/link";
import HostingPlanCard from "@/components/client/hosting/HostingPlanCard";
import EmptyState from "@/components/shared/EmptyState";
import ErrorState from "@/components/shared/ErrorState";
import { useHostingPlans } from "@/hooks/client/useHostingPlans";

export default function HostingPlans() {
  const { plans, isLoading, error, retry } = useHostingPlans({ per_page: 5 });

  return (
    <section className="bg-[#f8fafc] py-10 lg:py-[60px] lg:pb-[70px]">
      <div className="mx-auto max-w-[1350px] px-4 md:px-5">
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-xl font-extrabold uppercase text-blue-nav">Gói hosting khuyến nghị</h2>
            <p className="mt-1 text-[15px] text-text-muted">
              Hiệu suất cao - Bảo mật - Giá cả hợp lý
            </p>
          </div>
          <Link
            href="/hosting"
            className="inline-flex h-10 items-center gap-2 self-start rounded-md border border-gray-border px-4 text-sm font-semibold text-[#475569] hover:border-blue-primary hover:text-blue-primary md:self-auto"
          >
            Xem tất cả
            <i className="fas fa-arrow-right text-xs" aria-hidden="true" />
          </Link>
        </div>

        {error ? (
          <ErrorState message={error} onRetry={retry} />
        ) : !isLoading && plans.length === 0 ? (
          <EmptyState
            title="Chưa có gói hosting khả dụng"
            description="Các gói đang hoạt động sẽ xuất hiện tại đây."
          />
        ) : (
          <div className="grid grid-cols-1 items-start gap-[18px] sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {isLoading
              ? Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="h-[350px] animate-pulse rounded-lg border border-gray-border bg-white p-5">
                    <div className="h-5 w-1/2 rounded bg-gray-200" />
                    <div className="mt-3 h-4 w-4/5 rounded bg-gray-100" />
                    <div className="mt-5 h-7 w-2/3 rounded bg-gray-200" />
                  </div>
                ))
              : plans.map((plan) => <HostingPlanCard key={plan.id} plan={plan} />)}
          </div>
        )}
      </div>
    </section>
  );
}
