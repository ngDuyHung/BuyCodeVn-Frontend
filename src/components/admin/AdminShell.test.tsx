import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "@/stores/authStore";
import AdminShell from "./AdminShell";

const replace = vi.fn();
vi.mock("next/navigation", () => ({ usePathname: () => "/admin", useRouter: () => ({ replace }) }));
vi.mock("@/hooks/useAuthLogic", () => ({ useAuthLogic: () => ({ logout: vi.fn() }) }));

describe("AdminShell", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({ isSessionReady: true, isAuthenticated: true, user: null });
  });

  it("shows 403 for a customer and no admin navigation", () => {
    useAuthStore.setState({ user: { id: 1, name: "Customer", email: "c@example.com", is_active: true, roles: ["customer"], permissions: [] } });
    render(<AdminShell>Admin content</AdminShell>);
    expect(screen.getByText(/403 · Không có quyền truy cập/)).toBeInTheDocument();
    expect(screen.queryByRole("navigation", { name: "Điều hướng quản trị" })).not.toBeInTheDocument();
  });

  it("renders only links granted by the backend permission list", () => {
    useAuthStore.setState({ user: { id: 2, name: "Operator", email: "o@example.com", is_active: true, roles: ["cskh"], permissions: ["users.view"] } });
    render(<AdminShell>Admin content</AdminShell>);
    expect(screen.getByRole("link", { name: /Người dùng/ })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Quyền hạn/ })).not.toBeInTheDocument();
    expect(screen.getByText("Admin content")).toBeInTheDocument();
  });

  it("allows the backend super-admin role without explicit permissions", () => {
    useAuthStore.setState({ user: { id: 3, name: "Admin", email: "a@example.com", is_active: true, roles: ["admin"], permissions: [] } });
    render(<AdminShell>Admin content</AdminShell>);
    expect(screen.getByRole("link", { name: /Người dùng/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Quyền hạn/ })).toBeInTheDocument();
  });

  it("redirects expired sessions to login", () => {
    useAuthStore.setState({ isAuthenticated: false, user: null });
    render(<AdminShell>Admin content</AdminShell>);
    expect(replace).toHaveBeenCalledWith("/login?returnUrl=%2Fadmin");
    expect(screen.queryByText("Admin content")).not.toBeInTheDocument();
  });
});
