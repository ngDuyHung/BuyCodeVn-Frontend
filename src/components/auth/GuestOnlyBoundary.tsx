"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSafeReturnUrl } from "@/lib/auth-redirect";
import { useAuthStore } from "@/stores/authStore";

export default function GuestOnlyBoundary({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isSessionReady = useAuthStore((state) => state.isSessionReady);

  useEffect(() => {
    if (!isSessionReady || !isAuthenticated) return;
    router.replace(getSafeReturnUrl(window.location.search));
  }, [isAuthenticated, isSessionReady, router]);

  if (!isSessionReady || isAuthenticated) {
    return <div className="flex min-h-80 w-full items-center justify-center px-4 py-10" role="status" aria-label="Đang kiểm tra phiên đăng nhập"><div className="w-full max-w-md rounded-lg border border-[#e4e9eb] bg-white p-8"><div className="skeleton-shimmer mx-auto h-7 w-40 rounded" /><div className="skeleton-shimmer mx-auto mt-3 h-4 w-64 max-w-full rounded" /><div className="skeleton-shimmer mt-8 h-10 w-full rounded" /><div className="skeleton-shimmer mt-4 h-10 w-full rounded" /><div className="skeleton-shimmer mt-6 h-11 w-full rounded" /></div><span className="sr-only">Đang kiểm tra phiên đăng nhập...</span></div>;
  }

  return children;
}
