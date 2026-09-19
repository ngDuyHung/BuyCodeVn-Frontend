"use client";

import React from "react";
import Link from "next/link";

export default function CustomDevBar() {
  return (
    <div className="bg-transparent p-0 relative z-20">
      <div className="max-w-[1350px] mx-auto px-5">
        {/* Khối chính (Giữ nguyên form dáng ngang mỏng, đè lên lề Hero -mt-[30px]) */}
        <div className="bg-white rounded-[10px] md:rounded-[12px] shadow-[0_8px_40px_rgba(0,0,0,.08)] flex flex-col lg:flex-row items-center justify-between p-[16px] lg:p-[16px_24px] gap-[16px] lg:gap-[24px] -mt-[16px] md:-mt-[20px] lg:-mt-[30px] border border-[#e8edf5] relative overflow-hidden">
          {/* =========================================
              PHẦN 1: TIÊU ĐỀ & ĐỊNH DANH DỊCH VỤ
              ========================================= */}
          <div className="flex items-center gap-[14px] lg:w-[32%] w-full">
            <div className="shrink-0 w-[44px] h-[44px] rounded-[10px] bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center text-blue-600 text-[18px] border border-blue-200 shadow-sm">
              <i className="fas fa-laptop-code"></i>
            </div>
            <div>
              <h2 className="text-[14.5px] font-extrabold text-[#0d2137] mb-[2px] leading-tight">
                Gia công hệ thống theo yêu cầu
              </h2>
              <p className="text-[12px] text-[#64748b] leading-tight m-0">
                Giải pháp công nghệ "may đo" chuyên biệt
              </p>
            </div>
          </div>

          {/* Đường kẻ chia vách ngăn (Chỉ hiện trên Desktop) */}
          <div className="hidden lg:block w-[1px] h-[36px] bg-[#e5e7eb] shrink-0"></div>

          {/* =========================================
              PHẦN 2: THÔNG ĐIỆP CHUYÊN GIA (Bố cục ngang)
              ========================================= */}
          <div className="flex-1 flex flex-row flex-wrap items-center justify-between lg:justify-start gap-[20px] lg:gap-[32px] w-full">
            {/* Feature 1 */}
            <div className="flex items-center gap-[10px]">
              <div className="w-[32px] h-[32px] rounded-full bg-orange-50 text-orange-main flex items-center justify-center text-[13px]">
                <i className="fas fa-layer-group"></i>
              </div>
              <div>
                <p className="text-[12.5px] font-bold text-[#374151] leading-none mb-1">
                  Đa dạng nền tảng
                </p>
                <p className="text-[11px] text-[#64748b] leading-none">
                  Web, App, ERP, CRM
                </p>
              </div>
            </div>
            {/* Feature 2 */}
            <div className="flex items-center gap-[10px]">
              <div className="w-[32px] h-[32px] rounded-full bg-blue-50 text-blue-primary flex items-center justify-center text-[13px]">
                <i className="fas fa-hands-helping"></i>
              </div>
              <div>
                <p className="text-[12.5px] font-bold text-[#374151] leading-none mb-1">
                  Hỗ trợ sau bàn giao
                </p>
                <p className="text-[11px] text-[#64748b] leading-none">
                  Cập nhật liên tục
                </p>
              </div>
            </div>

            {/* Social Proof (Nhóm Avatar Ẩn trên Mobile nhỏ để tránh chật) */}
            <div className="hidden xl:flex items-center gap-[10px] ml-auto">
              <div className="flex -space-x-2">
                <div className="w-[28px] h-[28px] rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-[10px] text-blue-600 z-30 shadow-sm">
                  <i className="fas fa-code"></i>
                </div>
                <div className="w-[28px] h-[28px] rounded-full bg-orange-100 border-2 border-white flex items-center justify-center text-[10px] text-orange-500 z-20 shadow-sm">
                  <i className="fas fa-paint-brush"></i>
                </div>
                <div className="w-[28px] h-[28px] rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-gray-600 z-10 shadow-sm">
                  +15
                </div>
              </div>
              <p className="text-[11px] text-[#64748b] font-medium leading-[1.3]">
                Đội ngũ
                <br />
                <span className="text-[#374151] font-bold">Chuyên gia</span>
              </p>
            </div>
          </div>

          <div className="hidden lg:block w-[1px] h-[36px] bg-[#e5e7eb] shrink-0"></div>

          {/* =========================================
              PHẦN 3: NÚT KÊU GỌI HÀNH ĐỘNG
              ========================================= */}
          <div className="shrink-0 w-full lg:w-auto mt-[4px] lg:mt-0">
            <Link
              href="/lien-he"
              className="flex items-center justify-center gap-[8px] bg-blue-primary hover:bg-[#154ea0] text-white px-[24px] py-[11px] rounded-[8px] font-bold text-[13.5px] transition-all shadow-[0_4px_14px_rgba(26,92,184,.25)] hover:-translate-y-[1px] w-full lg:w-auto group"
            >
              Nhận tư vấn ngay
              <i className="fas fa-arrow-right text-[12px] group-hover:translate-x-1 transition-transform"></i>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
