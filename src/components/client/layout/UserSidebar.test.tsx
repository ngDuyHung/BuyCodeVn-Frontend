import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "@/stores/authStore";
import UserSidebar from "./UserSidebar";

const mocks = vi.hoisted(() => ({ pathname: "/user/hosting", logout: vi.fn() }));

vi.mock("next/navigation", () => ({ usePathname: () => mocks.pathname }));
vi.mock("@/hooks/useAuthLogic", () => ({ useAuthLogic: () => ({ logout: mocks.logout }) }));

describe("UserSidebar", () => {
  beforeEach(() => {
    mocks.pathname = "/user/hosting";
    mocks.logout.mockReset();
    useAuthStore.setState({
      user: { id: 1, name: "Nguyễn Văn A", email: "user@example.com", is_active: true, roles: ["customer"], permissions: [] },
    });
  });

  it("renders grouped desktop navigation and marks the current page", () => {
    render(<UserSidebar />);

    const desktopNavigation = screen.getByRole("navigation", { name: "Quản lý tài khoản" });
    expect(within(desktopNavigation).getByText("Dịch vụ")).toBeInTheDocument();
    expect(within(desktopNavigation).getByRole("link", { name: /Quản lý Hosting/ })).toHaveAttribute("aria-current", "page");
  });

  it("opens all account actions from the mobile bottom navigation", () => {
    render(<UserSidebar />);

    const mobileNavigation = screen.getByRole("navigation", { name: "Điều hướng tài khoản trên di động" });
    expect(within(mobileNavigation).getByText("Hosting")).toHaveClass("after:scale-x-100");
    fireEvent.click(within(mobileNavigation).getByRole("button", { name: "Thêm" }));

    const dialog = screen.getByRole("dialog", { name: "Quản lý tài khoản" });
    expect(within(dialog).getByRole("link", { name: /Tên miền/ })).toHaveAttribute("href", "/user/domains");
    expect(within(dialog).getByRole("link", { name: /Nạp tiền/ })).toHaveAttribute("href", "/user/deposit");
  });
});
