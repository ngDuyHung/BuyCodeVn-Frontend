import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { adminService } from "@/services/admin/adminService";
import type { AdminUserWalletHistory } from "@/types/finance";
import AdminUserWalletDialog from "./AdminUserWalletDialog";

vi.mock("react-toastify", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock("@/services/admin/adminService", () => ({
  adminService: {
    getUserWalletTransactions: vi.fn(),
    adjustUserWallet: vi.fn(),
  },
}));

const user = { id: 2, name: "Customer", email: "customer@test.vn", is_active: true, roles: ["customer"], permissions: [], created_at: "2026-09-27T00:00:00Z" };
const history: AdminUserWalletHistory = {
  success: true,
  message: null,
  data: [{ id: 5, type: "admin_credit", amount: "50000.00", balance_before: "150000.00", balance_after: "200000.00", description: "Bù số dư", reference: { type: "users", id: 2 }, created_at: "2026-09-27T08:00:00Z" }],
  links: { first: null, last: null, prev: null, next: null },
  meta: { current_page: 1, from: 1, last_page: 1, path: "", per_page: 10, to: 1, total: 1, wallet: { id: 3, balance: "200000.00", currency: "VND", is_active: true, updated_at: "2026-09-27T08:00:00Z" }, user: { id: 2, name: "Customer", email: "customer@test.vn" } },
};

describe("AdminUserWalletDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("crypto", { randomUUID: () => "f4ad579d-2fff-4f6f-9757-547fce61f099" });
    vi.mocked(adminService.getUserWalletTransactions).mockResolvedValue(history);
    vi.mocked(adminService.adjustUserWallet).mockResolvedValue({
      wallet: { ...history.meta.wallet, balance: "300000.00" },
      transaction: { ...history.data[0], id: 6, amount: "100000.00", balance_before: "200000.00", balance_after: "300000.00" },
      idempotent: false,
    });
  });

  it("shows wallet history with before and after balances", async () => {
    render(<AdminUserWalletDialog user={user} canAdjust={false} onClose={vi.fn()} />);
    await screen.findByText("Bù số dư");
    expect(screen.getAllByText("Admin cộng").length).toBeGreaterThan(0);
    expect(screen.getAllByText("200.000đ").length).toBeGreaterThan(0);
    expect(screen.queryByText("Điều chỉnh số dư")).not.toBeInTheDocument();
  });

  it("validates and confirms a credit adjustment with an idempotency key", async () => {
    render(<AdminUserWalletDialog user={user} canAdjust onClose={vi.fn()} />);
    await screen.findByText("Bù số dư");

    fireEvent.change(screen.getByLabelText("Số tiền (VND)"), { target: { value: "0" } });
    fireEvent.change(screen.getByLabelText("Lý do"), { target: { value: "Kiểm tra số tiền" } });
    fireEvent.click(screen.getByRole("button", { name: "Kiểm tra" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Số tiền phải lớn hơn 0");

    fireEvent.change(screen.getByLabelText("Số tiền (VND)"), { target: { value: "100000" } });
    fireEvent.change(screen.getByLabelText("Lý do"), { target: { value: "Bù số dư theo phiếu hỗ trợ" } });
    fireEvent.click(screen.getByRole("button", { name: "Kiểm tra" }));
    fireEvent.click(screen.getByRole("button", { name: "Xác nhận điều chỉnh" }));

    await waitFor(() => expect(adminService.adjustUserWallet).toHaveBeenCalledWith(2, {
      direction: "credit",
      amount: "100000.00",
      note: "Bù số dư theo phiếu hỗ trợ",
      idempotency_key: "f4ad579d-2fff-4f6f-9757-547fce61f099",
    }));
  });
});
