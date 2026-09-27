"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { hasAdminAccess } from "@/lib/admin-permissions";
import { useAuthStore } from "@/stores/authStore";
import { useAuthLogic } from "@/hooks/useAuthLogic";
import AdminForbidden from "./AdminForbidden";
import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";

export default function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuthLogic();
  const { user, isAuthenticated, isSessionReady } = useAuthStore((state) => state);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (isSessionReady && !isAuthenticated) {
      const destination = `${pathname}${window.location.search}`;
      router.replace(`/login?returnUrl=${encodeURIComponent(destination)}`);
    }
  }, [isAuthenticated, isSessionReady, pathname, router]);

  if (!isSessionReady || !isAuthenticated) {
    return <main className="flex min-h-screen items-center justify-center bg-[#f6f8f9] text-sm text-[#52636c]">Đang kiểm tra quyền truy cập...</main>;
  }
  if (!user || !hasAdminAccess(user)) return <AdminForbidden />;

  return (
    <div className="min-h-screen bg-[#f6f8f9] text-[#172b35] lg:flex">
      {menuOpen && <button type="button" aria-label="Đóng menu" onClick={() => setMenuOpen(false)} className="fixed inset-0 z-30 bg-black/30 lg:hidden" />}
      <AdminSidebar user={user} pathname={pathname} open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="min-w-0 flex-1">
        <AdminTopbar name={user?.name ?? ""} menuOpen={menuOpen} onOpenMenu={() => setMenuOpen(true)} onLogout={() => void logout()} />
        <main className="mx-auto max-w-[1440px] p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
