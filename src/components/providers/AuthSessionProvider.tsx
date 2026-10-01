"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";
import { AUTH_UNAUTHORIZED_EVENT } from "@/services/api";
import { useAuthStore } from "@/stores/authStore";
import {
  clearAuthTokenCookie,
  setAuthTokenCookie,
} from "@/lib/auth-cookie";

export default function AuthSessionProvider() {
  const router = useRouter();
  const pathname = usePathname();
  const token = useAuthStore((state) => state.token);
  const expiresAt = useAuthStore((state) => state.expiresAt);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const setUser = useAuthStore((state) => state.setUser);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const setSessionReady = useAuthStore((state) => state.setSessionReady);

  useEffect(() => {
    if (!hasHydrated) return;

    let isActive = true;

    const restoreSession = async () => {
      if (!token || (expiresAt !== null && expiresAt <= Date.now())) {
        if (token) clearAuth();
        clearAuthTokenCookie();
        setSessionReady(true);
        if (pathname.startsWith("/user") || pathname.startsWith("/admin")) {
          const destination = `${pathname}${window.location.search}`;
          router.replace(`/login?returnUrl=${encodeURIComponent(destination)}`);
        }
        return;
      }

      // Render the persisted session immediately and verify it in the background.
      if (useAuthStore.getState().user) setSessionReady(true);

      try {
        const remainingSeconds = expiresAt
          ? Math.max(Math.floor((expiresAt - Date.now()) / 1000), 1)
          : 604800;
        setAuthTokenCookie(token, remainingSeconds);
        const user = await authService.getMe();
        if (isActive) setUser(user);
      } catch {
        if (isActive) {
          clearAuth();
          clearAuthTokenCookie();
        }
      } finally {
        if (isActive) setSessionReady(true);
      }
    };

    void restoreSession();
    return () => {
      isActive = false;
    };
  }, [
    clearAuth,
    expiresAt,
    hasHydrated,
    pathname,
    router,
    setSessionReady,
    setUser,
    token,
  ]);

  useEffect(() => {
    const handleUnauthorized = () => {
      const returnUrl = pathname.startsWith("/login")
        ? ""
        : `?returnUrl=${encodeURIComponent(`${pathname}${window.location.search}`)}`;
      router.replace(`/login${returnUrl}`);
    };

    window.addEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);
    return () =>
      window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);
  }, [pathname, router]);

  return null;
}
