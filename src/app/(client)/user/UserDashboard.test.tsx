import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { financeService } from "@/services/client/financeService";
import { orderService } from "@/services/client/orderService";
import { userService } from "@/services/client/userService";
import { useAuthStore } from "@/stores/authStore";
import UserDashboard from "./page";

vi.mock("@/services/client/financeService", () => ({
  financeService: { getWallet: vi.fn(), getWalletTransactions: vi.fn() },
}));
vi.mock("@/services/client/orderService", () => ({ orderService: { getOrders: vi.fn() } }));
vi.mock("@/services/client/userService", () => ({ userService: { getServices: vi.fn() } }));

const paginated = (total: number) => ({
  success: true as const,
  message: null,
  data: [],
  links: { first: null, last: null, prev: null, next: null },
  meta: { current_page: 1, from: null, last_page: 1, path: "/api", per_page: 1, to: null, total },
});

describe("UserDashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      user: {
        id: 1,
        name: "Nguyen Van A",
        email: "user@example.com",
        is_active: true,
        roles: ["customer"],
        permissions: [],
      },
      isAuthenticated: true,
    });
    vi.mocked(financeService.getWallet).mockResolvedValue({
      id: 1,
      balance: "150000.00",
      currency: "VND",
      is_active: true,
      updated_at: "2026-09-19T00:00:00+00:00",
    });
    vi.mocked(financeService.getWalletTransactions).mockResolvedValue({
      success: true,
      message: null,
      data: [
        {
          id: 1,
          type: "deposit",
          amount: "150000.00",
          balance_after: "150000.00",
          description: "Nạp tiền",
          reference: { type: "payment_transactions", id: 1 },
          created_at: "2026-09-19T00:00:00+00:00",
        },
      ],
      links: { first: null, last: null, prev: null, next: null },
      meta: {
        current_page: 1,
        from: 1,
        last_page: 1,
        path: "/api/v1/finance/wallet/transactions",
        per_page: 5,
        to: 1,
        total: 1,
      },
    });
    vi.mocked(orderService.getOrders).mockResolvedValue(paginated(7));
    vi.mocked(userService.getServices)
      .mockResolvedValueOnce(paginated(2))
      .mockResolvedValueOnce(paginated(3))
      .mockResolvedValueOnce(paginated(4));
  });

  it("renders wallet and API meta totals", async () => {
    render(<UserDashboard />);

    expect(await screen.findByText("150.000đ")).toBeInTheDocument();
    expect(screen.getByText("+150.000đ")).toBeInTheDocument();
    expect(screen.getByText("Tổng đơn hàng")).toBeInTheDocument();
    expect(screen.getByText("Hosting đang chạy")).toBeInTheDocument();
    expect(screen.getByText("Tên miền đang chạy")).toBeInTheDocument();
    expect(screen.getByText("7")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("VPS đang chạy")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(financeService.getWalletTransactions).toHaveBeenCalledWith(
      { page: 1, per_page: 5 },
      expect.any(AbortSignal),
    );
    expect(orderService.getOrders).toHaveBeenCalledWith(
      { page: 1, per_page: 1 },
      expect.any(AbortSignal),
    );
    expect(userService.getServices).toHaveBeenCalledWith(
      { service_type: "hosting", status: "active", page: 1, per_page: 1 },
      expect.any(AbortSignal),
    );
    expect(userService.getServices).toHaveBeenCalledWith(
      { service_type: "vps", status: "active", page: 1, per_page: 1 },
      expect.any(AbortSignal),
    );
  });
});
