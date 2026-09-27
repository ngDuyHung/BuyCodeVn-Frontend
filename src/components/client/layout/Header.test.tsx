import { render, screen, waitFor } from "@testing-library/react";
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
});
