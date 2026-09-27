"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useDialogAccessibility } from "@/hooks/useDialogAccessibility";
import { useAuthStore } from "@/stores/authStore";
import { useAuthLogic } from "@/hooks/useAuthLogic";
import { financeService } from "@/services/client/financeService";
import { formatCurrency } from "@/lib/format";

export default function Header() {
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
              <Image
                src="/images/logoweb.png"
                alt="Logo BuyCode.vn"
                width={130}
                height={50}
                priority
                className="h-full object-contain"
              />
            </Link>
          </div>

          {/* Navigation Desktop */}
          <nav className="hidden md:flex items-center gap-1">
            <Link href="/" className={`px-[13px] py-2 text-[14px] font-semibold border-b-2 transition-colors ${pathname === "/" ? "text-blue-primary border-blue-primary" : "text-[#2d3748] border-transparent hover:text-blue-primary"}`}>
              Trang chủ
            </Link>
            <div className="relative group">
              <Link href="/source-code" className={`px-[13px] py-2 text-[14px] font-medium hover:text-blue-primary hover:bg-[#eef4ff] rounded-md transition-colors flex items-center gap-1 ${pathname.startsWith("/source-code") ? "text-blue-primary" : "text-[#2d3748]"}`}>
                Mã nguồn <i className="fas fa-chevron-down text-[10px]"></i>
              </Link>
            </div>
            <Link href="/hosting" className={`px-[13px] py-2 text-[14px] font-medium hover:text-blue-primary hover:bg-[#eef4ff] rounded-md transition-colors ${pathname.startsWith("/hosting") ? "text-blue-primary" : "text-[#2d3748]"}`}>
              Hosting
            </Link>
            <Link href="/vps" className={`px-[13px] py-2 text-[14px] font-medium hover:text-blue-primary hover:bg-[#eef4ff] rounded-md transition-colors ${pathname.startsWith("/vps") ? "text-blue-primary" : "text-[#2d3748]"}`}>
              VPS
            </Link>
            <Link href="/domains" className={`px-[13px] py-2 text-[14px] font-medium hover:text-blue-primary hover:bg-[#eef4ff] rounded-md transition-colors ${pathname.startsWith("/domains") ? "text-blue-primary" : "text-[#2d3748]"}`}>
              Tên miền
            </Link>
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
              ) : (
                isSessionReady && (
                  <Link
                    href="/login"
                    className="bg-blue-primary hover:bg-[#154ea0] text-white px-[22px] py-[9px] rounded-lg text-[14px] font-semibold transition-transform hover:-translate-y-[1px] whitespace-nowrap"
                  >
                    Đăng nhập / Đăng ký
                  </Link>
                )
              )}
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
            <Image
              src="/images/logoweb.png"
              alt="Logo BuyCode.vn"
              width={130}
              height={40}
              className="h-[40px]"
            />
            <button
              className="w-[34px] h-[34px] bg-white border-[1.5px] border-gray-border rounded-lg flex items-center justify-center text-[15px] text-[#6b7280] cursor-pointer hover:bg-red-50 hover:text-red-500 hover:border-red-300 transition-colors"
              onClick={() => setIsMenuOpen(false)}
              aria-label="Đóng menu"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto py-2">
            <Link href="/" onClick={() => setIsMenuOpen(false)} className={`flex items-center justify-between p-[13px_20px] text-[14.5px] font-medium border-l-[3px] transition-colors ${pathname === "/" ? "border-blue-primary bg-[#f0f6ff] text-blue-primary" : "border-transparent text-[#374151] hover:bg-[#f0f6ff] hover:text-blue-primary hover:border-blue-primary"}`}>
              Trang chủ
            </Link>
            <Link href="/source-code" onClick={() => setIsMenuOpen(false)} className={`flex items-center justify-between p-[13px_20px] text-[14.5px] font-medium border-l-[3px] transition-colors ${pathname.startsWith("/source-code") ? "border-blue-primary bg-[#f0f6ff] text-blue-primary" : "text-[#374151] border-transparent hover:bg-[#f0f6ff] hover:text-blue-primary hover:border-blue-primary"}`}>
              Mã nguồn <i className="fas fa-chevron-right text-[11px] text-[#9ca3af]"></i>
            </Link>
            <Link href="/hosting" onClick={() => setIsMenuOpen(false)} className={`flex items-center justify-between p-[13px_20px] text-[14.5px] font-medium border-l-[3px] transition-colors ${pathname.startsWith("/hosting") ? "border-blue-primary bg-[#f0f6ff] text-blue-primary" : "text-[#374151] border-transparent hover:bg-[#f0f6ff] hover:text-blue-primary hover:border-blue-primary"}`}>
              Hosting
            </Link>
            <Link href="/vps" onClick={() => setIsMenuOpen(false)} className={`flex items-center justify-between p-[13px_20px] text-[14.5px] font-medium border-l-[3px] transition-colors ${pathname.startsWith("/vps") ? "border-blue-primary bg-[#f0f6ff] text-blue-primary" : "text-[#374151] border-transparent hover:bg-[#f0f6ff] hover:text-blue-primary hover:border-blue-primary"}`}>
              VPS
            </Link>
            <Link href="/domains" onClick={() => setIsMenuOpen(false)} className={`flex items-center justify-between p-[13px_20px] text-[14.5px] font-medium border-l-[3px] transition-colors ${pathname.startsWith("/domains") ? "border-blue-primary bg-[#f0f6ff] text-blue-primary" : "text-[#374151] border-transparent hover:bg-[#f0f6ff] hover:text-blue-primary hover:border-blue-primary"}`}>
              Tên miền
            </Link>
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
            ) : (
              isSessionReady && (
                <Link
                  href="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="block w-full text-center bg-blue-primary hover:bg-[#154ea0] text-white py-2.5 rounded-lg text-[14px] font-semibold transition-transform"
                >
                  Đăng nhập / Đăng ký
                </Link>
              )
            )}
          </div>
        </div>
      </div>
    </>
  );
}
