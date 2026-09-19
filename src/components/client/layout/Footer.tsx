import Link from "next/link";

export default function Footer() {
  return (
    // FOOTER
    <footer className="bg-blue-dark text-[#cbd5e1]">
      <div className="max-w-[1350px] mx-auto px-[14px] md:px-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_1.5fr] gap-[24px] md:gap-[30px] lg:gap-[40px] py-[28px] md:py-[36px] lg:py-[50px] lg:pb-[40px]">
        <div className="col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-1">
          <div className="mb-[16px] brightness-150">
            <div>
              <img
                src="images/logoweb.png"
                alt="BUYCODE.VN"
                className="h-[40px]"
              />
            </div>
          </div>
          <p className="text-[13.5px] text-[#94a3b8] leading-[1.7] mb-[20px]">
            Nền tảng cung cấp mã nguồn, thuê website, hosting, VPS/Server uy
            tín, chất lượng hàng đầu Việt Nam.
          </p>
          <div className="flex gap-[10px]">
            <a
              href="#"
              className="w-[36px] h-[36px] bg-white/10 rounded-[8px] flex items-center justify-center text-[#94a3b8] text-[15px] transition-colors hover:bg-blue-primary hover:text-white"
            >
              <i className="fab fa-facebook-f"></i>
            </a>
            <a
              href="#"
              className="w-[36px] h-[36px] bg-white/10 rounded-[8px] flex items-center justify-center text-[#94a3b8] text-[15px] transition-colors hover:bg-blue-primary hover:text-white"
            >
              <i className="fab fa-twitter"></i>
            </a>
            <a
              href="#"
              className="w-[36px] h-[36px] bg-white/10 rounded-[8px] flex items-center justify-center text-[#94a3b8] text-[15px] transition-colors hover:bg-blue-primary hover:text-white"
            >
              <i className="fab fa-youtube"></i>
            </a>
            <a
              href="#"
              className="w-[36px] h-[36px] bg-white/10 rounded-[8px] flex items-center justify-center text-[#94a3b8] text-[15px] transition-colors hover:bg-blue-primary hover:text-white"
            >
              <i className="fab fa-tiktok"></i>
            </a>
            <a
              href="#"
              className="w-[36px] h-[36px] bg-white/10 rounded-[8px] flex items-center justify-center text-[#94a3b8] text-[15px] transition-colors hover:bg-blue-primary hover:text-white"
            >
              <i className="fab fa-discord"></i>
            </a>
          </div>
        </div>
        <div>
          <h4 className="text-[14px] font-bold text-[#e2e8f0] mb-[18px] uppercase tracking-[.5px]">
            DỊCH VỤ
          </h4>
          <ul className="flex flex-col gap-[10px]">
            <li>
              <Link
                href="/source-code"
                className="text-[13.5px] text-[#94a3b8] transition-all hover:text-orange-main hover:pl-1"
              >
                Mã nguồn
              </Link>
            </li>
            <li>
              <a
                href="#"
                className="text-[13.5px] text-[#94a3b8] transition-all hover:text-orange-main hover:pl-1"
              >
                Thuê website
              </a>
            </li>
            <li>
              <Link
                href="/hosting"
                className="text-[13.5px] text-[#94a3b8] transition-all hover:text-orange-main hover:pl-1"
              >
                Hosting
              </Link>
            </li>
            <li>
              <a
                href="#"
                className="text-[13.5px] text-[#94a3b8] transition-all hover:text-orange-main hover:pl-1"
              >
                VPS/Server
              </a>
            </li>
            <li>
              <a
                href="#"
                className="text-[13.5px] text-[#94a3b8] transition-all hover:text-orange-main hover:pl-1"
              >
                Tên miền
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-[14px] font-bold text-[#e2e8f0] mb-[18px] uppercase tracking-[.5px]">
            HỖ TRỢ
          </h4>
          <ul className="flex flex-col gap-[10px]">
            <li>
              <a
                href="#"
                className="text-[13.5px] text-[#94a3b8] transition-all hover:text-orange-main hover:pl-1"
              >
                Hướng dẫn mua hàng
              </a>
            </li>
            <li>
              <a
                href="#"
                className="text-[13.5px] text-[#94a3b8] transition-all hover:text-orange-main hover:pl-1"
              >
                Hướng dẫn thanh toán
              </a>
            </li>
            <li>
              <a
                href="#"
                className="text-[13.5px] text-[#94a3b8] transition-all hover:text-orange-main hover:pl-1"
              >
                Chính sách bảo hành
              </a>
            </li>
            <li>
              <a
                href="#"
                className="text-[13.5px] text-[#94a3b8] transition-all hover:text-orange-main hover:pl-1"
              >
                Chính sách hoàn tiền
              </a>
            </li>
            <li>
              <a
                href="#"
                className="text-[13.5px] text-[#94a3b8] transition-all hover:text-orange-main hover:pl-1"
              >
                Câu hỏi thường gặp
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-[14px] font-bold text-[#e2e8f0] mb-[18px] uppercase tracking-[.5px]">
            VỀ CHÚNG TÔI
          </h4>
          <ul className="flex flex-col gap-[10px]">
            <li>
              <a
                href="#"
                className="text-[13.5px] text-[#94a3b8] transition-all hover:text-orange-main hover:pl-1"
              >
                Giới thiệu
              </a>
            </li>
            <li>
              <a
                href="#"
                className="text-[13.5px] text-[#94a3b8] transition-all hover:text-orange-main hover:pl-1"
              >
                Hướng dẫn sử dụng
              </a>
            </li>
            <li>
              <a
                href="#"
                className="text-[13.5px] text-[#94a3b8] transition-all hover:text-orange-main hover:pl-1"
              >
                Chính sách bảo mật
              </a>
            </li>
            <li>
              <a
                href="#"
                className="text-[13.5px] text-[#94a3b8] transition-all hover:text-orange-main hover:pl-1"
              >
                Chính sách bán hàng
              </a>
            </li>
            <li>
              <a
                href="#"
                className="text-[13.5px] text-[#94a3b8] transition-all hover:text-orange-main hover:pl-1"
              >
                Tuyển dụng
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-[14px] font-bold text-[#e2e8f0] mb-[18px] uppercase tracking-[.5px]">
            LIÊN HỆ
          </h4>
          <ul className="flex flex-col gap-[12px]">
            <li className="flex gap-[10px] text-[13px] text-[#94a3b8] leading-[1.5]">
              <i className="fas fa-map-marker-alt text-orange-main mt-[3px] shrink-0"></i>{" "}
              56 123, Đường ABC, Quận 1, TP. Hồ Chí Minh
            </li>
            <li className="flex gap-[10px] text-[13px] text-[#94a3b8] leading-[1.5]">
              <i className="fas fa-phone text-orange-main mt-[3px] shrink-0"></i>{" "}
              0333 123 456
            </li>
            <li className="flex gap-[10px] text-[13px] text-[#94a3b8] leading-[1.5]">
              <i className="fas fa-envelope text-orange-main mt-[3px] shrink-0"></i>{" "}
              support@buycode.vn
            </li>
            <li className="flex gap-[10px] text-[13px] text-[#94a3b8] leading-[1.5]">
              <i className="fas fa-clock text-orange-main mt-[3px] shrink-0"></i>{" "}
              Thời gian: 8:00 – 22:00 (T2 – CN)
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/5 py-[20px]">
        <div className="max-w-[1350px] mx-auto px-[14px] md:px-5 flex flex-col md:flex-row items-start md:items-center justify-between flex-wrap gap-[10px] md:gap-[12px] text-[13px] text-[#64748b]">
          <span>© 2024 BUYCODE.VN. All rights reserved.</span>
          <div className="flex gap-[8px] items-center">
            <span className="p-[4px_10px] border border-white/15 rounded-[5px] text-[11px] font-bold text-[#94a3b8]">
              VISA
            </span>
            <span className="p-[4px_10px] border border-white/15 rounded-[5px] text-[11px] font-bold text-[#94a3b8]">
              Mastercard
            </span>
            <span className="p-[4px_10px] border border-white/15 rounded-[5px] text-[11px] font-bold text-[#94a3b8]">
              MoMo
            </span>
            <span className="p-[4px_10px] border border-white/15 rounded-[5px] text-[11px] font-bold text-[#94a3b8]">
              ZaloPay
            </span>
            <span className="p-[4px_10px] border border-white/15 rounded-[5px] text-[11px] font-bold text-[#94a3b8]">
              napas
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
