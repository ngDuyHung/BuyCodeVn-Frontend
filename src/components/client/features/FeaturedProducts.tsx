"use client";

import Link from "next/link";
import ProductCard from "@/components/client/catalog/ProductCard";
import ErrorState from "@/components/shared/ErrorState";
import EmptyState from "@/components/shared/EmptyState";
import { useCatalog } from "@/hooks/client/useCatalog";

export default function FeaturedProducts() {
  const { products, isLoading, error, retry } = useCatalog({
    per_page: 5,
    is_active: true,
  });

  return (
    <section className="bg-white py-10 lg:py-14">
      <div className="mx-auto max-w-[1350px] px-5">
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-1 text-[13px] font-bold uppercase text-orange-main">
              Mã nguồn nổi bật
            </p>
            <p className="text-[15px] text-text-muted">
              Những sản phẩm mới trong kho mã nguồn BUYCODE.VN
            </p>
          </div>
          <Link
            href="/source-code"
            className="inline-flex items-center gap-2 self-start rounded-lg border border-gray-border px-4 py-2 text-[13px] font-semibold text-[#374151] transition-colors hover:border-blue-primary hover:bg-[#f0f6ff] hover:text-blue-primary md:self-auto"
          >
            Xem tất cả
            <i className="fas fa-arrow-right text-xs" aria-hidden="true" />
          </Link>
        </div>

        {error ? (
          <ErrorState message={error} onRetry={retry} />
        ) : !isLoading && products.length === 0 ? (
          <EmptyState
            title="Chưa có sản phẩm nổi bật"
            description="Các sản phẩm mới sẽ xuất hiện tại đây."
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {isLoading
              ? Array.from({ length: 5 }).map((_, index) => (
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
              : products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
          </div>
        )}
      </div>
    </section>
  );
}
