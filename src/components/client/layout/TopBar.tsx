export default function TopBar() {
  return (
    <div className="bg-orange-main text-white text-[13px] py-[7px]">
      <div className="max-w-[1350px] mx-auto px-5 flex flex-wrap justify-center md:justify-between items-center gap-2 text-center md:text-left">
        <span className="font-medium">
          <i className="fas fa-star text-[#fde68a] mr-1"></i>
          Ưu đãi đặc biệt: Giảm đến 20% khi thuê Hosting &amp; VPS trong tháng
          này!
        </span>
        <div className="hidden md:flex gap-5">
          <a
            href="#"
            className="text-white text-[12.5px] flex items-center gap-1 opacity-90 hover:opacity-100 transition-opacity"
          >
            <i className="fas fa-headset text-[12px]"></i> Hỗ trợ 24/7
          </a>
          <a
            href="#"
            className="text-white text-[12.5px] flex items-center gap-1 opacity-90 hover:opacity-100 transition-opacity"
          >
            <i className="fas fa-file-alt text-[12px]"></i> Tài liệu
          </a>
          <a
            href="#"
            className="text-white text-[12.5px] flex items-center gap-1 opacity-90 hover:opacity-100 transition-opacity"
          >
            <i className="fas fa-credit-card text-[12px]"></i> Thanh toán
          </a>
          <a
            href="#"
            className="text-white text-[12.5px] flex items-center gap-1 opacity-90 hover:opacity-100 transition-opacity"
          >
            <i className="fas fa-phone-alt text-[12px]"></i> 0333 123 456
          </a>
        </div>
      </div>
    </div>
  );
}
