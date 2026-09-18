"use client";

import { useState } from "react";
import Link from "next/link";

// Mock data tạm thời để hiển thị UI (sau này sẽ lấy từ API)
const MOCK_ORDERS: any[] = [];

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState("all");

  const tabs = [
    { id: "all", label: "Tất cả đơn hàng" },
    { id: "completed", label: "Đã hoàn thành" },
    { id: "processing", label: "Đang xử lý" },
    { id: "cancelled", label: "Đã hủy" },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-border shadow-[0_2px_12px_rgba(0,0,0,.04)] overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-border">
        <h1 className="text-[20px] font-extrabold text-blue-nav mb-1">
          Lịch sử đơn hàng
        </h1>
        <p className="text-[14px] text-text-muted">
          Quản lý và theo dõi trạng thái các dịch vụ bạn đã mua
        </p>
      </div>

      {/* Tabs Filter */}
      <div className="flex items-center gap-6 px-6 border-b border-gray-border overflow-x-auto hide-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-4 text-[14px] font-semibold whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-blue-primary text-blue-primary"
                : "border-transparent text-[#64748b] hover:text-blue-primary"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table Data */}
      <div className="p-0 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-border">
              <th className="p-4 text-[13px] font-semibold text-[#475569] whitespace-nowrap">
                Mã ĐH
              </th>
              <th className="p-4 text-[13px] font-semibold text-[#475569] whitespace-nowrap">
                Dịch vụ
              </th>
              <th className="p-4 text-[13px] font-semibold text-[#475569] whitespace-nowrap">
                Số tiền
              </th>
              <th className="p-4 text-[13px] font-semibold text-[#475569] whitespace-nowrap">
                Ngày mua
              </th>
              <th className="p-4 text-[13px] font-semibold text-[#475569] whitespace-nowrap">
                Trạng thái
              </th>
              <th className="p-4 text-[13px] font-semibold text-[#475569] whitespace-nowrap text-right">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody>
            {MOCK_ORDERS.length > 0 ? (
              MOCK_ORDERS.map((order, idx) => (
                <tr
                  key={idx}
                  className="border-b border-gray-border hover:bg-gray-50 transition-colors"
                >
                  {/* Render dữ liệu ở đây sau khi có API */}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-12">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-[#f0f6ff] rounded-full flex items-center justify-center text-blue-primary text-2xl mb-3">
                      <i className="fas fa-box-open"></i>
                    </div>
                    <h3 className="text-[15px] font-bold text-blue-nav mb-1">
                      Chưa có đơn hàng nào
                    </h3>
                    <p className="text-[13px] text-text-muted mb-4 max-w-sm">
                      Bạn chưa thực hiện giao dịch nào trong danh mục này. Hãy
                      khám phá các dịch vụ của chúng tôi nhé!
                    </p>
                    <Link
                      href="/"
                      className="bg-blue-primary hover:bg-[#154ea0] text-white px-5 py-2 rounded-lg text-[13.5px] font-semibold transition-colors"
                    >
                      Xem dịch vụ ngay
                    </Link>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Phân trang (Pagination) - Chỉ hiện khi có data */}
      {MOCK_ORDERS.length > 0 && (
        <div className="p-4 border-t border-gray-border flex items-center justify-between">
          <span className="text-[13px] text-text-muted">
            Hiển thị 1-10 của 100 kết quả
          </span>
          <div className="flex items-center gap-1">
            <button className="w-8 h-8 rounded border border-gray-border flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-50">
              <i className="fas fa-chevron-left text-[11px]"></i>
            </button>
            <button className="w-8 h-8 rounded bg-blue-primary text-white flex items-center justify-center text-[13px] font-semibold">
              1
            </button>
            <button className="w-8 h-8 rounded border border-gray-border flex items-center justify-center text-gray-700 hover:bg-gray-50 text-[13px] font-semibold">
              2
            </button>
            <button className="w-8 h-8 rounded border border-gray-border flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-50">
              <i className="fas fa-chevron-right text-[11px]"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
