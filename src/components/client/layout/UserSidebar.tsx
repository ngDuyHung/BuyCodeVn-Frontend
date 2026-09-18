"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthLogic } from "@/hooks/useAuthLogic";
import { useAuthStore } from "@/stores/authStore";

export default function UserSidebar() {
  const pathname = usePathname();
  const { logout } = useAuthLogic();
  const { user } = useAuthStore();

  const menuItems = [
    { name: "Tổng quan", path: "/user", icon: "fas fa-home" },
    {
      name: "Lịch sử mua hàng",
      path: "/user/orders",
      icon: "fas fa-shopping-bag",
    },
    { name: "Quản lý Hosting", path: "/user/hosting", icon: "fas fa-server" },
    { name: "Quản lý VPS", path: "/user/vps", icon: "fas fa-cloud" },
    { name: "Tên miền", path: "/user/domains", icon: "fas fa-globe" },
    { name: "Nạp tiền vào ví", path: "/user/deposit", icon: "fas fa-wallet" },
    { name: "Đổi mật khẩu", path: "/user/change-password", icon: "fas fa-key" },
  ];

  return (
    <aside className="bg-white border border-gray-border rounded-xl shadow-[0_2px_12px_rgba(0,0,0,.04)] overflow-hidden">
      {/* Box thông tin User */}
      <div className="p-5 border-b border-gray-border bg-gray-50 flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-orange-main text-white flex items-center justify-center font-bold text-lg shrink-0">
          {user?.name?.charAt(0).toUpperCase() || "U"}
        </div>
        <div className="min-w-0">
          <p className="text-[15px] font-bold text-blue-nav truncate">
            {user?.name}
          </p>
          <p className="text-[13px] text-text-muted truncate">{user?.email}</p>
        </div>
      </div>

      {/* Danh sách Menu */}
      <nav className="p-3 flex flex-col gap-1">
        {menuItems.map((item) => {
          // Xử lý active (Trang chủ /user cần so sánh chính xác tuyệt đối, các trang con so sánh startsWith)
          const isActive =
            item.path === "/user"
              ? pathname === item.path
              : pathname.startsWith(item.path);

          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-[14px] font-medium transition-colors ${
                isActive
                  ? "bg-[#f0f6ff] text-blue-primary"
                  : "text-[#475569] hover:bg-gray-50 hover:text-blue-primary"
              }`}
            >
              <i
                className={`${item.icon} w-5 text-center ${isActive ? "text-blue-primary" : "text-gray-400"}`}
              ></i>
              {item.name}
            </Link>
          );
        })}

        <div className="border-t border-gray-border my-2"></div>

        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-[14px] font-medium text-red-500 hover:bg-red-50 transition-colors w-full text-left"
        >
          <i className="fas fa-sign-out-alt w-5 text-center text-red-400"></i>
          Đăng xuất
        </button>
      </nav>
    </aside>
  );
}
