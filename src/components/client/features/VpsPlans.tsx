export default function VpsPlans() {
  return (
    // VPS PLANS TABLE
    <section className="py-[36px] md:py-[40px] lg:py-[60px] lg:pb-[70px] bg-white">
      <div className="max-w-[1350px] mx-auto px-[14px] md:px-5">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between text-left mb-[32px] gap-[10px]">
          <div>
            <h2 className="text-[20px] font-extrabold text-blue-nav m-0">
              Bảng giá VPS Việt Nam
            </h2>
          </div>
          <a
            href="#"
            className="inline-flex items-center gap-[6px] p-[9px_18px] border-[1.5px] border-gray-border rounded-lg text-[13px] font-semibold text-[#374151] whitespace-nowrap transition-all hover:border-blue-primary hover:text-blue-primary hover:bg-[#f0f6ff] shrink-0 self-start md:self-auto"
          >
            Xem tất cả →
          </a>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-[20px] items-start mt-[20px]">
          {/* TABLE  */}
          <div className="overflow-x-auto rounded-[10px] border border-[#e5e7eb]">
            <table className="w-full border-collapse text-[12.5px] md:text-[13.5px] bg-white">
              <thead>
                <tr className="bg-[#f3f4f6]">
                  <th className="text-[#374151] text-[13px] font-semibold p-[10px_12px] md:p-[13px_16px] text-left whitespace-nowrap border-b border-[#e5e7eb]">
                    Gói VPS
                  </th>
                  <th className="text-[#374151] text-[13px] font-semibold p-[10px_12px] md:p-[13px_16px] text-left whitespace-nowrap border-b border-[#e5e7eb]">
                    CPU
                  </th>
                  <th className="text-[#374151] text-[13px] font-semibold p-[10px_12px] md:p-[13px_16px] text-left whitespace-nowrap border-b border-[#e5e7eb]">
                    RAM
                  </th>
                  <th className="text-[#374151] text-[13px] font-semibold p-[10px_12px] md:p-[13px_16px] text-left whitespace-nowrap border-b border-[#e5e7eb]">
                    SSD
                  </th>
                  <th className="text-[#374151] text-[13px] font-semibold p-[10px_12px] md:p-[13px_16px] text-left whitespace-nowrap border-b border-[#e5e7eb]">
                    Bandwidth
                  </th>
                  <th className="text-[#374151] text-[13px] font-semibold p-[10px_12px] md:p-[13px_16px] text-left whitespace-nowrap border-b border-[#e5e7eb]">
                    IPv4
                  </th>
                  <th className="text-[#374151] text-[13px] font-semibold p-[10px_12px] md:p-[13px_16px] text-left whitespace-nowrap border-b border-[#e5e7eb]">
                    Giá / tháng
                  </th>
                  <th className="text-[#374151] text-[13px] font-semibold p-[10px_12px] md:p-[13px_16px] text-left whitespace-nowrap border-b border-[#e5e7eb]">
                    Đặt ngay
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[#f1f5f9] transition-colors duration-[150ms] hover:bg-[#f0f7ff] last:border-b-0">
                  <td className="p-[10px_12px] md:p-[13px_16px] text-[#374151] align-middle whitespace-nowrap">
                    VPS 1
                  </td>
                  <td className="p-[10px_12px] md:p-[13px_16px] text-[#374151] align-middle whitespace-nowrap">
                    1 Core
                  </td>
                  <td className="p-[10px_12px] md:p-[13px_16px] text-[#374151] align-middle whitespace-nowrap">
                    1 GB
                  </td>
                  <td className="p-[10px_12px] md:p-[13px_16px] text-[#374151] align-middle whitespace-nowrap">
                    30 GB
                  </td>
                  <td className="p-[10px_12px] md:p-[13px_16px] text-[#374151] align-middle whitespace-nowrap">
                    Không giới hạn
                  </td>
                  <td className="p-[10px_12px] md:p-[13px_16px] text-[#374151] align-middle whitespace-nowrap">
                    1 IP
                  </td>
                  <td className="p-[10px_12px] md:p-[13px_16px] text-[#374151] align-middle whitespace-nowrap">
                    <span className="font-bold text-blue-nav text-[14px]">
                      99.000đ
                    </span>
                  </td>
                  <td className="p-[10px_12px] md:p-[13px_16px] text-[#374151] align-middle whitespace-nowrap">
                    <a
                      href="#"
                      className="inline-block p-[5px_10px] md:p-[6px_16px] bg-blue-primary text-white rounded-[6px] text-[12px] md:text-[13px] font-semibold transition-colors hover:bg-[#1348a0] whitespace-nowrap"
                    >
                      Đặt ngay
                    </a>
                  </td>
                </tr>
                <tr className="bg-[#fafafa] border-b border-[#f1f5f9] transition-colors duration-[150ms] hover:bg-[#f0f7ff] last:border-b-0">
                  <td className="p-[10px_12px] md:p-[13px_16px] text-[#374151] align-middle whitespace-nowrap">
                    VPS 2
                  </td>
                  <td className="p-[10px_12px] md:p-[13px_16px] text-[#374151] align-middle whitespace-nowrap">
                    2 Core
                  </td>
                  <td className="p-[10px_12px] md:p-[13px_16px] text-[#374151] align-middle whitespace-nowrap">
                    2 GB
                  </td>
                  <td className="p-[10px_12px] md:p-[13px_16px] text-[#374151] align-middle whitespace-nowrap">
                    50 GB
                  </td>
                  <td className="p-[10px_12px] md:p-[13px_16px] text-[#374151] align-middle whitespace-nowrap">
                    Không giới hạn
                  </td>
                  <td className="p-[10px_12px] md:p-[13px_16px] text-[#374151] align-middle whitespace-nowrap">
                    1 IP
                  </td>
                  <td className="p-[10px_12px] md:p-[13px_16px] text-[#374151] align-middle whitespace-nowrap">
                    <span className="font-bold text-blue-nav text-[14px]">
                      199.000đ
                    </span>
                  </td>
                  <td className="p-[10px_12px] md:p-[13px_16px] text-[#374151] align-middle whitespace-nowrap">
                    <a
                      href="#"
                      className="inline-block p-[5px_10px] md:p-[6px_16px] bg-blue-primary text-white rounded-[6px] text-[12px] md:text-[13px] font-semibold transition-colors hover:bg-[#1348a0] whitespace-nowrap"
                    >
                      Đặt ngay
                    </a>
                  </td>
                </tr>
                <tr className="border-b border-[#f1f5f9] transition-colors duration-[150ms] hover:bg-[#f0f7ff] last:border-b-0">
                  <td className="p-[10px_12px] md:p-[13px_16px] text-[#374151] align-middle whitespace-nowrap">
                    VPS 3
                  </td>
                  <td className="p-[10px_12px] md:p-[13px_16px] text-[#374151] align-middle whitespace-nowrap">
                    2 Core
                  </td>
                  <td className="p-[10px_12px] md:p-[13px_16px] text-[#374151] align-middle whitespace-nowrap">
                    4 GB
                  </td>
                  <td className="p-[10px_12px] md:p-[13px_16px] text-[#374151] align-middle whitespace-nowrap">
                    80 GB
                  </td>
                  <td className="p-[10px_12px] md:p-[13px_16px] text-[#374151] align-middle whitespace-nowrap">
                    Không giới hạn
                  </td>
                  <td className="p-[10px_12px] md:p-[13px_16px] text-[#374151] align-middle whitespace-nowrap">
                    1 IP
                  </td>
                  <td className="p-[10px_12px] md:p-[13px_16px] text-[#374151] align-middle whitespace-nowrap">
                    <span className="font-bold text-blue-nav text-[14px]">
                      299.000đ
                    </span>
                  </td>
                  <td className="p-[10px_12px] md:p-[13px_16px] text-[#374151] align-middle whitespace-nowrap">
                    <a
                      href="#"
                      className="inline-block p-[5px_10px] md:p-[6px_16px] bg-blue-primary text-white rounded-[6px] text-[12px] md:text-[13px] font-semibold transition-colors hover:bg-[#1348a0] whitespace-nowrap"
                    >
                      Đặt ngay
                    </a>
                  </td>
                </tr>
                <tr className="bg-[#fafafa] border-b border-[#f1f5f9] transition-colors duration-[150ms] hover:bg-[#f0f7ff] last:border-b-0">
                  <td className="p-[10px_12px] md:p-[13px_16px] text-[#374151] align-middle whitespace-nowrap">
                    VPS 4
                  </td>
                  <td className="p-[10px_12px] md:p-[13px_16px] text-[#374151] align-middle whitespace-nowrap">
                    4 Core
                  </td>
                  <td className="p-[10px_12px] md:p-[13px_16px] text-[#374151] align-middle whitespace-nowrap">
                    8 GB
                  </td>
                  <td className="p-[10px_12px] md:p-[13px_16px] text-[#374151] align-middle whitespace-nowrap">
                    120 GB
                  </td>
                  <td className="p-[10px_12px] md:p-[13px_16px] text-[#374151] align-middle whitespace-nowrap">
                    Không giới hạn
                  </td>
                  <td className="p-[10px_12px] md:p-[13px_16px] text-[#374151] align-middle whitespace-nowrap">
                    1 IP
                  </td>
                  <td className="p-[10px_12px] md:p-[13px_16px] text-[#374151] align-middle whitespace-nowrap">
                    <span className="font-bold text-blue-nav text-[14px]">
                      499.000đ
                    </span>
                  </td>
                  <td className="p-[10px_12px] md:p-[13px_16px] text-[#374151] align-middle whitespace-nowrap">
                    <a
                      href="#"
                      className="inline-block p-[5px_10px] md:p-[6px_16px] bg-blue-primary text-white rounded-[6px] text-[12px] md:text-[13px] font-semibold transition-colors hover:bg-[#1348a0] whitespace-nowrap"
                    >
                      Đặt ngay
                    </a>
                  </td>
                </tr>
                <tr className="border-b border-[#f1f5f9] transition-colors duration-[150ms] hover:bg-[#f0f7ff] last:border-b-0">
                  <td className="p-[10px_12px] md:p-[13px_16px] text-[#374151] align-middle whitespace-nowrap">
                    VPS 5
                  </td>
                  <td className="p-[10px_12px] md:p-[13px_16px] text-[#374151] align-middle whitespace-nowrap">
                    4 Core
                  </td>
                  <td className="p-[10px_12px] md:p-[13px_16px] text-[#374151] align-middle whitespace-nowrap">
                    16 GB
                  </td>
                  <td className="p-[10px_12px] md:p-[13px_16px] text-[#374151] align-middle whitespace-nowrap">
                    200 GB
                  </td>
                  <td className="p-[10px_12px] md:p-[13px_16px] text-[#374151] align-middle whitespace-nowrap">
                    Không giới hạn
                  </td>
                  <td className="p-[10px_12px] md:p-[13px_16px] text-[#374151] align-middle whitespace-nowrap">
                    1 IP
                  </td>
                  <td className="p-[10px_12px] md:p-[13px_16px] text-[#374151] align-middle whitespace-nowrap">
                    <span className="font-bold text-blue-nav text-[14px]">
                      899.000đ
                    </span>
                  </td>
                  <td className="p-[10px_12px] md:p-[13px_16px] text-[#374151] align-middle whitespace-nowrap">
                    <a
                      href="#"
                      className="inline-block p-[5px_10px] md:p-[6px_16px] bg-blue-primary text-white rounded-[6px] text-[12px] md:text-[13px] font-semibold transition-colors hover:bg-[#1348a0] whitespace-nowrap"
                    >
                      Đặt ngay
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          {/* CUSTOM CARD */}
          <div className="rounded-[16px] bg-gradient-to-br from-[#0d2137] via-[#1a3c6e] to-[#1e4fa8] overflow-hidden relative shadow-[0_8px_32px_rgba(13,33,55,.35)] before:content-[''] before:absolute before:-top-[40px] before:-right-[40px] before:w-[160px] before:h-[160px] before:bg-orange-main/12 before:rounded-full after:content-[''] after:absolute after:-bottom-[50px] after:-left-[30px] after:w-[140px] after:h-[140px] after:bg-[#60a5fa]/10 after:rounded-full">
            <div className="p-[28px_24px] relative z-[1] md:grid md:grid-cols-2 md:gap-[16px] md:items-start lg:block text-center md:text-left lg:text-center">
              <div className="vps-custom-icon">
                <div className="flex gap-[8px] justify-center md:justify-start lg:justify-center mb-[20px] md:mb-0 lg:mb-[20px]">
                  <div className="bg-white/10 border border-blue-400/30 rounded-[10px] w-[52px] h-[52px] flex items-center justify-center text-blue-400 text-[20px] backdrop-blur-[4px]">
                    <i className="fas fa-server"></i>
                  </div>
                  <div className="bg-white/10 border border-blue-400/30 rounded-[10px] w-[52px] h-[52px] flex items-center justify-center text-blue-400 text-[20px] backdrop-blur-[4px]">
                    <i className="fas fa-database"></i>
                  </div>
                  <div className="bg-white/10 border border-blue-400/30 rounded-[10px] w-[52px] h-[52px] flex items-center justify-center text-blue-400 text-[20px] backdrop-blur-[4px]">
                    <i className="fas fa-microchip"></i>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-white text-[19px] font-extrabold mb-[10px] leading-[1.3]">
                  Tùy chỉnh cấu hình
                  <br />
                  <span className="text-orange-main">theo nhu cầu</span>
                </h3>
                <p className="text-[#93c5fd] text-[13px] leading-[1.7] mb-[18px]">
                  Bạn cần cấu hình cao hơn?
                  <br />
                  Liên hệ ngay để được tư vấn và nhận ưu đãi tốt nhất!
                </p>
                <a
                  href="#"
                  className="flex items-center justify-center gap-[8px] w-full p-[12px] bg-orange-main text-white rounded-[10px] font-bold text-[14px] transition-all hover:bg-orange-dark hover:-translate-y-[2px] shadow-[0_4px_15px_rgba(249,115,22,.4)]"
                >
                  <i className="fas fa-phone-alt"></i> Liên hệ tư vấn
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
