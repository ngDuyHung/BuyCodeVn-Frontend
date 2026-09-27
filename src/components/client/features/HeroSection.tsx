import Image from "next/image";
import Link from "next/link";

export default function HeroSection() {
  return (
    // HERO SECTION
    <section className="bg-[#f8fafc] py-[28px] md:py-[40px] lg:py-[30px] lg:pb-[50px] overflow-hidden relative">
      
      {/* =========================================
          1. BACKGROUND: HIỆU ỨNG ÁNH SÁNG & LƯỚI
          ========================================= */}
      {/* Lưới chấm bi (Dot Grid) */}
      <div className="absolute inset-0 z-0 opacity-[0.3] bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:24px_24px]"></div>

      {/* =========================================
          2. NỘI DUNG HERO (Z-10)
          ========================================= */}
      <div className="max-w-[1350px] mx-auto px-5 flex flex-col md:flex-col lg:flex-row items-center gap-[30px] lg:gap-2.5 relative z-10">
        
        {/* === CỘT TRÁI: VĂN BẢN (Giữ nguyên như cũ) === */}
        <div className="w-full lg:flex-[0_0_48%] lg:max-w-[48%] text-center lg:text-left">
          <span className="inline-flex items-center gap-[6px] bg-[#dbeafe] text-[#1e40af] px-[14px] py-[5px] rounded-full text-[11.5px] font-bold tracking-[.8px] mb-5 uppercase border-none">
            NỀN TẢNG UY TÍN HÀNG ĐẦU VIỆT NAM
          </span>

          <h1 className="mb-4 text-[32px] font-extrabold leading-[1.15] text-[#0d2137] sm:text-[38px] lg:text-[48px]">BUYCODE.VN</h1>

          <p className="text-[#4b5563] text-[15.5px] mb-[32px] w-full lg:max-w-[500px] leading-[1.75] mx-auto lg:mx-0">
            Mã nguồn, hosting và tên miền trong một nền tảng quản lý tập trung,
            thanh toán trực tiếp bằng số dư ví.
          </p>

          <div className="flex flex-wrap justify-center lg:justify-start gap-[10px] md:gap-[14px] mb-[36px]">
            <Link
              href="/source-code"
              className="bg-blue-primary text-white px-[20px] lg:px-[30px] py-[11px] lg:py-[13px] rounded-lg font-bold text-[14px] lg:text-[15px] flex items-center gap-2 transition-all shadow-[0_4px_18px_rgba(26,92,184,.35)] hover:bg-[#154ea0] hover:-translate-y-[2px] hover:shadow-[0_6px_24px_rgba(26,92,184,.45)]"
            >
              Khám phá ngay <i className="fas fa-arrow-right"></i>
            </Link>
            <Link
              href="/hosting"
              className="bg-white text-[#0045b3] border-[1.5px] border-[#d1d5db] px-[20px] lg:px-[30px] py-[11px] lg:py-[13px] rounded-lg font-semibold text-[14px] lg:text-[15px] transition-all hover:border-blue-primary hover:text-blue-primary hover:shadow-[0_2px_10px_rgba(26,92,184,.15)]"
            >
              Xem gói hosting
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap justify-center lg:justify-start gap-[12px] sm:gap-[14px] lg:gap-[24px]">
            <div className="flex items-center gap-[10px] text-[#374151] text-[11.5px] lg:text-[13px] font-medium leading-[1.4]">
              <span className="shrink-0 w-[36px] h-[36px] rounded-full flex items-center justify-center text-blue-primary text-[30px] shadow-[0_2px_8px_rgba(26,92,184,.12)]">
                <i className="fas fa-award text-base"></i>
              </span>
              <span className="text-left">
                Chất lượng
                <br />
                đảm bảo
              </span>
            </div>
            <div className="flex items-center gap-[10px] text-[#374151] text-[11.5px] lg:text-[13px] font-medium leading-[1.4]">
              <span className="shrink-0 w-[36px] h-[36px] rounded-full flex items-center justify-center text-blue-primary text-[30px] shadow-[0_2px_8px_rgba(26,92,184,.12)]">
                <i className="fas fa-tachometer-alt text-base"></i>
              </span>
              <span className="text-left">
                Tốc độ
                <br />
                vượt trội
              </span>
            </div>
            <div className="flex items-center gap-[10px] text-[#374151] text-[11.5px] lg:text-[13px] font-medium leading-[1.4]">
              <span className="shrink-0 w-[36px] h-[36px] rounded-full flex items-center justify-center text-blue-primary text-[30px] shadow-[0_2px_8px_rgba(26,92,184,.12)]">
                <i className="fas fa-shield-alt text-base"></i>
              </span>
              <span className="text-left">
                Bảo mật
                <br />
                an toàn
              </span>
            </div>
            <div className="flex items-center gap-[10px] text-[#374151] text-[11.5px] lg:text-[13px] font-medium leading-[1.4]">
              <span className="shrink-0 w-[36px] h-[36px] rounded-full flex items-center justify-center text-blue-primary text-[30px] shadow-[0_2px_8px_rgba(26,92,184,.12)]">
                <i className="fas fa-headset text-base"></i>
              </span>
              <span className="text-left">
                Hỗ trợ
                <br />
                24/7
              </span>
            </div>
          </div>
        </div>
        
        {/* === CỘT PHẢI: ẢNH NHƯ CŨ === */}
        <div className="w-full max-w-[500px] lg:max-w-none mx-auto lg:flex-1 lg:min-w-0">
          <div className="relative w-full">
            <Image
              src="/images/banner_hero.webp"
              alt="Giao diện dịch vụ BUYCODE.VN"
              width={640}
              height={480}
              priority
              sizes="(max-width: 1024px) 90vw, 52vw"
              className="block h-auto w-full max-w-[640px] lg:ml-auto drop-shadow-[0_24px_48px_rgba(26,92,184,.22)] animate-heroFloat"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
