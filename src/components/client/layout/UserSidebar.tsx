"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useDialogAccessibility } from "@/hooks/useDialogAccessibility";
import { useAuthLogic } from "@/hooks/useAuthLogic";
import { useAuthStore } from "@/stores/authStore";

interface MenuItem {
  name: string;
  shortName: string;
  path: string;
  icon: string;
}

interface MenuGroup {
  label: string;
  items: MenuItem[];
}

const menuGroups: MenuGroup[] = [
  { label: "Tài khoản", items: [
    { name: "Tổng quan", shortName: "Tổng quan", path: "/user", icon: "fa-house" },
    { name: "Lịch sử mua hàng", shortName: "Đơn hàng", path: "/user/orders", icon: "fa-receipt" },
  ] },
  { label: "Dịch vụ", items: [
    { name: "Quản lý Hosting", shortName: "Hosting", path: "/user/hosting", icon: "fa-server" },
    { name: "Quản lý VPS", shortName: "VPS", path: "/user/vps", icon: "fa-cloud" },
    { name: "Tên miền", shortName: "Tên miền", path: "/user/domains", icon: "fa-globe" },
  ] },
  { label: "Tài chính", items: [
    { name: "Nạp tiền vào ví", shortName: "Nạp tiền", path: "/user/deposit", icon: "fa-wallet" },
    { name: "Rút tiền", shortName: "Rút tiền", path: "/user/withdraw", icon: "fa-money-bill-transfer" },
    { name: "Lịch sử rút tiền", shortName: "Lịch sử rút", path: "/user/withdrawals", icon: "fa-clock-rotate-left" },
  ] },
  { label: "Bảo mật", items: [
    { name: "Đổi mật khẩu", shortName: "Mật khẩu", path: "/user/change-password", icon: "fa-key" },
  ] },
];

const menuItems = menuGroups.flatMap((group) => group.items);
const mobilePrimaryPaths = new Set(["/user", "/user/orders", "/user/hosting", "/user/vps"]);

const isItemActive = (pathname: string, path: string) => {
  if (path === "/user" || path === "/user/withdraw") return pathname === path;
  return pathname.startsWith(path);
};

export default function UserSidebar() {
  const pathname = usePathname();
  const { logout } = useAuthLogic();
  const user = useAuthStore((state) => state.user);
  const [moreOpen, setMoreOpen] = useState(false);
  const sheetRef = useDialogAccessibility(moreOpen, () => setMoreOpen(false));
  const mobilePrimaryItems = menuItems.filter((item) => mobilePrimaryPaths.has(item.path));
  const moreActive = menuItems.some((item) => !mobilePrimaryPaths.has(item.path) && isItemActive(pathname, item.path));

  return <>
    <aside className="hidden overflow-hidden rounded-lg border border-[#dce4e7] bg-white shadow-[0_8px_28px_rgba(15,43,71,.06)] lg:block">
      <div className="bg-blue-nav px-5 py-5 text-white"><div className="flex items-center gap-3"><div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white/15 text-base font-extrabold ring-1 ring-white/20">{user?.name?.charAt(0).toUpperCase() || "U"}</div><div className="min-w-0"><p className="truncate text-sm font-bold">{user?.name}</p><p className="mt-0.5 truncate text-xs text-white/65">{user?.email}</p></div></div><Link href="/user/deposit" className="mt-4 flex h-9 items-center justify-center gap-2 rounded-md bg-white/10 text-xs font-semibold transition hover:bg-white/20"><i className="fas fa-plus-circle text-orange-main" aria-hidden="true" />Nạp tiền vào ví</Link></div>
      <nav aria-label="Quản lý tài khoản" className="px-3 py-3">{menuGroups.map((group) => <div key={group.label} className="border-b border-[#edf1f2] py-2 last:border-0"><p className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#91a0a7]">{group.label}</p>{group.items.map((item) => { const active = isItemActive(pathname, item.path); return <Link key={item.path} href={item.path} aria-current={active ? "page" : undefined} className={`flex min-h-10 items-center gap-3 rounded-md border-l-[3px] px-3 text-[13px] font-semibold transition-colors ${active ? "border-blue-primary bg-[var(--color-blue-primary-soft)] text-blue-primary" : "border-transparent text-[#52656d] hover:bg-[#f5f7f8] hover:text-blue-nav"}`}><i className={`fas ${item.icon} w-4 text-center ${active ? "text-blue-primary" : "text-[#9aa8ae]"}`} aria-hidden="true" /><span>{item.name}</span></Link>; })}</div>)}<button type="button" onClick={logout} className="mt-2 flex min-h-10 w-full items-center gap-3 rounded-md border-l-[3px] border-transparent px-3 text-left text-[13px] font-semibold text-red-600 transition-colors hover:bg-red-50"><i className="fas fa-arrow-right-from-bracket w-4 text-center" aria-hidden="true" />Đăng xuất</button></nav>
    </aside>

    <nav aria-label="Điều hướng tài khoản trên di động" className="fixed inset-x-0 bottom-0 z-[90] border-t border-[#dce4e7] bg-white/95 px-2 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_25px_rgba(15,43,71,.1)] backdrop-blur lg:hidden"><div className="mx-auto grid max-w-lg grid-cols-5">{mobilePrimaryItems.map((item) => { const active = isItemActive(pathname, item.path); return <Link key={item.path} href={item.path} aria-current={active ? "page" : undefined} className={`flex h-16 min-w-0 flex-col items-center justify-center gap-1 text-[10px] font-semibold ${active ? "text-blue-primary" : "text-[#718289]"}`}><span className={`flex size-8 items-center justify-center rounded-md text-sm ${active ? "bg-[var(--color-blue-primary-soft)]" : ""}`}><i className={`fas ${item.icon}`} aria-hidden="true" /></span><span className="max-w-full truncate px-1">{item.shortName}</span></Link>; })}<button type="button" aria-expanded={moreOpen} aria-controls="mobile-account-menu" onClick={() => setMoreOpen(true)} className={`flex h-16 min-w-0 flex-col items-center justify-center gap-1 text-[10px] font-semibold ${moreActive || moreOpen ? "text-blue-primary" : "text-[#718289]"}`}><span className={`flex size-8 items-center justify-center rounded-md text-sm ${moreActive || moreOpen ? "bg-[var(--color-blue-primary-soft)]" : ""}`}><i className="fas fa-ellipsis" aria-hidden="true" /></span><span>Thêm</span></button></div></nav>

    {moreOpen && <div className="fixed inset-0 z-[110] lg:hidden"><button type="button" aria-label="Đóng menu tài khoản" onClick={() => setMoreOpen(false)} className="absolute inset-0 bg-black/45" /><section ref={sheetRef} id="mobile-account-menu" role="dialog" aria-modal="true" aria-labelledby="mobile-account-menu-title" tabIndex={-1} className="absolute inset-x-0 bottom-0 max-h-[82vh] overflow-y-auto rounded-t-lg bg-white pb-[env(safe-area-inset-bottom)] shadow-2xl"><div className="sticky top-0 flex items-center justify-between border-b border-[#e3e9eb] bg-white px-5 py-4"><div className="min-w-0"><h2 id="mobile-account-menu-title" className="font-extrabold text-blue-nav">Quản lý tài khoản</h2><p className="mt-0.5 truncate text-xs text-[#718289]">{user?.email}</p></div><button type="button" aria-label="Đóng" onClick={() => setMoreOpen(false)} className="flex size-9 items-center justify-center text-[#60727a]"><i className="fas fa-xmark" aria-hidden="true" /></button></div><nav className="grid grid-cols-2 gap-2 p-4" aria-label="Tất cả chức năng tài khoản">{menuItems.map((item) => { const active = isItemActive(pathname, item.path); return <Link key={item.path} href={item.path} onClick={() => setMoreOpen(false)} aria-current={active ? "page" : undefined} className={`flex min-h-14 items-center gap-3 rounded-md border px-3 text-sm font-semibold ${active ? "border-blue-primary bg-[var(--color-blue-primary-soft)] text-blue-primary" : "border-[#e1e7e9] text-[#52656d]"}`}><i className={`fas ${item.icon} w-5 text-center`} aria-hidden="true" /><span>{item.shortName}</span></Link>; })}<button type="button" onClick={() => { setMoreOpen(false); logout(); }} className="col-span-2 flex min-h-12 items-center justify-center gap-2 rounded-md border border-red-200 bg-red-50 text-sm font-semibold text-red-600"><i className="fas fa-arrow-right-from-bracket" aria-hidden="true" />Đăng xuất</button></nav></section></div>}
  </>;
}
