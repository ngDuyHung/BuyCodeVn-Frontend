"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import EmptyState from "@/components/shared/EmptyState";
import ErrorState from "@/components/shared/ErrorState";
import Pagination from "@/components/shared/Pagination";
import { useHostingPlans } from "@/hooks/client/useHostingPlans";
import { useServerCategories } from "@/hooks/client/useServerCategories";
import { parseHostingQuery, toHostingSearchParams } from "@/lib/hosting-query";
import type { HostingPlan } from "@/types/services";
import HostingCheckout from "./HostingCheckout";
import HostingPlanCard from "./HostingPlanCard";

export default function HostingStorefront() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const requestedPlanId = Number(searchParams.get("plan"));
  const initialQuery = parseHostingQuery(
    new URLSearchParams(searchParams.toString()),
  );
  const [page, setPage] = useState(initialQuery.page ?? 1);
  const [serverCategory, setServerCategory] = useState(
    String(initialQuery.server_category ?? ""),
  );
  const [selectedPlan, setSelectedPlan] = useState<HostingPlan | null>(null);
  const {
    categories,
    isLoading: categoriesLoading,
    error: categoriesError,
    retry: retryCategories,
  } = useServerCategories();
  const { plans, meta, isLoading, error, retry } = useHostingPlans({
    page,
    per_page: 12,
    server_category: serverCategory || undefined,
  });

  useEffect(() => {
    const query = toHostingSearchParams(
      { server_category: serverCategory || undefined, page },
      requestedPlanId,
    ).toString();
    const currentQuery = searchParams.toString();
    if (query !== currentQuery) {
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    }
  }, [page, pathname, requestedPlanId, router, searchParams, serverCategory]);

  useEffect(() => {
    if (categoriesLoading || categoriesError || !serverCategory) return;
    const categoryExists = categories.some(
      (category) =>
        category.slug === serverCategory || String(category.id) === serverCategory,
    );
    if (!categoryExists) {
      Promise.resolve().then(() => {
        setServerCategory("");
        setPage(1);
      });
    }
  }, [categories, categoriesError, categoriesLoading, serverCategory]);

  useEffect(() => {
    if (!Number.isInteger(requestedPlanId) || requestedPlanId <= 0) return;
    const requestedPlan = plans.find((plan) => plan.id === requestedPlanId);
    if (!requestedPlan) return;
    Promise.resolve().then(() => setSelectedPlan(requestedPlan));
  }, [plans, requestedPlanId]);

  const handleCategoryChange = (value: string) => {
    setServerCategory(value);
    setPage(1);
  };

  const handlePageChange = (nextPage: number) => {
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] py-8 md:py-12">
      <div className="mx-auto max-w-[1350px] px-4 md:px-5">
        <header className="mb-8">
          <div className="mb-2 flex items-center gap-2 text-[13px] text-text-muted">
            <Link href="/" className="transition-colors hover:text-blue-primary">Trang chủ</Link>
            <i className="fas fa-chevron-right text-[10px] text-gray-300" aria-hidden="true" />
            <span className="font-semibold text-[#1e293b]">Hosting</span>
          </div>
          <h1 className="text-2xl font-extrabold text-blue-nav md:text-[28px]">Gói Hosting</h1>
          <p className="mt-1 text-sm text-text-muted">Chọn gói theo dung lượng và chu kỳ phù hợp với website của bạn.</p>
        </header>

        <div className="mb-6 flex min-h-16 flex-col gap-3 rounded-lg border border-gray-border bg-white px-4 py-3 shadow-[0_2px_12px_rgba(0,0,0,.04)] sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center">
            <label htmlFor="server-category" className="shrink-0 text-sm font-bold text-blue-nav">
              Danh mục server
            </label>
            <select
              id="server-category"
              value={serverCategory}
              onChange={(event) => handleCategoryChange(event.target.value)}
              disabled={categoriesLoading || Boolean(categoriesError)}
              className="h-10 w-full rounded-md border border-[#e2e8f0] bg-white px-3 text-sm text-[#475569] outline-none transition focus:border-blue-primary disabled:cursor-not-allowed disabled:bg-gray-50 sm:max-w-[280px]"
            >
              <option value="">
                {categoriesLoading ? "Đang tải danh mục..." : "Tất cả server"}
              </option>
              {categories.map((category) => (
                <option key={category.id} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
            {categoriesError && (
              <button
                type="button"
                onClick={retryCategories}
                className="self-start text-sm font-semibold text-red-600 hover:text-red-700 sm:self-auto"
              >
                Không tải được danh mục. Thử lại
              </button>
            )}
          </div>
          <div className="flex items-center gap-4">
            <p className="text-sm text-text-muted">
              <strong className="text-blue-nav">{meta?.total ?? 0}</strong> gói phù hợp
            </p>
            {serverCategory && (
              <button
                type="button"
                onClick={() => handleCategoryChange("")}
                className="text-sm font-semibold text-blue-primary hover:text-orange-main"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
        </div>

        {error ? (
          <ErrorState message={error} onRetry={retry} />
        ) : !isLoading && plans.length === 0 ? (
          <EmptyState
            title={serverCategory ? "Không có gói hosting phù hợp" : "Chưa có gói hosting khả dụng"}
            description={serverCategory ? "Hãy thử một danh mục server khác." : "Các gói đang hoạt động sẽ xuất hiện tại đây."}
            action={serverCategory ? (
              <button
                type="button"
                onClick={() => handleCategoryChange("")}
                className="text-sm font-semibold text-blue-primary"
              >
                Xem tất cả server
              </button>
            ) : undefined}
          />
        ) : (
          <>
            <div className="grid grid-cols-1 items-start gap-[18px] sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {isLoading
                ? Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="h-[350px] animate-pulse rounded-lg border border-gray-border bg-white p-5">
                      <div className="h-5 w-1/2 rounded bg-gray-200" />
                      <div className="mt-3 h-4 w-4/5 rounded bg-gray-100" />
                      <div className="mt-5 h-7 w-2/3 rounded bg-gray-200" />
                    </div>
                  ))
                : plans.map((plan) => (
                    <HostingPlanCard key={plan.id} plan={plan} onSelect={setSelectedPlan} />
                  ))}
            </div>
            {meta && (
              <div className="mt-8">
                <Pagination
                  currentPage={meta.current_page}
                  lastPage={meta.last_page}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </div>

      {selectedPlan && (
        <HostingCheckout plan={selectedPlan} onClose={() => setSelectedPlan(null)} />
      )}
    </div>
  );
}
