import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { adminFinanceService } from "@/services/admin/adminFinanceService";
import { useAuthStore } from "@/stores/authStore";
import AdminDepositDirectory from "./AdminDepositDirectory";

vi.mock("next/navigation", () => ({ usePathname: () => "/admin/finance/deposits", useRouter: () => ({ replace: vi.fn() }), useSearchParams: () => new URLSearchParams() }));
vi.mock("react-toastify", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock("@/services/admin/adminFinanceService", () => ({ adminFinanceService: { getDeposits: vi.fn(), getDeposit: vi.fn(), approveDeposit: vi.fn(), cancelDeposit: vi.fn() } }));

const deposit = { id: 2, user_id: 8, bank_account_id: 1, transaction_code: "SE2", amount: "100000.00", actual_amount: null, status: "pending" as const, paid_at: null, created_at: "2026-09-27T00:00:00Z", user: { id: 8, name: "Customer", email: "customer@test.vn" }, bank_account: { id: 1, bank_name: "MBBank", account_number: "123456789" } };
const page = { success: true as const, message: null, data: [deposit], links: { first: null, last: null, prev: null, next: null }, meta: { current_page: 1, from: 1, last_page: 1, path: "", per_page: 15, to: 1, total: 1 } };

describe("AdminDepositDirectory", () => {
  beforeEach(() => { vi.clearAllMocks(); useAuthStore.setState({ user: { id: 1, name: "Admin", email: "admin@test.vn", is_active: true, roles: ["admin"], permissions: [] } }); vi.mocked(adminFinanceService.getDeposits).mockResolvedValue(page); vi.mocked(adminFinanceService.approveDeposit).mockResolvedValue({ ...deposit, status: "completed", actual_amount: "0.00" }); });

  it("allows an explicit zero actual amount and refreshes after approval", async () => {
    render(<AdminDepositDirectory />);
    await screen.findByText("SE2");
    fireEvent.click(screen.getByRole("button", { name: "Duyệt phiếu nạp SE2" }));
    fireEvent.change(screen.getByLabelText("Số tiền thực nhận (VND)"), { target: { value: "0" } });
    fireEvent.click(screen.getByRole("button", { name: "Xác nhận chênh lệch" }));
    await waitFor(() => expect(adminFinanceService.approveDeposit).toHaveBeenCalledWith(2, "0.00"));
    expect(adminFinanceService.getDeposits).toHaveBeenCalledTimes(2);
  });
});
