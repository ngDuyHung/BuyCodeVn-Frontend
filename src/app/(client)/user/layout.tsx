import UserSidebar from "@/components/client/layout/UserSidebar";
import Link from "next/link";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f8fafc] pb-24 pt-6 md:pt-8 lg:pb-8">
      <div className="max-w-[1350px] mx-auto px-4 md:px-5">
        {/* Breadcrumb nhẹ cho trang quản lý */}
        <div className="mb-6 flex items-center gap-2 text-[13px] text-text-muted">
          <Link href="/" className="hover:text-blue-primary transition-colors">
            Trang chủ
          </Link>
          <i className="fas fa-chevron-right text-[10px] text-gray-300"></i>
          <span className="font-semibold text-[#1e293b]">
            Quản lý tài khoản
          </span>
        </div>

        {/* Layout chia cột */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
          {/* Cột trái: Sidebar */}
          <div className="w-full shrink-0 lg:w-[280px]">
            <UserSidebar />
          </div>

          {/* Cột phải: Nội dung chính */}
          <div className="flex-1 w-full min-w-0">{children}</div>
        </div>
      </div>
    </div>
  );
}
