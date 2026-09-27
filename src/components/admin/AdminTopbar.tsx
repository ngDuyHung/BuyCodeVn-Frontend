"use client";

import Link from "next/link";

export default function AdminTopbar({ name, menuOpen, onOpenMenu, onLogout }: { name: string; menuOpen: boolean; onOpenMenu: () => void; onLogout: () => void }) {
  return <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-[#dce3e5] bg-white px-4 md:px-6">
    <div className="flex min-w-0 items-center gap-3"><button type="button" aria-label="Mở menu" aria-expanded={menuOpen} onClick={onOpenMenu} className="size-9 text-[#35535c] lg:hidden"><i className="fas fa-bars" aria-hidden="true" /></button><span className="truncate text-sm font-semibold text-[#52636c]">Quản trị hệ thống</span></div>
    <div className="flex items-center gap-2 sm:gap-4"><Link href="/" title="Trang khách hàng" aria-label="Trang khách hàng" className="text-[#52636c] hover:text-[#116966]"><i className="fas fa-arrow-up-right-from-square" aria-hidden="true" /></Link><span className="hidden max-w-40 truncate text-sm font-semibold sm:inline">{name}</span><button type="button" onClick={onLogout} title="Đăng xuất" aria-label="Đăng xuất" className="size-9 text-[#52636c] hover:text-red-700"><i className="fas fa-right-from-bracket" aria-hidden="true" /></button></div>
  </header>;
}
