"use client";

import Link from "next/link";
import ProductCard from "@/components/client/catalog/ProductCard";
import ErrorState from "@/components/shared/ErrorState";
import EmptyState from "@/components/shared/EmptyState";
import { useCatalog } from "@/hooks/client/useCatalog";

export default function FeaturedProducts() {
  const { products, isLoading, error, retry } = useCatalog(
    { per_page: 4, is_active: true },
    { loadCategories: false },
  );
  const featuredProducts = products.slice(0, 4);

  return (
    <section aria-labelledby="featured-products-title" className="border-y border-[#e8edef] bg-[#f6f9f9] py-12 lg:py-16">
      <div className="mx-auto max-w-[1350px] px-5">
        <div className="mb-7 flex flex-col gap-4 sm:mb-9 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase text-[var(--color-blue-primary)]"><span className="h-px w-7 bg-[var(--color-blue-primary)]" aria-hidden="true" />Sản phẩm tuyển chọn</p>
            <h2 id="featured-products-title" className="text-2xl font-extrabold text-[var(--color-blue-nav)] sm:text-3xl">Mã nguồn nổi bật</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#64757c] sm:text-[15px]">
              Các sản phẩm mới, chất lượng cao được chọn lọc từ kho mã nguồn BUYCODE.VN.
            </p>
          </div>
          <Link
            href="/source-code"
            className="inline-flex min-h-10 items-center gap-2 self-start rounded-md border border-[#b9c9cc] bg-white px-4 py-2 text-sm font-bold text-[#35535d] transition-colors hover:border-[var(--color-blue-primary)] hover:text-[var(--color-blue-primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-blue-primary)] md:self-auto"
          >
            Xem tất cả
            <i className="fas fa-arrow-right text-xs" aria-hidden="true" />
          </Link>
        </div>

        {error ? (
          <ErrorState message={error} onRetry={retry} />
        ) : !isLoading && featuredProducts.length === 0 ? (
          <EmptyState
            title="Chưa có sản phẩm nổi bật"
            description="Các sản phẩm mới sẽ xuất hiện tại đây."
          />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {isLoading
              ? Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="overflow-hidden rounded-lg border border-gray-border bg-white animate-pulse"
                  >
                    <div className="aspect-[16/9] bg-gray-200" />
                    <div className="space-y-3 p-4">
                      <div className="h-4 w-1/3 rounded bg-gray-200" />
                      <div className="h-4 w-3/4 rounded bg-gray-200" />
                      <div className="h-8 rounded bg-gray-100" />
                    </div>
                  </div>
                ))
              : featuredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} variant="featured" />
                ))}
          </div>
        )}
      </div>
    </section>
  );
}
