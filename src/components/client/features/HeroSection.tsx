export default function HeroSection() {
  return (
    //HERO SECTION 
    <section className="bg-gradient-to-br from-[#e8effc] via-[#edf4ff] to-[#f5f9ff] py-[28px] md:py-[40px] lg:py-[30px] lg:pb-[50px] overflow-hidden relative">
      {/* Radial gradient bg effect */}
      <div className="absolute top-0 right-0 w-[55%] h-full bg-[radial-gradient(ellipse_at_80%_50%,rgba(26,92,184,.07)_0%,transparent_70%)] pointer-events-none"></div>
      <div className="max-w-[1350px] mx-auto px-5 flex flex-col md:flex-col lg:flex-row items-center gap-[30px] lg:gap-2.5 relative z-10">
        <div className="w-full lg:flex-[0_0_48%] lg:max-w-[48%] text-center lg:text-left">
          <span className="inline-flex items-center gap-[6px] bg-[#dbeafe] text-[#1e40af] px-[14px] py-[5px] rounded-full text-[11.5px] font-bold tracking-[.8px] mb-5 uppercase border-none">
            NỀN TẢNG UY TÍN HÀNG ĐẦU VIỆT NAM
          </span>

          <h1 className="text-[23px] sm:text-[26px] md:text-[30px] lg:text-[44px] font-bold text-[#0d2137] leading-[1.22] mb-4 tracking-[-.5px] lg:tracking-[-.5px]">
            Giải pháp Mã Nguồn &amp;
            <br />
            Hạ tầng Công Nghệ{" "}
            <span className="text-orange-main">toàn diện</span>
          </h1>

          <p className="text-[#4b5563] text-[15.5px] mb-[32px] w-full lg:max-w-[500px] leading-[1.75] mx-auto lg:mx-0">
            Cung cấp mã nguồn chất lượng, cho thuê website, hosting, VPS/Server
            hiệu suất cao – bảo mật – ổn định – hỗ trợ 24/7.
          </p>

          <div className="flex flex-wrap justify-center lg:justify-start gap-[10px] md:gap-[14px] mb-[36px]">
            <a
              href="#"
              className="bg-blue-primary text-white px-[20px] lg:px-[30px] py-[11px] lg:py-[13px] rounded-lg font-bold text-[14px] lg:text-[15px] flex items-center gap-2 transition-all shadow-[0_4px_18px_rgba(26,92,184,.35)] hover:bg-[#154ea0] hover:-translate-y-[2px] hover:shadow-[0_6px_24px_rgba(26,92,184,.45)]"
            >
              Khám phá ngay <i className="fas fa-arrow-right"></i>
            </a>
            <a
              href="#"
              className="bg-white text-[#0045b3] border-[1.5px] border-[#d1d5db] px-[20px] lg:px-[30px] py-[11px] lg:py-[13px] rounded-lg font-semibold text-[14px] lg:text-[15px] transition-all hover:border-blue-primary hover:text-blue-primary hover:shadow-[0_2px_10px_rgba(26,92,184,.15)]"
            >
              Xem dịch vụ
            </a>
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
        <div className="w-full max-w-[500px] lg:max-w-none mx-auto lg:flex-1 lg:min-w-0">
          <div className="relative w-full">
            <img
              src="images/banner_hero.png"
              alt="banner hero"
              className="w-full max-w-[640px] h-auto block lg:ml-auto drop-shadow-[0_24px_48px_rgba(26,92,184,.22)] animate-heroFloat"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
