"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import CategoryTree from "./CategoryTree";
import ProductCard from "./ProductCard";
import EmptyState from "@/components/shared/EmptyState";
import ErrorState from "@/components/shared/ErrorState";
import Pagination from "@/components/shared/Pagination";
import { useCatalog } from "@/hooks/client/useCatalog";
import { toCatalogSearchParams } from "@/lib/catalog-query";
import type { CatalogQuery, ProductType } from "@/types/catalog";

const productTypes: Array<{ value: ProductType | ""; label: string }> = [
  { value: "", label: "Tất cả" },
  { value: "source_code", label: "Mã nguồn" },
  { value: "template", label: "Template" },
  { value: "script", label: "Script" },
  { value: "plugin", label: "Plugin" },
  { value: "other", label: "Khác" },
];

interface SourceCodeCatalogProps {
  initialParams: CatalogQuery;
}

export default function SourceCodeCatalog({
  initialParams,
}: SourceCodeCatalogProps) {
  const router = useRouter();
  const pathname = usePathname();
  const {
    categories,
    products,
    meta,
    isLoading,
    error,
    retry,
    updateParams,
    params,
  } = useCatalog(initialParams);
  const [searchInput, setSearchInput] = useState(initialParams.search ?? "");

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const search = searchInput.trim();
      if (search !== (params.search ?? "")) {
        updateParams({ search: search || undefined, page: 1 });
      }
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [params.search, searchInput, updateParams]);

  useEffect(() => {
    const query = toCatalogSearchParams(params).toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [params, pathname, router]);

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    updateParams({ search: searchInput.trim() || undefined, page: 1 });
  };

  const clearFilters = () => {
    setSearchInput("");
    updateParams({ search: undefined, category_id: "", type: "", page: 1 });
  };

  const handlePageChange = (page: number) => {
    updateParams({ page });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] py-8">
      <div className="mx-auto max-w-[1350px] px-4 md:px-5">
        <div className="mb-6">
          <div className="mb-2 flex items-center gap-2 text-[13px] text-text-muted">
            <Link href="/" className="transition-colors hover:text-blue-primary">
              Trang chủ
            </Link>
            <i className="fas fa-chevron-right text-[10px] text-gray-300" />
            <span className="font-semibold text-[#1e293b]">Danh sách mã nguồn</span>
          </div>
          <h1 className="text-2xl font-extrabold text-blue-nav md:text-[28px]">
            Kho Mã Nguồn & Template
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            Khám phá mã nguồn chất lượng cao theo nhu cầu của bạn.
          </p>
        </div>

        <div className="flex flex-col items-start gap-6 lg:flex-row">
          <aside className="flex w-full shrink-0 flex-col gap-5 lg:w-[280px]">
            <section className="rounded-lg border border-gray-border bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,.04)]">
              <h2 className="mb-3 text-[15px] font-bold text-blue-nav">Tìm kiếm</h2>
              <form onSubmit={handleSearch} className="relative">
                <label htmlFor="catalog-search" className="sr-only">
                  Tìm mã nguồn
                </label>
                <input
                  id="catalog-search"
                  type="search"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Nhập từ khóa..."
                  className="h-10 w-full rounded-lg border border-[#e2e8f0] pl-3 pr-10 text-[13.5px] outline-none transition focus:border-blue-primary"
                />
                <button
                  type="submit"
                  className="absolute right-0 top-0 flex h-10 w-10 items-center justify-center text-gray-400 hover:text-blue-primary"
                  aria-label="Tìm kiếm"
                >
                  <i className="fas fa-search" aria-hidden="true" />
                </button>
              </form>
            </section>

            <section className="rounded-lg border border-gray-border bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,.04)]">
              <h2 className="mb-3 text-[15px] font-bold text-blue-nav">Danh mục</h2>
              <button
                type="button"
                onClick={() => updateParams({ category_id: "", page: 1 })}
                className={`mb-1 w-full rounded-md px-2 py-1.5 text-left text-sm transition-colors ${
                  !params.category_id
                    ? "bg-blue-50 font-bold text-blue-primary"
                    : "text-[#475569] hover:bg-blue-50 hover:text-blue-primary"
                }`}
              >
                Tất cả danh mục
              </button>
              <CategoryTree
                categories={categories}
                selectedId={params.category_id}
                onSelect={(categoryId) =>
                  updateParams({ category_id: categoryId, page: 1 })
                }
              />
            </section>

            <fieldset className="rounded-lg border border-gray-border bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,.04)]">
              <legend className="mb-3 text-[15px] font-bold text-blue-nav">
                Loại sản phẩm
              </legend>
              <div className="flex flex-col gap-2">
                {productTypes.map((type) => (
                  <label key={type.value} className="flex cursor-pointer items-center gap-2">
                    <input
                      type="radio"
                      name="product_type"
                      checked={(params.type ?? "") === type.value}
                      onChange={() => updateParams({ type: type.value, page: 1 })}
                      className="accent-blue-primary"
                    />
                    <span className="text-sm text-[#475569]">{type.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </aside>

          <main className="w-full min-w-0 flex-1">
            <div className="mb-5 flex min-h-14 flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-border bg-white px-4 shadow-[0_2px_12px_rgba(0,0,0,.04)]">
              <p className="text-sm text-text-muted">
                Tìm thấy <strong className="text-blue-nav">{meta?.total ?? 0}</strong> kết quả
              </p>
              {(params.search || params.category_id || params.type) && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-sm font-semibold text-blue-primary hover:text-orange-main"
                >
                  Xóa bộ lọc
                </button>
              )}
            </div>

            {error ? (
              <div className="rounded-lg border border-gray-border bg-white">
                <ErrorState message={error} onRetry={retry} />
              </div>
            ) : isLoading ? (
              <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" role="status" aria-label="Đang tải sản phẩm">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div key={index} className="overflow-hidden rounded-lg border border-gray-border bg-white animate-pulse">
                    <div className="aspect-[16/9] bg-gray-200" />
                    <div className="space-y-3 p-4">
                      <div className="h-4 w-1/3 rounded bg-gray-200" />
                      <div className="h-4 w-3/4 rounded bg-gray-200" />
                      <div className="h-8 rounded bg-gray-100" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="rounded-lg border border-gray-border bg-white">
                <EmptyState
                  title="Không tìm thấy sản phẩm"
                  description="Hãy thử từ khóa hoặc bộ lọc khác."
                  action={
                    <button type="button" onClick={clearFilters} className="text-sm font-semibold text-blue-primary">
                      Xóa bộ lọc
                    </button>
                  }
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            {meta && !isLoading && !error && (
              <div className="mt-8">
                <Pagination
                  currentPage={meta.current_page}
                  lastPage={meta.last_page}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
