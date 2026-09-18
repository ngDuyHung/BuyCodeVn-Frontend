"use client";

import { useCatalog } from "@/hooks/client/useCatalog";
import Link from "next/link";

export default function FeaturedProducts() {
  // Lấy 5 sản phẩm từ API
  const { products, isLoading } = useCatalog({ per_page: 5 });

  // Tiện ích format giá
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  };

  return (
    <section className="py-[36px] md:py-[40px] lg:py-[60px] bg-white">
      <div className="max-w-[1350px] mx-auto px-5">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between text-left mb-[32px] gap-[10px]">
          <div>
            <p className="text-[13px] font-bold text-orange-main tracking-[1.5px] uppercase mb-[4px]">
              MÃ NGUỒN NỔI BẬT
            </p>
            <p className="text-text-muted text-[15px]">
              Những mã nguồn được khách hàng quan tâm nhất
            </p>
          </div>
          <Link
            href="/source-code"
            className="inline-flex items-center gap-[6px] p-[9px_18px] border-[1.5px] border-gray-border rounded-lg text-[13px] font-semibold text-[#374151] whitespace-nowrap transition-all hover:border-blue-primary hover:text-blue-primary hover:bg-[#f0f6ff] shrink-0 self-start md:self-auto"
          >
            Xem tất cả mã nguồn →
          </Link>
        </div>

        <div className="flex items-center gap-[4px] md:gap-[6px] lg:gap-[10px]">
          <button className="bg-white border-[1.5px] border-gray-border w-[26px] h-[26px] md:w-[30px] md:h-[30px] lg:w-[34px] lg:h-[34px] rounded-full flex items-center justify-center text-[#374151] cursor-pointer shrink-0 transition-colors text-[11px] md:text-[12px] lg:text-[13px] shadow-[0_2px_8px_rgba(0,0,0,.08)] hover:bg-blue-primary hover:text-white hover:border-blue-primary">
            <i className="fas fa-chevron-left"></i>
          </button>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-[12px] md:gap-[14px] lg:gap-[18px] flex-1 overflow-hidden">
            {isLoading ? (
              // Trạng thái Loading Skeleton
              Array.from({ length: 5 }).map((_, idx) => (
                <div key={idx} className="bg-white rounded-[10px] shadow-[0_2px_12px_rgba(0,0,0,.07)] overflow-hidden border-[1.5px] border-[#edf0f5] animate-pulse">
                  <div className="h-[130px] bg-gray-200"></div>
                  <div className="p-[12px_14px_14px]">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                    <div className="h-8 bg-gray-200 rounded w-full"></div>
                  </div>
                </div>
              ))
            ) : products.length > 0 ? (
              // Render dữ liệu thật
              products.map((product: any) => (
                <div key={product.id} className="bg-white rounded-[10px] shadow-[0_2px_12px_rgba(0,0,0,.07)] overflow-hidden border-[1.5px] border-[#edf0f5] transition-transform duration-200 hover:-translate-y-1 hover:shadow-[0_10px_28px_rgba(0,0,0,.12)] relative">
                  
                  {/* Badge tạm: Bạn có thể viết logic backend gắn cờ HOT sau */}
                  <div className="h-[130px] bg-[#f0f4f8] overflow-hidden relative">
                    <img
                      src={product.file_url || "images/demo_product.png"} // Hình minh họa, có thể cần cập nhật trường thumb_url từ DB sau
                      alt={product.title}
                      className="w-full h-full object-cover block"
                    />
                  </div>
                  <div className="p-[12px_14px_14px]">
                    <h4 className="text-[13.5px] font-bold text-blue-nav mb-2 leading-[1.35] whitespace-nowrap overflow-hidden text-ellipsis">
                      {product.title}
                    </h4>
                    <div className="flex items-center justify-between mb-2 gap-[6px]">
                      <span className="text-blue-primary font-bold text-[14.5px] whitespace-nowrap">
                        {formatPrice(product.price)}
                      </span>
                      <div className="flex gap-1 flex-wrap">
                        {/* Map loại sản phẩm từ enum backend[cite: 7] */}
                        <span className="p-[2px_7px] rounded-[3px] text-[10.5px] font-semibold whitespace-nowrap bg-[#e0f2fe] text-[#0369a1] uppercase">
                          {product.type.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-[4px] border-t border-[#f1f5f9] pt-2">
                      <i className="fas fa-star text-[#f59e0b] text-[12px]"></i>
                      <span className="text-[#f59e0b] text-[12.5px] font-semibold">5.0</span>
                      <span className="text-text-muted text-[12px] flex-1">(Lượt tải)</span>
                      
                      {/* Nút thanh toán trực tiếp */}
                      <button
                        className="w-[28px] h-[28px] bg-[#f0f6ff] rounded-[6px] border border-[#dbeafe] flex items-center justify-center text-blue-primary text-[12px] transition-colors hover:bg-blue-primary hover:text-white hover:border-blue-primary"
                        title="Mua ngay"
                      >
                        <i className="fas fa-shopping-cart"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              // Empty state
              <div className="col-span-full py-10 text-center text-gray-500">
                Chưa có mã nguồn nổi bật nào.
              </div>
            )}
          </div>

          <button className="bg-white border-[1.5px] border-gray-border w-[26px] h-[26px] md:w-[30px] md:h-[30px] lg:w-[34px] lg:h-[34px] rounded-full flex items-center justify-center text-[#374151] cursor-pointer shrink-0 transition-colors text-[11px] md:text-[12px] lg:text-[13px] shadow-[0_2px_8px_rgba(0,0,0,.08)] hover:bg-blue-primary hover:text-white hover:border-blue-primary">
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </section>
  );
}