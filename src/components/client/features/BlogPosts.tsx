export default function BlogPosts() {
  return (
    // BLOG POSTS
    <section className="py-[36px] md:py-[50px] lg:py-[70px] bg-gray-light">
      <div className="max-w-[1350px] mx-auto px-[14px] md:px-5">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between text-left mb-[32px] gap-[10px]">
          <div>
            <h2 className="text-[26px] font-extrabold text-blue-nav mb-2 relative inline-block after:content-[''] after:block after:w-[50px] after:h-[3px] after:bg-orange-main after:rounded-[2px] after:mt-2.5 after:mx-0">
              BÀI VIẾT MỚI NHẤT
            </h2>
          </div>
          <a
            href="#"
            className="inline-flex items-center gap-[6px] p-[9px_18px] border-[1.5px] border-gray-border rounded-lg text-[13px] font-semibold text-[#374151] whitespace-nowrap transition-all hover:border-blue-primary hover:text-blue-primary hover:bg-[#f0f6ff] shrink-0 self-start md:self-auto"
          >
            Xem tất cả bài viết →
          </a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-[16px] lg:gap-[20px]">
          <div className="bg-white rounded-[12px] overflow-hidden shadow-[0_2px_14px_rgba(0,0,0,.07)] transition-transform duration-200 hover:-translate-y-1">
            <div
              className="h-[110px] flex items-end p-[10px]"
              style={{
                background: "linear-gradient(135deg, #1a3c6e, #2d6abf)",
              }}
            >
              <span className="bg-black/45 text-white text-[11px] p-[2px_8px] rounded-[4px]">
                30/05/2024
              </span>
            </div>
            <div className="p-[14px]">
              <h4 className="text-[13.5px] font-semibold text-blue-nav mb-[10px] leading-[1.5]">
                Top 10 mã nguồn bán hàng được ưa chuộng nhất 2024
              </h4>
              <a
                href="#"
                className="text-blue-primary text-[13px] font-semibold hover:text-orange-main"
              >
                Đọc thêm →
              </a>
            </div>
          </div>
          <div className="bg-white rounded-[12px] overflow-hidden shadow-[0_2px_14px_rgba(0,0,0,.07)] transition-transform duration-200 hover:-translate-y-1">
            <div
              className="h-[110px] flex items-end p-[10px]"
              style={{
                background: "linear-gradient(135deg, #333, #555)",
              }}
            >
              <span className="bg-black/45 text-white text-[11px] p-[2px_8px] rounded-[4px]">
                18/05/2024
              </span>
            </div>
            <div className="p-[14px]">
              <h4 className="text-[13.5px] font-semibold text-blue-nav mb-[10px] leading-[1.5]">
                Hướng dẫn chọn hosting phù hợp cho website WordPress
              </h4>
              <a
                href="#"
                className="text-blue-primary text-[13px] font-semibold hover:text-orange-main"
              >
                Đọc thêm →
              </a>
            </div>
          </div>
          <div className="bg-white rounded-[12px] overflow-hidden shadow-[0_2px_14px_rgba(0,0,0,.07)] transition-transform duration-200 hover:-translate-y-1">
            <div
              className="h-[110px] flex items-end p-[10px]"
              style={{
                background: "linear-gradient(135deg, #e8761a, #f5a623)",
              }}
            >
              <span className="bg-black/45 text-white text-[11px] p-[2px_8px] rounded-[4px]">
                10/05/2024
              </span>
            </div>
            <div className="p-[14px]">
              <h4 className="text-[13.5px] font-semibold text-blue-nav mb-[10px] leading-[1.5]">
                VPS là gì? Lợi ích khi sử dụng VPS cho doanh nghiệp
              </h4>
              <a
                href="#"
                className="text-blue-primary text-[13px] font-semibold hover:text-orange-main"
              >
                Đọc thêm →
              </a>
            </div>
          </div>
          <div className="bg-white rounded-[12px] overflow-hidden shadow-[0_2px_14px_rgba(0,0,0,.07)] transition-transform duration-200 hover:-translate-y-1">
            <div
              className="h-[110px] flex items-end p-[10px]"
              style={{
                background: "linear-gradient(135deg, #2563eb, #1e40af)",
              }}
            >
              <span className="bg-black/45 text-white text-[11px] p-[2px_8px] rounded-[4px]">
                01/05/2024
              </span>
            </div>
            <div className="p-[14px]">
              <h4 className="text-[13.5px] font-semibold text-blue-nav mb-[10px] leading-[1.5]">
                So sánh Hosting và VPS: Nên chọn loại nào?
              </h4>
              <a
                href="#"
                className="text-blue-primary text-[13px] font-semibold hover:text-orange-main"
              >
                Đọc thêm →
              </a>
            </div>
          </div>
          <div className="bg-white rounded-[12px] overflow-hidden shadow-[0_2px_14px_rgba(0,0,0,.07)] transition-transform duration-200 hover:-translate-y-1">
            <div
              className="h-[110px] flex items-end p-[10px]"
              style={{
                background: "linear-gradient(135deg, #1a7a4a, #22c55e)",
              }}
            >
              <span className="bg-black/45 text-white text-[11px] p-[2px_8px] rounded-[4px]">
                25/04/2024
              </span>
            </div>
            <div className="p-[14px]">
              <h4 className="text-[13.5px] font-semibold text-blue-nav mb-[10px] leading-[1.5]">
                Xu hướng thiết kế website hiện đại năm 2024
              </h4>
              <a
                href="#"
                className="text-blue-primary text-[13px] font-semibold hover:text-orange-main"
              >
                Đọc thêm →
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
