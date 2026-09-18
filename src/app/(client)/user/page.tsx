"use client";

import { useAuthStore } from "@/stores/authStore";
import Link from "next/link";

export default function UserDashboard() {
  const { user } = useAuthStore();

  return (
    <div className="flex flex-col gap-6">
      {/* Box Lời chào & Action */}
      <div className="bg-white p-6 rounded-xl border border-gray-border shadow-[0_2px_12px_rgba(0,0,0,.04)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-blue-nav mb-1">
            Xin chào, {user?.name || "Khách hàng"}!
          </h1>
          <p className="text-[14px] text-text-muted">
            Chào mừng bạn đến với trang quản lý dịch vụ của BUYCODE.VN
          </p>
        </div>
        <Link
          href="/user/deposit"
          className="bg-orange-main hover:bg-orange-dark text-white px-5 py-2.5 rounded-lg text-[14px] font-bold transition-colors flex items-center gap-2 whitespace-nowrap"
        >
          <i className="fas fa-plus-circle"></i> Nạp tiền ngay
        </Link>
      </div>

      {/* Grid Thống kê */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-border shadow-[0_2px_12px_rgba(0,0,0,.04)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-primary flex items-center justify-center text-xl shrink-0">
            <i className="fas fa-wallet"></i>
          </div>
          <div>
            <p className="text-[13px] font-semibold text-text-muted mb-1">
              Số dư ví
            </p>
            {/* Tạm thời hiển thị 0đ, chờ kết nối trường balance từ API */}
            <h3 className="text-lg font-extrabold text-blue-nav">0đ</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-border shadow-[0_2px_12px_rgba(0,0,0,.04)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-orange-50 text-orange-main flex items-center justify-center text-xl shrink-0">
            <i className="fas fa-box"></i>
          </div>
          <div>
            <p className="text-[13px] font-semibold text-text-muted mb-1">
              Đơn hàng
            </p>
            <h3 className="text-lg font-extrabold text-blue-nav">0</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-border shadow-[0_2px_12px_rgba(0,0,0,.04)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-50 text-green-500 flex items-center justify-center text-xl shrink-0">
            <i className="fas fa-server"></i>
          </div>
          <div>
            <p className="text-[13px] font-semibold text-text-muted mb-1">
              Hosting đang chạy
            </p>
            <h3 className="text-lg font-extrabold text-blue-nav">0</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-border shadow-[0_2px_12px_rgba(0,0,0,.04)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center text-xl shrink-0">
            <i className="fas fa-cloud"></i>
          </div>
          <div>
            <p className="text-[13px] font-semibold text-text-muted mb-1">
              VPS đang chạy
            </p>
            <h3 className="text-lg font-extrabold text-blue-nav">0</h3>
          </div>
        </div>
      </div>

      {/* Giao dịch gần đây (Empty State) */}
      <div className="bg-white p-6 rounded-xl border border-gray-border shadow-[0_2px_12px_rgba(0,0,0,.04)]">
        <h2 className="text-[16px] font-bold text-blue-nav mb-4">
          Giao dịch gần đây
        </h2>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 text-2xl mb-3">
            <i className="fas fa-receipt"></i>
          </div>
          <p className="text-[14px] text-text-muted">
            Bạn chưa có giao dịch nào.
          </p>
        </div>
      </div>
    </div>
  );
}
