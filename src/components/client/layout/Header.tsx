"use client";
/* eslint-disable @next/next/no-img-element */

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDialogAccessibility } from "@/hooks/useDialogAccessibility";
import { useAuthStore } from "@/stores/authStore";
import { useAuthLogic } from "@/hooks/useAuthLogic";
import { financeService } from "@/services/client/financeService";
import { formatCurrency } from "@/lib/format";
import type { NavigationItem } from "@/types/navigation";
import { DEFAULT_SITE_SETTINGS, type SiteSettings } from "@/types/site-settings";

const defaultItems: NavigationItem[] = [
  { id: -1, label: "Trang chủ", url: "/", icon: null, target: "_self", children: [] },
  { id: -2, label: "Mã nguồn", url: "/source-code", icon: null, target: "_self", children: [] },
  { id: -3, label: "Hosting", url: "/hosting", icon: null, target: "_self", children: [] },
  { id: -4, label: "VPS", url: "/vps", icon: null, target: "_self", children: [] },
  { id: -5, label: "Tên miền", url: "/domains", icon: null, target: "_self", children: [] },
];

const isActive = (pathname: string, url: string | null) => Boolean(url && (url === "/" ? pathname === "/" : pathname.startsWith(url)));

function MenuLink({ item, className, onClick }: { item: NavigationItem; className: string; onClick?: () => void }) {
  const content = <>{item.icon && <i className={`fas ${item.icon} w-4 text-center`} aria-hidden="true" />}{item.label}</>;
  if (!item.url) return <button type="button" onClick={onClick} className={className}>{content}</button>;
  return <Link href={item.url} target={item.target} rel={item.target === "_blank" ? "noopener noreferrer" : undefined} onClick={onClick} className={className}>{content}</Link>;
}

export default function Header({ items = defaultItems, settings = DEFAULT_SITE_SETTINGS }: { items?: NavigationItem[]; settings?: SiteSettings }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [walletSnapshot, setWalletSnapshot] = useState<{ userId: number; balance: string } | null>(null);
  const pathname = usePathname();

  const { isAuthenticated, isSessionReady, user } = useAuthStore();
  const { logout } = useAuthLogic();
  const displayedWalletBalance = walletSnapshot && walletSnapshot.userId === user?.id
    ? walletSnapshot.balance
    : user?.wallet?.balance ?? null;
  const mobileMenuRef = useDialogAccessibility(
    isMenuOpen,
    () => setIsMenuOpen(false),
  );

  useEffect(() => {
    if (!isSessionReady || !isAuthenticated) return;
    const controller = new AbortController();
    financeService.getWallet(controller.signal)
      .then((wallet) => { if (user) setWalletSnapshot({ userId: user.id, balance: wallet.balance }); })
      .catch(() => undefined);
    return () => controller.abort();
  }, [isAuthenticated, isSessionReady, pathname, user]);

  // Đóng menu khi resize màn hình lớn hơn 768px
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) setIsMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Đóng dropdown profile khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as Element).closest(".profile-dropdown")) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      {/* HEADER DESKTOP & MOBILE BAR */}
      <header className="bg-white border-b border-gray-border sticky top-0 z-[100] shadow-[0_2px_10px_rgba(0,0,0,.08)]">
        <div className="max-w-[1350px] mx-auto px-5 flex items-center justify-between gap-5 py-2.5 md:py-1.5">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <Link
              href="/"
              className="flex items-center justify-center relative w-[130px] h-[38px] md:h-[50px]"
            >
              <img src={settings.logo_url ?? "/images/logoweb.png"} alt={`Logo ${settings.site_name}`} className="h-full w-full object-contain" />
            </Link>
          </div>

          {/* Navigation Desktop */}
          <nav className="hidden md:flex items-center gap-1">
            {items.map((item) => <div key={item.id} className="group relative">
              <div className={`flex items-center rounded-md transition-colors hover:bg-[var(--color-blue-primary-soft)] ${isActive(pathname, item.url) || item.children.some((child) => isActive(pathname, child.url)) ? "text-blue-primary" : "text-[#2d3748]"}`}>
                <MenuLink item={item} className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold" />
                {item.children.length > 0 && <i className="fas fa-chevron-down -ml-1 mr-3 text-[9px] transition-transform group-hover:rotate-180" aria-hidden="true" />}
              </div>
              {item.children.length > 0 && <div className="invisible absolute left-0 top-full z-50 min-w-56 translate-y-1 border border-[#dce3e5] bg-white py-1 opacity-0 shadow-[0_12px_30px_rgba(17,47,58,.15)] transition group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">{item.children.map((child) => <MenuLink key={child.id} item={child} className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium hover:bg-[#eef4f4] hover:text-[var(--color-blue-primary)] ${isActive(pathname, child.url) ? "bg-[#e5f2f0] text-[var(--color-blue-primary)]" : "text-[#40545d]"}`} />)}</div>}
            </div>)}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3 md:gap-4">
            {isSessionReady && isAuthenticated && (
              <Link href="/user/deposit" aria-label="Số dư ví, nạp tiền" className="hidden h-10 items-center gap-2 border-r border-gray-border pr-4 text-sm md:flex">
                <i className="fas fa-wallet text-orange-main" aria-hidden="true" />
                <span className="whitespace-nowrap font-bold text-blue-nav">{displayedWalletBalance === null ? "Đang tải..." : formatCurrency(displayedWalletBalance)}</span>
              </Link>
            )}
            {/* User Profile / Auth Actions */}
            <div className="hidden md:block">
              {isSessionReady && isAuthenticated ? (
                <div className="relative profile-dropdown">
                  <button 
                    onClick={() => setIsProfileOpen(!isProfileOpen)} 
                    aria-expanded={isProfileOpen}
                    aria-haspopup="menu"
                    aria-label="Mở menu tài khoản"
                    className="flex items-center gap-2.5 p-1 pr-3 rounded-full border border-gray-border hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-orange-main text-white flex items-center justify-center font-bold text-[14px]">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <span className="text-[14px] font-semibold text-[#374151] max-w-[120px] truncate">
                      {user?.name}
                    </span>
                    <i className="fas fa-chevron-down text-[10px] text-gray-400"></i>
                  </button>
                  
                  {/* Dropdown Menu */}
                  {isProfileOpen && (
                    <div role="menu" className="absolute right-0 mt-2 w-56 bg-white border border-gray-border rounded-xl shadow-[0_10px_25px_rgba(0,0,0,.1)] py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-border mb-1">
                        <p className="text-[13px] text-text-muted">Đăng nhập với</p>
                        <p className="text-[14px] font-bold text-blue-nav truncate">{user?.email}</p>
                      </div>
                      <Link href="/user" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-[13.5px] text-[#374151] hover:bg-[#f0f6ff] hover:text-blue-primary transition-colors">
                        <i className="fas fa-user-circle w-4 text-center"></i> Quản lý tài khoản
                      </Link>
                      <Link href="/user/orders" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-[13.5px] text-[#374151] hover:bg-[#f0f6ff] hover:text-blue-primary transition-colors">
                        <i className="fas fa-box w-4 text-center"></i> Lịch sử đơn hàng
                      </Link>
                      <div className="border-t border-gray-border my-1"></div>
                      <button 
                        onClick={() => {
                          logout();
                          setIsProfileOpen(false);
                        }} 
                        className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-[13.5px] text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <i className="fas fa-sign-out-alt w-4 text-center"></i> Đăng xuất
                      </button>
                    </div>
                  )}
                </div>
              ) : isSessionReady ? (
                <Link
                  href="/login"
                  className="bg-blue-primary hover:bg-[var(--color-blue-primary-hover)] text-white px-[22px] py-[9px] rounded-lg text-[14px] font-semibold transition-transform hover:-translate-y-[1px] whitespace-nowrap"
                >
                  Đăng nhập / Đăng ký
                </Link>
              ) : <div className="skeleton-shimmer h-10 w-[152px] rounded-lg" role="status" aria-label="Đang kiểm tra phiên đăng nhập" />}
            </div>

            {/* Hamburger Button */}
            <button
              className={`hamburger-btn md:hidden flex flex-col justify-between w-9 h-[26px] bg-transparent border-[1.5px] border-gray-border rounded-lg cursor-pointer p-[6px_7px] shrink-0 hover:bg-[#f3f6ff] hover:border-blue-primary transition-colors ${isMenuOpen ? "open" : ""}`}
              onClick={() => setIsMenuOpen(true)}
              aria-label="Mở menu"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-navigation"
            >
              <span className="block h-[2px] bg-[#374151] rounded-[2px] w-full transition-all duration-300"></span>
              <span className="block h-[2px] bg-[#374151] rounded-[2px] w-full transition-all duration-300"></span>
              <span className="block h-[2px] bg-[#374151] rounded-[2px] w-full transition-all duration-300"></span>
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE MENU OVERLAY & PANEL */}
      <div
        className={`fixed inset-0 z-[998] ${isMenuOpen ? "block" : "hidden"}`}
      >
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-[2px] animate-fadeIn"
          onClick={() => setIsMenuOpen(false)}
        ></div>

        <div
          ref={mobileMenuRef}
          id="mobile-navigation"
          role="dialog"
          aria-modal="true"
          aria-label="Điều hướng chính"
          tabIndex={-1}
          className={`absolute top-0 left-0 w-[285px] h-full bg-white flex flex-col transform transition-transform duration-300 ease-[cubic-bezier(.4,0,.2,1)] shadow-[4px_0_30px_rgba(0,0,0,.18)] z-[1] ${isMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="flex items-center justify-between p-[14px_18px] border-b border-gray-border bg-[#f9fafb]">
            <img src={settings.logo_url ?? "/images/logoweb.png"} alt={`Logo ${settings.site_name}`} className="h-10 w-[130px] object-contain" />
            <button
              className="w-[34px] h-[34px] bg-white border-[1.5px] border-gray-border rounded-lg flex items-center justify-center text-[15px] text-[#6b7280] cursor-pointer hover:bg-red-50 hover:text-red-500 hover:border-red-300 transition-colors"
              onClick={() => setIsMenuOpen(false)}
              aria-label="Đóng menu"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto py-2">
            {items.map((item) => <div key={item.id} className="border-b border-[#edf1f2] last:border-0"><MenuLink item={item} onClick={item.url ? () => setIsMenuOpen(false) : undefined} className={`flex w-full items-center gap-2 border-l-[3px] px-5 py-3 text-left text-[14.5px] font-semibold transition-colors ${isActive(pathname, item.url) ? "border-blue-primary bg-[#f0f6ff] text-blue-primary" : "border-transparent text-[#374151] hover:bg-[#f0f6ff] hover:text-blue-primary"}`} />{item.children.length > 0 && <div className="bg-[#f8fafb] py-1">{item.children.map((child) => <MenuLink key={child.id} item={child} onClick={() => setIsMenuOpen(false)} className={`flex items-center gap-2 py-2.5 pl-10 pr-5 text-sm ${isActive(pathname, child.url) ? "font-semibold text-[var(--color-blue-primary)]" : "text-[#60727a]"}`} />)}</div>}</div>)}
          </nav>

          <div className="p-[16px_18px] border-t border-gray-border bg-gray-50">
            {isSessionReady && isAuthenticated ? (
              <div className="flex flex-col gap-2.5">
                <Link href="/user/deposit" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-between rounded-md border border-gray-border bg-white px-3 py-2 text-sm">
                  <span className="text-text-muted"><i className="fas fa-wallet mr-2 text-orange-main" aria-hidden="true" />Số dư ví</span>
                  <strong className="text-blue-nav">{displayedWalletBalance === null ? "Đang tải..." : formatCurrency(displayedWalletBalance)}</strong>
                </Link>
                <div className="flex items-center gap-3 mb-1 px-1">
                  <div className="w-10 h-10 rounded-full bg-orange-main text-white flex items-center justify-center font-bold text-[16px] shrink-0">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[14px] font-bold text-blue-nav truncate">{user?.name}</p>
                    <p className="text-[12px] text-text-muted truncate">{user?.email}</p>
                  </div>
                </div>
                <Link 
                  href="/user" 
                  onClick={() => setIsMenuOpen(false)} 
                  className="block w-full text-center bg-white border border-gray-border text-[#374151] py-2 rounded-lg text-[13.5px] font-semibold transition-colors hover:border-blue-primary hover:text-blue-primary"
                >
                  Quản lý tài khoản
                </Link>
                <button 
                  onClick={() => { logout(); setIsMenuOpen(false); }} 
                  className="block w-full text-center bg-red-50 text-red-500 py-2 rounded-lg text-[13.5px] font-semibold transition-colors hover:bg-red-100"
                >
                  Đăng xuất
                </button>
              </div>
            ) : isSessionReady ? (
              <Link
                href="/login"
                onClick={() => setIsMenuOpen(false)}
                className="block w-full text-center bg-blue-primary hover:bg-[var(--color-blue-primary-hover)] text-white py-2.5 rounded-lg text-[14px] font-semibold transition-transform"
              >
                Đăng nhập / Đăng ký
              </Link>
            ) : <div className="skeleton-shimmer h-10 w-full rounded-lg" role="status" aria-label="Đang kiểm tra phiên đăng nhập" />}
          </div>
        </div>
      </div>
    </>
  );
}
