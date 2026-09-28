"use client";
/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useState } from "react";
import { useDialogAccessibility } from "@/hooks/useDialogAccessibility";
import { can, type AdminPermission } from "@/lib/admin-permissions";
import type { User } from "@/types/identity";
import type { SiteSettings } from "@/types/site-settings";

interface AdminLink { href: string; label: string; icon: string; permission?: AdminPermission }
interface AdminGroup { id: string; label: string; icon: string; links: AdminLink[] }

const groups: AdminGroup[] = [
  { id: "identity", label: "Người dùng & quyền", icon: "fa-user-shield", links: [
    { href: "/admin/users", label: "Người dùng", icon: "fa-users", permission: "users.view" },
    { href: "/admin/permissions", label: "Quyền hạn", icon: "fa-shield-halved", permission: "roles.manage" },
  ] },
  { id: "content", label: "Nội dung", icon: "fa-layer-group", links: [
    { href: "/admin/catalog/categories", label: "Danh mục sản phẩm", icon: "fa-folder-tree", permission: "catalog.view" },
    { href: "/admin/catalog/products", label: "Sản phẩm", icon: "fa-boxes-stacked", permission: "catalog.view" },
  ] },
  { id: "settings", label: "Cài đặt", icon: "fa-gear", links: [
    { href: "/admin/settings/general", label: "Cài đặt website", icon: "fa-sliders", permission: "settings.view" },
    { href: "/admin/settings/presentation", label: "Trình diễn ảnh", icon: "fa-images", permission: "settings.view" },
    { href: "/admin/settings/navigation", label: "Danh mục menu", icon: "fa-bars-staggered", permission: "settings.view" },
  ] },
  { id: "sales", label: "Bán hàng", icon: "fa-cart-shopping", links: [
    { href: "/admin/orders", label: "Đơn hàng", icon: "fa-receipt", permission: "orders.view" },
    { href: "/admin/coupons", label: "Mã giảm giá", icon: "fa-ticket", permission: "orders.manage" },
  ] },
  { id: "services", label: "Dịch vụ", icon: "fa-server", links: [
    { href: "/admin/services", label: "Dịch vụ khách hàng", icon: "fa-list-check", permission: "services.view" },
    { href: "/admin/services/servers", label: "Máy chủ", icon: "fa-server", permission: "services.view" },
    { href: "/admin/services/hosting-plans", label: "Gói hosting", icon: "fa-hard-drive", permission: "services.view" },
    { href: "/admin/services/tld-pricing", label: "Bảng giá TLD", icon: "fa-globe", permission: "services.view" },
    { href: "/admin/vps", label: "VPS Admin", icon: "fa-cloud", permission: "services.view" },
  ] },
  { id: "finance", label: "Tài chính", icon: "fa-coins", links: [
    { href: "/admin/finance/bank-accounts", label: "Tài khoản nhận tiền", icon: "fa-building-columns", permission: "bank_accounts.manage" },
    { href: "/admin/finance/deposits", label: "Phiếu nạp tiền", icon: "fa-money-bill-transfer", permission: "finance.view" },
    { href: "/admin/finance/withdrawals", label: "Yêu cầu rút tiền", icon: "fa-money-bill-wave", permission: "finance.view" },
  ] },
];

const linkIsActive = (pathname: string, href: string) => href === "/admin/services" ? pathname === href : pathname.startsWith(href);

export default function AdminSidebar({ user, pathname, open, onClose, settings }: { user: User; pathname: string; open: boolean; onClose: () => void; settings?: SiteSettings }) {
  const menuRef = useDialogAccessibility(open, onClose);
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(groups.map((group) => group.id)));
  const visibleGroups = groups.map((group) => ({ ...group, links: group.links.filter((link) => !link.permission || can(user, link.permission)) })).filter((group) => group.links.length);
  const toggle = (id: string) => setExpanded((current) => { const next = new Set(current); if (next.has(id)) next.delete(id); else next.add(id); return next; });

  return <div ref={menuRef} tabIndex={-1} role={open ? "dialog" : undefined} aria-modal={open ? "true" : undefined} aria-label={open ? "Menu quản trị" : undefined} className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-[#dce3e5] bg-white lg:sticky lg:top-0 lg:h-screen ${open ? "block" : "hidden lg:block"}`}>
    <div className="flex h-16 items-center justify-between border-b border-[#e4e9ea] px-4"><Link href="/admin" onClick={onClose} className="flex min-w-0 items-center">{settings?.admin_logo_url || settings?.logo_url ? <img src={settings.admin_logo_url ?? settings.logo_url ?? ""} alt={`${settings.site_short_name} Admin`} className="h-9 max-w-40 object-contain" /> : <span className="text-lg font-extrabold text-[#116966]">BUYCODE<span className="text-[#192e38]"> Admin</span></span>}</Link><button type="button" aria-label="Đóng menu" onClick={onClose} className="size-8 shrink-0 text-[#52636c] lg:hidden"><i className="fas fa-xmark" aria-hidden="true" /></button></div>
    <nav aria-label="Điều hướng quản trị" className="h-[calc(100vh-4rem)] overflow-y-auto p-3">
      <Link href="/admin" onClick={onClose} aria-current={pathname === "/admin" ? "page" : undefined} className={`mb-2 flex h-10 items-center gap-3 rounded-md px-3 text-sm font-semibold ${pathname === "/admin" ? "bg-[#e5f2f0] text-[#0d6260]" : "text-[#51636c] hover:bg-[#f2f5f5]"}`}><i className="fas fa-gauge w-5 text-center" aria-hidden="true" />Tổng quan</Link>
      <div className="space-y-2">{visibleGroups.map((group) => {
        const groupActive = group.links.some((link) => linkIsActive(pathname, link.href));
        const isExpanded = expanded.has(group.id);
        return <section key={group.id}><button type="button" aria-expanded={isExpanded} onClick={() => toggle(group.id)} className={`flex h-9 w-full items-center gap-2 px-3 text-left text-xs font-bold uppercase ${groupActive ? "text-[#0d6260]" : "text-[#718087]"}`}><i className={`fas ${group.icon} w-4 text-center`} aria-hidden="true" /><span className="min-w-0 flex-1">{group.label}</span><i className={`fas fa-chevron-down text-[9px] transition-transform ${isExpanded ? "rotate-180" : ""}`} aria-hidden="true" /></button>{isExpanded && <div className="space-y-1">{group.links.map((link) => { const active = linkIsActive(pathname, link.href); return <Link key={link.href} href={link.href} onClick={onClose} aria-current={active ? "page" : undefined} className={`flex min-h-9 items-center gap-3 rounded-md py-2 pl-7 pr-3 text-sm font-semibold ${active ? "bg-[#e5f2f0] text-[#0d6260]" : "text-[#51636c] hover:bg-[#f2f5f5]"}`}><i className={`fas ${link.icon} w-4 text-center`} aria-hidden="true" />{link.label}</Link>; })}</div>}</section>;
      })}</div>
    </nav>
  </div>;
}
