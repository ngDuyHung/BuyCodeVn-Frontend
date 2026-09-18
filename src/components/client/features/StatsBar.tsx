export default function StatsBar() {
  return (
    // STATS BAR
    <div className="bg-blue-nav py-[24px] lg:py-[30px]">
      <div className="max-w-[1350px] mx-auto px-5 grid grid-cols-2 md:grid-cols-3 lg:flex lg:justify-around lg:flex-wrap gap-[14px] md:gap-[20px] justify-items-start lg:justify-items-center">
        <div className="flex items-center gap-[14px] text-white">
          <i className="fas fa-users text-[22px] md:text-[28px] text-orange-main opacity-90"></i>
          <div className="flex flex-col">
            <span className="text-[18px] md:text-[22px] font-extrabold text-white">
              10.000+
            </span>
            <span className="text-[12.5px] text-[#93c5fd]">
              Khách hàng tin tưởng
            </span>
          </div>
        </div>
        <div className="flex items-center gap-[14px] text-white">
          <i className="fas fa-code text-[22px] md:text-[28px] text-orange-main opacity-90"></i>
          <div className="flex flex-col">
            <span className="text-[18px] md:text-[22px] font-extrabold text-white">
              5.000+
            </span>
            <span className="text-[12.5px] text-[#93c5fd]">
              Mã nguồn chất lượng
            </span>
          </div>
        </div>
        <div className="flex items-center gap-[14px] text-white">
          <i className="fas fa-server text-[22px] md:text-[28px] text-orange-main opacity-90"></i>
          <div className="flex flex-col">
            <span className="text-[18px] md:text-[22px] font-extrabold text-white">
              3.000+
            </span>
            <span className="text-[12.5px] text-[#93c5fd]">
              Server đang hoạt động
            </span>
          </div>
        </div>
        <div className="flex items-center gap-[14px] text-white">
          <i className="fas fa-clock text-[22px] md:text-[28px] text-orange-main opacity-90"></i>
          <div className="flex flex-col">
            <span className="text-[18px] md:text-[22px] font-extrabold text-white">
              99.9%
            </span>
            <span className="text-[12.5px] text-[#93c5fd]">Uptime ổn định</span>
          </div>
        </div>
        <div className="flex items-center gap-[14px] text-white">
          <i className="fas fa-headset text-[22px] md:text-[28px] text-orange-main opacity-90"></i>
          <div className="flex flex-col">
            <span className="text-[18px] md:text-[22px] font-extrabold text-white">
              24/7
            </span>
            <span className="text-[12.5px] text-[#93c5fd]">
              Hỗ trợ kỹ thuật
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
