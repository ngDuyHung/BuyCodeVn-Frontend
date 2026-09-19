import Link from "next/link";

export default function ServicesSection() {
  return (
 
    // SERVICES SECTION
    <section className="py-[36px] md:py-[50px] lg:py-[70px] pb-[36px] md:pb-[40px] lg:pb-[60px] bg-white">
        <div className="max-w-[1350px] mx-auto px-5">
            <div className="text-center mb-[40px]">
                <h2
                    className="text-[26px] font-extrabold text-blue-nav mb-2 relative inline-block after:content-[''] after:block after:w-[50px] after:h-[3px] after:bg-orange-main after:rounded-[2px] after:mt-2.5 after:mx-auto">
                    DỊCH VỤ CỦA CHÚNG TÔI</h2>
                <p className="text-text-muted text-[15px]">Đa dạng dịch vụ đáp ứng mọi nhu cầu của cá nhân và doanh nghiệp
                </p>
            </div>

            <div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 border-[1.5px] border-[#e8edf5] rounded-2xl overflow-hidden shadow-[0_4px_24px_rgba(13,33,55,.07)] divide-y-[1.5px] divide-[#e8edf5] md:divide-y-0 md:border-b-0 lg:border-b-[1.5px]">

                 {/* Ma nguon */}
                <div
                    className="bg-white p-[36px_28px_32px] flex flex-col items-center text-center transition-all hover:bg-[#fafcff] hover:shadow-[inset_0_-4px_0_0_#1a5cb8] border-r-0 md:border-b-[1.5px] md:border-r-[1.5px] lg:border-b-0 border-[#e8edf5]">
                    <div className="w-[72px] h-[72px] md:w-[100px] md:h-[100px] flex items-center justify-center mb-5">
                        <img src="images/code.png" alt="Mã nguồn" className="w-full h-full object-contain block" />
                    </div>
                    <h3 className="text-[19px] font-bold text-blue-nav mb-2.5">Mã nguồn</h3>
                    <p className="text-[14px] text-text-muted mb-[18px] leading-[1.65]">Kho mã nguồn đa dạng, chất lượng
                        cao, dễ dàng sử dụng và triển khai.</p>
                    <ul className="w-full text-left flex flex-col gap-2 mb-[26px]">
                        <li
                            className="text-[13.5px] text-[#374151] flex items-center gap-[9px] leading-[1.4] before:content-[''] before:shrink-0 before:w-[7px] before:h-[7px] before:rounded-full before:inline-block before:bg-orange-main">
                            Đầy đủ tính năng</li>
                        <li
                            className="text-[13.5px] text-[#374151] flex items-center gap-[9px] leading-[1.4] before:content-[''] before:shrink-0 before:w-[7px] before:h-[7px] before:rounded-full before:inline-block before:bg-orange-main">
                            Dễ dàng tùy biến</li>
                        <li
                            className="text-[13.5px] text-[#374151] flex items-center gap-[9px] leading-[1.4] before:content-[''] before:shrink-0 before:w-[7px] before:h-[7px] before:rounded-full before:inline-block before:bg-orange-main">
                            Cập nhật thường xuyên</li>
                        <li
                            className="text-[13.5px] text-[#374151] flex items-center gap-[9px] leading-[1.4] before:content-[''] before:shrink-0 before:w-[7px] before:h-[7px] before:rounded-full before:inline-block before:bg-orange-main">
                            Bảo hành &amp; hỗ trợ</li>
                    </ul>
                    <Link href="/source-code"
                        className="block w-full text-center p-[11px_20px] border-2 border-blue-primary text-blue-primary rounded-lg text-[14px] font-semibold mt-auto transition-all hover:bg-blue-primary hover:text-white hover:-translate-y-[1px]">Xem
                        mã nguồn →</Link>
                </div>

                {/* Thue website */}
                <div
                    className="bg-white p-[36px_28px_32px] flex flex-col items-center text-center transition-all hover:bg-[#fafcff] hover:shadow-[inset_0_-4px_0_0_#f97316] border-r-0 md:border-b-[1.5px] lg:border-r-[1.5px] lg:border-b-0 border-[#e8edf5]">
                    <div className="w-[72px] h-[72px] md:w-[100px] md:h-[100px] flex items-center justify-center mb-5">
                        <img src="images/web.png" alt="Thuê website" className="w-full h-full object-contain block" />
                    </div>
                    <h3 className="text-[19px] font-bold text-blue-nav mb-2.5">Thuê website</h3>
                    <p className="text-[14px] text-text-muted mb-[18px] leading-[1.65]">Sở hữu website chuyên nghiệp, sẵn
                        sàng sử dụng, tiết kiệm thời gian và chi phí.</p>
                    <ul className="w-full text-left flex flex-col gap-2 mb-[26px]">
                        <li
                            className="text-[13.5px] text-[#374151] flex items-center gap-[9px] leading-[1.4] before:content-[''] before:shrink-0 before:w-[7px] before:h-[7px] before:rounded-full before:inline-block before:bg-orange-main">
                            Giao diện đẹp, chuẩn SEO</li>
                        <li
                            className="text-[13.5px] text-[#374151] flex items-center gap-[9px] leading-[1.4] before:content-[''] before:shrink-0 before:w-[7px] before:h-[7px] before:rounded-full before:inline-block before:bg-orange-main">
                            Đầy đủ tính năng</li>
                        <li
                            className="text-[13.5px] text-[#374151] flex items-center gap-[9px] leading-[1.4] before:content-[''] before:shrink-0 before:w-[7px] before:h-[7px] before:rounded-full before:inline-block before:bg-orange-main">
                            Bàn giao nhanh chóng</li>
                        <li
                            className="text-[13.5px] text-[#374151] flex items-center gap-[9px] leading-[1.4] before:content-[''] before:shrink-0 before:w-[7px] before:h-[7px] before:rounded-full before:inline-block before:bg-orange-main">
                            Hỗ trợ trọn đời</li>
                    </ul>
                    <a href="#"
                        className="block w-full text-center p-[11px_20px] border-2 border-orange-main bg-orange-main text-white rounded-lg text-[14px] font-semibold mt-auto transition-all hover:bg-orange-dark hover:border-orange-dark hover:-translate-y-[1px]">Xem
                        dịch vụ →</a>
                </div>

                {/* Hosting */}
                <div
                    className="bg-white p-[36px_28px_32px] flex flex-col items-center text-center transition-all hover:bg-[#fafcff] hover:shadow-[inset_0_-4px_0_0_#1a5cb8] border-r-0 md:border-r-[1.5px] lg:border-b-0 md:border-b-0 border-[#e8edf5]">
                    <div className="w-[72px] h-[72px] md:w-[100px] md:h-[100px] flex items-center justify-center mb-5">
                        <img src="images/hosting.png" alt="Hosting" className="w-full h-full object-contain block" />
                    </div>
                    <h3 className="text-[19px] font-bold text-blue-nav mb-2.5">Hosting</h3>
                    <p className="text-[14px] text-text-muted mb-[18px] leading-[1.65]">Dịch vụ hosting tốc độ cao, ổn định,
                        bảo mật, phù hợp mọi nhu cầu.</p>
                    <ul className="w-full text-left flex flex-col gap-2 mb-[26px]">
                        <li
                            className="text-[13.5px] text-[#374151] flex items-center gap-[9px] leading-[1.4] before:content-[''] before:shrink-0 before:w-[7px] before:h-[7px] before:rounded-full before:inline-block before:bg-blue-primary">
                            Tốc độ vượt trội</li>
                        <li
                            className="text-[13.5px] text-[#374151] flex items-center gap-[9px] leading-[1.4] before:content-[''] before:shrink-0 before:w-[7px] before:h-[7px] before:rounded-full before:inline-block before:bg-blue-primary">
                            Ổn định 99.9% uptime</li>
                        <li
                            className="text-[13.5px] text-[#374151] flex items-center gap-[9px] leading-[1.4] before:content-[''] before:shrink-0 before:w-[7px] before:h-[7px] before:rounded-full before:inline-block before:bg-blue-primary">
                            Bảo mật nhiều lớp</li>
                        <li
                            className="text-[13.5px] text-[#374151] flex items-center gap-[9px] leading-[1.4] before:content-[''] before:shrink-0 before:w-[7px] before:h-[7px] before:rounded-full before:inline-block before:bg-blue-primary">
                            Hỗ trợ 24/7</li>
                    </ul>
                    <Link href="/hosting"
                        className="block w-full text-center p-[11px_20px] border-2 border-blue-primary text-blue-primary rounded-lg text-[14px] font-semibold mt-auto transition-all hover:bg-blue-primary hover:text-white hover:-translate-y-[1px]">Xem
                        hosting →</Link>
                </div>

                {/* VPS Server */}
                <div
                    className="bg-white p-[36px_28px_32px] flex flex-col items-center text-center transition-all hover:bg-[#fafcff] hover:shadow-[inset_0_-4px_0_0_#1a5cb8] border-r-0 md:border-b-0 border-[#e8edf5]">
                    <div className="w-[72px] h-[72px] md:w-[100px] md:h-[100px] flex items-center justify-center mb-5">
                        <img src="images/vps.png" alt="VPS / Server" className="w-full h-full object-contain block" />
                    </div>
                    <h3 className="text-[19px] font-bold text-blue-nav mb-2.5">VPS / Server</h3>
                    <p className="text-[14px] text-text-muted mb-[18px] leading-[1.65]">Máy chủ ảo &amp; máy chủ riêng mạnh
                        mẽ, linh hoạt, hiệu suất cao.</p>
                    <ul className="w-full text-left flex flex-col gap-2 mb-[26px]">
                        <li
                            className="text-[13.5px] text-[#374151] flex items-center gap-[9px] leading-[1.4] before:content-[''] before:shrink-0 before:w-[7px] before:h-[7px] before:rounded-full before:inline-block before:bg-blue-primary">
                            Cấu hình đa dạng</li>
                        <li
                            className="text-[13.5px] text-[#374151] flex items-center gap-[9px] leading-[1.4] before:content-[''] before:shrink-0 before:w-[7px] before:h-[7px] before:rounded-full before:inline-block before:bg-blue-primary">
                            Hiệu năng mạnh mẽ</li>
                        <li
                            className="text-[13.5px] text-[#374151] flex items-center gap-[9px] leading-[1.4] before:content-[''] before:shrink-0 before:w-[7px] before:h-[7px] before:rounded-full before:inline-block before:bg-blue-primary">
                            Toàn quyền quản trị</li>
                        <li
                            className="text-[13.5px] text-[#374151] flex items-center gap-[9px] leading-[1.4] before:content-[''] before:shrink-0 before:w-[7px] before:h-[7px] before:rounded-full before:inline-block before:bg-blue-primary">
                            Bảo mật &amp; ổn định</li>
                    </ul>
                    <a href="#"
                        className="block w-full text-center p-[11px_20px] border-2 border-blue-primary text-blue-primary rounded-lg text-[14px] font-semibold mt-auto transition-all hover:bg-blue-primary hover:text-white hover:-translate-y-[1px]">Xem
                        VPS/Server →</a>
                </div>

            </div>
        </div>
    </section>
    );
}
