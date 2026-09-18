export default function Newsletter() {
  return (
    //NEWSLETTER
    <div className="bg-blue-nav py-[28px] lg:py-[32px]">
      <div className="max-w-[1350px] mx-auto px-[14px] md:px-5 flex items-start md:items-center justify-between gap-[20px] lg:gap-[30px] flex-col md:flex-row flex-wrap">
        <div className="flex items-center gap-[16px] text-white">
          <i className="fas fa-envelope text-[28px] text-orange-main bg-orange-main/15 p-[12px] rounded-[10px]"></i>
          <div>
            <h3 className="text-[17px] font-bold mb-[4px]">
              Đăng ký nhận tin khuyến mãi
            </h3>
            <p className="text-[13px] text-[#93c5fd]">
              Nhận ngay thông tin khuyến mãi mới nhất từ BUYCODE.VN
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-[10px] flex-1 max-w-full md:max-w-[440px] w-full">
          <input
            type="email"
            placeholder="Nhập email của bạn..."
            className="flex-1 p-[12px_18px] rounded-[8px] border-none text-[14px] outline-none w-full sm:w-auto text-gray-800"
          />
          <button className="bg-orange-main text-white border-none p-[12px_24px] rounded-[8px] font-bold text-[14px] cursor-pointer whitespace-nowrap transition-colors hover:bg-orange-dark w-full sm:w-auto">
            Đăng ký ngay
          </button>
        </div>
      </div>
    </div>
  );
}
