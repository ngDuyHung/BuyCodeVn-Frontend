"use client";

import Link from "next/link";
import { useDialogAccessibility } from "@/hooks/useDialogAccessibility";
import { can, type AdminPermission } from "@/lib/admin-permissions";
import type { User } from "@/types/identity";

const links: { href: string; label: string; icon: string; permission?: AdminPermission }[] = [
  { href: "/admin", label: "Tổng quan", icon: "fa-gauge" },
  { href: "/admin/users", label: "Người dùng", icon: "fa-users", permission: "users.view" },
  { href: "/admin/permissions", label: "Quyền hạn", icon: "fa-shield-halved", permission: "roles.manage" },
  { href: "/admin/catalog/categories", label: "Danh mục", icon: "fa-folder-tree", permission: "catalog.view" },
  { href: "/admin/catalog/products", label: "Sản phẩm", icon: "fa-boxes-stacked", permission: "catalog.view" },
  { href: "/admin/coupons", label: "Mã giảm giá", icon: "fa-ticket", permission: "orders.manage" },
  { href: "/admin/orders", label: "Đơn hàng", icon: "fa-receipt", permission: "orders.view" },
  { href: "/admin/services", label: "Dịch vụ khách hàng", icon: "fa-list-check", permission: "services.view" },
  { href: "/admin/services/servers", label: "Máy chủ", icon: "fa-server", permission: "services.view" },
  { href: "/admin/services/hosting-plans", label: "Gói hosting", icon: "fa-hard-drive", permission: "services.view" },
  { href: "/admin/services/tld-pricing", label: "Bảng giá TLD", icon: "fa-globe", permission: "services.view" },
  { href: "/admin/vps", label: "VPS Admin", icon: "fa-cloud", permission: "services.view" },
  { href: "/admin/finance/bank-accounts", label: "Tài khoản nhận tiền", icon: "fa-building-columns", permission: "bank_accounts.manage" },
  { href: "/admin/finance/deposits", label: "Phiếu nạp tiền", icon: "fa-money-bill-transfer", permission: "finance.view" },
  { href: "/admin/finance/withdrawals", label: "Yêu cầu rút tiền", icon: "fa-money-bill-wave", permission: "finance.view" },
];

export default function AdminSidebar({ user, pathname, open, onClose }: { user: User; pathname: string; open: boolean; onClose: () => void }) {
  const menuRef = useDialogAccessibility(open, onClose);
  return <div ref={menuRef} tabIndex={-1} role={open ? "dialog" : undefined} aria-modal={open ? "true" : undefined} aria-label={open ? "Menu quản trị" : undefined} className={`fixed inset-y-0 left-0 z-40 w-60 border-r border-[#dce3e5] bg-white lg:sticky lg:top-0 lg:h-screen ${open ? "block" : "hidden lg:block"}`}>
    <div className="flex h-16 items-center justify-between border-b border-[#e4e9ea] px-5"><Link href="/admin" onClick={onClose} className="text-lg font-extrabold text-[#116966]">BUYCODE<span className="text-[#192e38]"> Admin</span></Link><button type="button" aria-label="Đóng menu" onClick={onClose} className="size-8 text-[#52636c] lg:hidden"><i className="fas fa-xmark" aria-hidden="true" /></button></div>
    <nav aria-label="Điều hướng quản trị" className="space-y-1 p-3">
      {links.filter((link) => !link.permission || can(user, link.permission)).map((link) => {
        const active = link.href === "/admin" ? pathname === link.href : pathname.startsWith(link.href);
        return <Link key={link.href} href={link.href} onClick={onClose} aria-current={active ? "page" : undefined} className={`flex h-10 items-center gap-3 rounded-md px-3 text-sm font-semibold ${active ? "bg-[#e5f2f0] text-[#0d6260]" : "text-[#51636c] hover:bg-[#f2f5f5]"}`}><i className={`fas ${link.icon} w-5 text-center`} aria-hidden="true" />{link.label}</Link>;
      })}
    </nav>
  </div>;
}
