export default function WhyChooseUs() {
  return (
    // WHY CHOOSE US
    <section className="pb-[36px] md:pb-[48px] bg-white">
      <div className="max-w-[1350px] mx-auto px-[14px] md:px-5">
        <div className="border border-gray-border rounded-[12px] overflow-hidden bg-white shadow-[0_2px_16px_rgba(0,0,0,.06)]">
          <div className="p-[16px_24px] border-b border-gray-border text-center bg-[#f9fafb]">
            <h2 className="text-[15px] font-bold text-[#111827] tracking-[.4px] m-0">
              VÌ SAO NÊN CHỌN BUYCODE.VN?
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-0">
            <div className="group flex flex-row items-start gap-[13px] p-[22px_20px] transition-colors duration-[180ms] hover:bg-[#f9fafb] border-b sm:border-r border-gray-border lg:border-b-0">
              <div className="shrink-0 w-[38px] h-[38px] rounded-[9px] bg-[#f3f4f6] flex items-center justify-center text-[#374151] text-[16px] mt-[1px] transition-colors duration-[180ms] group-hover:bg-[#e8edf5] group-hover:text-blue-primary">
                <i className="fas fa-shield-alt"></i>
              </div>
              <div>
                <h4 className="text-[13px] font-bold text-[#111827] mb-[5px] leading-[1.35]">
                  Thanh toán an toàn
                </h4>
                <p className="text-[12px] text-[#6b7280] leading-[1.6] m-0">
                  Nhiều phương thức thanh toán an toàn,{" "}
                  <strong className="font-semibold text-[#374151]">
                    nhanh chóng
                  </strong>
                </p>
              </div>
            </div>
            <div className="group flex flex-row items-start gap-[13px] p-[22px_20px] transition-colors duration-[180ms] hover:bg-[#f9fafb] border-b md:border-r border-gray-border lg:border-b-0 sm:border-r-0">
              <div className="shrink-0 w-[38px] h-[38px] rounded-[9px] bg-[#f3f4f6] flex items-center justify-center text-[#374151] text-[16px] mt-[1px] transition-colors duration-[180ms] group-hover:bg-[#e8edf5] group-hover:text-blue-primary">
                <i className="fas fa-download"></i>
              </div>
              <div>
                <h4 className="text-[13px] font-bold text-[#111827] mb-[5px] leading-[1.35]">
                  Tải về ngay lập tức
                </h4>
                <p className="text-[12px] text-[#6b7280] leading-[1.6] m-0">
                  Nhận mã nguồn ngay sau khi thanh toán thành công
                </p>
              </div>
            </div>
            <div className="group flex flex-row items-start gap-[13px] p-[22px_20px] transition-colors duration-[180ms] hover:bg-[#f9fafb] border-b sm:border-r lg:border-b-0 md:border-r-0 border-gray-border">
              <div className="shrink-0 w-[38px] h-[38px] rounded-[9px] bg-[#f3f4f6] flex items-center justify-center text-[#374151] text-[16px] mt-[1px] transition-colors duration-[180ms] group-hover:bg-[#e8edf5] group-hover:text-blue-primary">
                <i className="fas fa-headset"></i>
              </div>
              <div>
                <h4 className="text-[13px] font-bold text-[#111827] mb-[5px] leading-[1.35]">
                  Hỗ trợ tận tâm
                </h4>
                <p className="text-[12px] text-[#6b7280] leading-[1.6] m-0">
                  Đội ngũ kỹ thuật hỗ trợ bạn{" "}
                  <strong className="font-semibold text-[#374151]">24/7</strong>{" "}
                  mọi lúc mọi nơi
                </p>
              </div>
            </div>
            <div className="group flex flex-row items-start gap-[13px] p-[22px_20px] transition-colors duration-[180ms] hover:bg-[#f9fafb] border-b sm:border-r-0 md:border-r lg:border-b-0 border-gray-border">
              <div className="shrink-0 w-[38px] h-[38px] rounded-[9px] bg-[#f3f4f6] flex items-center justify-center text-[#374151] text-[16px] mt-[1px] transition-colors duration-[180ms] group-hover:bg-[#e8edf5] group-hover:text-blue-primary">
                <i className="fas fa-undo-alt"></i>
              </div>
              <div>
                <h4 className="text-[13px] font-bold text-[#111827] mb-[5px] leading-[1.35]">
                  Hoàn tiền 100%
                </h4>
                <p className="text-[12px] text-[#6b7280] leading-[1.6] m-0">
                  Cam kết hoàn tiền nếu sản phẩm không đúng mô tả
                </p>
              </div>
            </div>
            <div className="group flex flex-row items-start gap-[13px] p-[22px_20px] transition-colors duration-[180ms] hover:bg-[#f9fafb]">
              <div className="shrink-0 w-[38px] h-[38px] rounded-[9px] bg-[#f3f4f6] flex items-center justify-center text-[#374151] text-[16px] mt-[1px] transition-colors duration-[180ms] group-hover:bg-[#e8edf5] group-hover:text-blue-primary">
                <i className="fas fa-sync-alt"></i>
              </div>
              <div>
                <h4 className="text-[13px] font-bold text-[#111827] mb-[5px] leading-[1.35]">
                  Cập nhật miễn phí
                </h4>
                <p className="text-[12px] text-[#6b7280] leading-[1.6] m-0">
                  Miễn phí cập nhật tính năng trong suốt quá trình sử dụng
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
