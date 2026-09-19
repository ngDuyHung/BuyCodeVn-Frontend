import { beforeEach, describe, expect, it } from "vitest";
import { useAuthStore } from "./authStore";
import type { User } from "@/types/identity";

const user: User = {
  id: 1,
  name: "Nguyen Van A",
  email: "user@example.com",
  is_active: true,
  roles: ["customer"],
  permissions: [],
};

describe("authStore", () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthStore.getState().clearAuth();
    useAuthStore.getState().setSessionReady(false);
  });

  it("stores an authenticated session", () => {
    useAuthStore.getState().setAuth("token-123", user);

    expect(useAuthStore.getState()).toMatchObject({
      token: "token-123",
      user,
      isAuthenticated: true,
      isSessionReady: true,
    });
    expect(useAuthStore.getState().expiresAt).toBeGreaterThan(Date.now());
  });

  it("clears credentials without changing hydration state", () => {
    useAuthStore.getState().setAuth("token-123", user);
    useAuthStore.getState().clearAuth();

    expect(useAuthStore.getState()).toMatchObject({
      token: null,
      user: null,
      expiresAt: null,
      isAuthenticated: false,
    });
  });
});
