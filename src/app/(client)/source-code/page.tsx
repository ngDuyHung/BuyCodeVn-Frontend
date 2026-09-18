"use client";

import { useCatalog } from "@/hooks/client/useCatalog";
import Link from "next/link";
import { useState } from "react";

export default function SourceCodePage() {
  // Khởi tạo hook với per_page mặc định là 15 theo tài liệu API[cite: 7]
  const { categories, products, meta, isLoading, updateParams, params } =
    useCatalog({ per_page: 15 });

  const [searchInput, setSearchInput] = useState("");

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price) + "đ";
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ search: searchInput, page: 1 });
  };

  const handleFilterChange = (key: string, value: string) => {
    updateParams({ [key]: value, page: 1 });
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= (meta.last_page || 1)) {
      updateParams({ page: newPage });
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="bg-[#f8fafc] min-h-screen py-8">
      <div className="max-w-[1350px] mx-auto px-4 md:px-5">
        {/* Breadcrumb & Tiêu đề */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-[13px] text-text-muted mb-2">
            <Link
              href="/"
              className="hover:text-blue-primary transition-colors"
            >
              Trang chủ
            </Link>
            <i className="fas fa-chevron-right text-[10px] text-gray-300"></i>
            <span className="font-semibold text-[#1e293b]">
              Danh sách mã nguồn
            </span>
          </div>
          <h1 className="text-[24px] md:text-[28px] font-extrabold text-blue-nav">
            Kho Mã Nguồn & Template
          </h1>
          <p className="text-[14px] text-text-muted mt-1">
            Khám phá hàng ngàn mã nguồn chất lượng cao, tối ưu sẵn cho mọi nhu
            cầu.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* CỘT TRÁI: BỘ LỌC (SIDEBAR) */}
          <div className="w-full lg:w-[280px] shrink-0 flex flex-col gap-5">
            {/* Tìm kiếm */}
            <div className="bg-white p-5 rounded-xl border border-gray-border shadow-[0_2px_12px_rgba(0,0,0,.04)]">
              <h3 className="text-[15px] font-bold text-blue-nav mb-3">
                Tìm kiếm
              </h3>
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Nhập từ khóa..."
                  className="w-full h-[40px] pl-3 pr-10 border border-[#e2e8f0] rounded-lg text-[13.5px] outline-none transition-all focus:border-blue-primary"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-primary"
                >
                  <i className="fas fa-search"></i>
                </button>
              </form>
            </div>

            {/* Lọc theo danh mục */}
            <div className="bg-white p-5 rounded-xl border border-gray-border shadow-[0_2px_12px_rgba(0,0,0,.04)]">
              <h3 className="text-[15px] font-bold text-blue-nav mb-3">
                Danh mục
              </h3>
              <ul className="flex flex-col gap-2">
                <li>
                  <button
                    onClick={() => handleFilterChange("category_id", "")}
                    className={`text-[14px] transition-colors ${!params.category_id ? "font-bold text-blue-primary" : "text-[#475569] hover:text-blue-primary"}`}
                  >
                    Tất cả danh mục
                  </button>
                </li>
                {categories.map((cat: any) => (
                  <li key={cat.id}>
                    <button
                      onClick={() => handleFilterChange("category_id", cat.id)}
                      className={`text-[14px] transition-colors ${params.category_id === cat.id ? "font-bold text-blue-primary" : "text-[#475569] hover:text-blue-primary"}`}
                    >
                      {cat.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Lọc theo phân loại (Dựa theo Enum API)[cite: 7] */}
            <div className="bg-white p-5 rounded-xl border border-gray-border shadow-[0_2px_12px_rgba(0,0,0,.04)]">
              <h3 className="text-[15px] font-bold text-blue-nav mb-3">
                Loại sản phẩm
              </h3>
              <ul className="flex flex-col gap-2">
                {[
                  { value: "", label: "Tất cả" },
                  { value: "source_code", label: "Mã nguồn" },
                  { value: "template", label: "Template" },
                  { value: "script", label: "Script" },
                  { value: "plugin", label: "Plugin" },
                ].map((type) => (
                  <li key={type.value}>
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="radio"
                        name="product_type"
                        checked={
                          params.type === type.value ||
                          (!params.type && type.value === "")
                        }
                        onChange={() => handleFilterChange("type", type.value)}
                        className="accent-blue-primary"
                      />
                      <span
                        className={`text-[14px] transition-colors group-hover:text-blue-primary ${params.type === type.value ? "font-medium text-blue-nav" : "text-[#475569]"}`}
                      >
                        {type.label}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* CỘT PHẢI: DANH SÁCH SẢN PHẨM */}
          <div className="flex-1 w-full min-w-0">
            {/* Thanh công cụ sắp xếp */}
            <div className="bg-white p-4 rounded-xl border border-gray-border shadow-[0_2px_12px_rgba(0,0,0,.04)] mb-5 flex flex-wrap items-center justify-between gap-4">
              <p className="text-[14px] text-text-muted">
                Tìm thấy{" "}
                <strong className="text-blue-nav">{meta.total || 0}</strong> kết
                quả
              </p>
            </div>

            {/* Lưới sản phẩm */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[14px] md:gap-[18px]">
              {isLoading ? (
                // Skeleton loading
                Array.from({ length: 8 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-[10px] shadow-[0_2px_12px_rgba(0,0,0,.07)] overflow-hidden border-[1.5px] border-[#edf0f5] animate-pulse"
                  >
                    <div className="h-[140px] bg-gray-200"></div>
                    <div className="p-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                      <div className="h-8 bg-gray-200 rounded w-full"></div>
                    </div>
                  </div>
                ))
              ) : products.length > 0 ? (
                products.map((product: any) => (
                  <div
                    key={product.id}
                    className="bg-white rounded-[10px] shadow-[0_2px_12px_rgba(0,0,0,.07)] overflow-hidden border-[1.5px] border-[#edf0f5] transition-transform duration-200 hover:-translate-y-1 hover:shadow-[0_10px_28px_rgba(0,0,0,.12)] flex flex-col"
                  >
                    <div className="h-[140px] bg-[#f0f4f8] overflow-hidden relative shrink-0">
                      <img
                        src={product.file_url || "/images/demo_product.png"}
                        alt={product.title}
                        className="w-full h-full object-cover block"
                      />
                    </div>
                    <div className="p-[12px_14px_14px] flex flex-col flex-1">
                      <h4
                        className="text-[14px] font-bold text-blue-nav mb-2 leading-[1.35] line-clamp-2"
                        title={product.title}
                      >
                        {product.title}
                      </h4>
                      <div className="flex items-center justify-between mt-auto mb-3 gap-[6px]">
                        <span className="text-blue-primary font-bold text-[15px] whitespace-nowrap">
                          {formatPrice(product.price)}
                        </span>
                        <span className="p-[2px_7px] rounded-[3px] text-[10px] font-semibold whitespace-nowrap bg-[#e0f2fe] text-[#0369a1] uppercase">
                          {product.type.replace("_", " ")}
                        </span>
                      </div>
                      <div className="flex items-center gap-[4px] border-t border-[#f1f5f9] pt-3">
                        <i className="fas fa-star text-[#f59e0b] text-[12px]"></i>
                        <span className="text-[#f59e0b] text-[12.5px] font-semibold">
                          5.0
                        </span>
                        <span className="text-text-muted text-[12px] flex-1">
                          (Lượt tải)
                        </span>
                        <button
                          className="w-[30px] h-[30px] bg-[#f0f6ff] rounded-[6px] border border-[#dbeafe] flex items-center justify-center text-blue-primary text-[13px] transition-colors hover:bg-blue-primary hover:text-white hover:border-blue-primary"
                          title="Mua ngay"
                        >
                          <i className="fas fa-shopping-cart"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-16 text-center bg-white rounded-xl border border-gray-border">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 text-2xl mx-auto mb-3">
                    <i className="fas fa-search"></i>
                  </div>
                  <h3 className="text-[16px] font-bold text-blue-nav mb-1">
                    Không tìm thấy sản phẩm
                  </h3>
                  <p className="text-[14px] text-text-muted">
                    Vui lòng thử thay đổi từ khóa hoặc bộ lọc của bạn.
                  </p>
                </div>
              )}
            </div>

            {/* Phân trang (Dựa theo cấu trúc Pagination của Laravel)[cite: 7] */}
            {meta && meta.last_page > 1 && (
              <div className="mt-8 flex justify-center">
                <div className="flex items-center gap-1 bg-white p-2 rounded-lg border border-gray-border shadow-sm">
                  <button
                    onClick={() => handlePageChange(meta.current_page - 1)}
                    disabled={meta.current_page === 1}
                    className="w-8 h-8 rounded flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                  >
                    <i className="fas fa-chevron-left text-[12px]"></i>
                  </button>

                  {/* Render số trang */}
                  {Array.from({ length: meta.last_page }).map((_, idx) => {
                    const pageNum = idx + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-8 h-8 rounded text-[13px] font-semibold transition-colors ${
                          meta.current_page === pageNum
                            ? "bg-blue-primary text-white"
                            : "text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => handlePageChange(meta.current_page + 1)}
                    disabled={meta.current_page === meta.last_page}
                    className="w-8 h-8 rounded flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                  >
                    <i className="fas fa-chevron-right text-[12px]"></i>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
