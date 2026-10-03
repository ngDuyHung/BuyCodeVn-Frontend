import { render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { financeService } from "@/services/client/financeService";
import { useAuthStore } from "@/stores/authStore";
import Header from "./Header";

vi.mock("next/navigation", () => ({ usePathname: () => "/" }));
vi.mock("@/hooks/useAuthLogic", () => ({ useAuthLogic: () => ({ logout: vi.fn() }) }));
vi.mock("@/services/client/financeService", () => ({ financeService: { getWallet: vi.fn() } }));

describe("Header wallet balance", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({ isSessionReady: true, isAuthenticated: true, user: { id: 1, name: "Lan", email: "lan@example.com", is_active: true, roles: ["customer"], permissions: [], wallet: { balance: "120000.00", currency: "VND", is_active: true, updated_at: "2026-09-26" } } });
  });

  it("shows the session snapshot then refreshes it from the wallet endpoint", async () => {
    vi.mocked(financeService.getWallet).mockResolvedValue({ id: 1, balance: "175000.00", currency: "VND", is_active: true, updated_at: "2026-09-26" });
    render(<Header />);
    expect(screen.getAllByText("120.000đ").length).toBeGreaterThan(0);
    await waitFor(() => expect(screen.getAllByText("175.000đ").length).toBeGreaterThan(0));
  });

  it("renders dynamic parent and child navigation", () => {
    vi.mocked(financeService.getWallet).mockResolvedValue({ id: 1, balance: "120000.00", currency: "VND", is_active: true, updated_at: "" });
    render(<Header items={[{ id: 10, label: "Dịch vụ", url: null, icon: "fa-server", target: "_self", children: [{ id: 11, label: "Cloud VPS", url: "/vps", icon: null, target: "_self", children: [] }] }]} />);
    expect(screen.getAllByText("Dịch vụ").length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: "Cloud VPS" })[0]).toHaveAttribute("href", "/vps");
  });

  it("renders an active mobile bottom navigation and a menu shortcut", () => {
    vi.mocked(financeService.getWallet).mockResolvedValue({ id: 1, balance: "120000.00", currency: "VND", is_active: true, updated_at: "" });
    render(<Header />);

    const navigation = screen.getByRole("navigation", { name: "Điều hướng chính trên di động" });
    expect(within(navigation).getByRole("link", { name: "Trang chủ" })).toHaveAttribute("aria-current", "page");
    expect(within(navigation).getByRole("button", { name: "Menu" })).toHaveAttribute("aria-controls", "mobile-navigation");
  });
});
