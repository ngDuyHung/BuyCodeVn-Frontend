import { render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { authService } from "@/services/auth.service";
import { AUTH_UNAUTHORIZED_EVENT } from "@/services/api";
import { useAuthStore } from "@/stores/authStore";
import { clearAuthTokenCookie, setAuthTokenCookie } from "@/lib/auth-cookie";
import AuthSessionProvider from "./AuthSessionProvider";

const navigation = vi.hoisted(() => ({ pathname: "/user/orders", replace: vi.fn() }));
vi.mock("next/navigation", () => ({
  usePathname: () => navigation.pathname,
  useRouter: () => ({ replace: navigation.replace }),
}));
vi.mock("@/services/auth.service", () => ({ authService: { getMe: vi.fn() } }));
vi.mock("@/lib/auth-cookie", () => ({ clearAuthTokenCookie: vi.fn(), setAuthTokenCookie: vi.fn() }));

const user = { id: 1, name: "Customer", email: "customer@example.com", is_active: true, roles: ["customer"], permissions: [] };

describe("AuthSessionProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    navigation.pathname = "/user/orders";
    useAuthStore.setState({ token: "token", user: null, expiresAt: Date.now() + 604800000, isAuthenticated: true, hasHydrated: true, isSessionReady: false });
  });

  it("restores a valid seven-day session from /auth/me", async () => {
    vi.mocked(authService.getMe).mockResolvedValue(user);
    render(<AuthSessionProvider />);

    await waitFor(() => expect(useAuthStore.getState().user).toEqual(user));
    expect(setAuthTokenCookie).toHaveBeenCalledWith("token", expect.any(Number));
    expect(useAuthStore.getState().isSessionReady).toBe(true);
  });

  it("clears and redirects an expired protected session", async () => {
    useAuthStore.setState({ expiresAt: Date.now() - 1 });
    render(<AuthSessionProvider />);

    await waitFor(() => expect(navigation.replace).toHaveBeenCalledWith("/login?returnUrl=%2Fuser%2Forders"));
    expect(clearAuthTokenCookie).toHaveBeenCalled();
    expect(useAuthStore.getState().token).toBeNull();
    expect(authService.getMe).not.toHaveBeenCalled();
  });

  it("redirects with returnUrl when the API reports 401", async () => {
    vi.mocked(authService.getMe).mockResolvedValue(user);
    render(<AuthSessionProvider />);
    await waitFor(() => expect(useAuthStore.getState().isSessionReady).toBe(true));

    window.dispatchEvent(new Event(AUTH_UNAUTHORIZED_EVENT));
    expect(navigation.replace).toHaveBeenCalledWith("/login?returnUrl=%2Fuser%2Forders");
  });
});
