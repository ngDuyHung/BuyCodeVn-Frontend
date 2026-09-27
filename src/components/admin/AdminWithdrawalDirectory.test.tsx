import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { adminFinanceService } from "@/services/admin/adminFinanceService";
import { useAuthStore } from "@/stores/authStore";
import AdminWithdrawalDirectory from "./AdminWithdrawalDirectory";

vi.mock("next/navigation", () => ({ usePathname: () => "/admin/finance/withdrawals", useRouter: () => ({ replace: vi.fn() }), useSearchParams: () => new URLSearchParams() }));
vi.mock("react-toastify", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock("@/services/admin/adminFinanceService", () => ({ adminFinanceService: { getWithdrawals: vi.fn(), approveWithdrawal: vi.fn(), rejectWithdrawal: vi.fn() } }));

const withdrawal = { id: 3, user_id: 8, amount: "50000.00", bank_name: "MBBank", account_number: "123456789", account_name: "CUSTOMER", status: "pending" as const, admin_note: null, created_at: "2026-09-27T00:00:00Z", updated_at: "2026-09-27T00:00:00Z", user: { id: 8, name: "Customer", email: "customer@test.vn" } };
const page = { success: true as const, message: null, data: [withdrawal], links: { first: null, last: null, prev: null, next: null }, meta: { current_page: 1, from: 1, last_page: 1, path: "", per_page: 15, to: 1, total: 1 } };

describe("AdminWithdrawalDirectory", () => {
  beforeEach(() => { vi.clearAllMocks(); useAuthStore.setState({ user: { id: 1, name: "Admin", email: "admin@test.vn", is_active: true, roles: ["admin"], permissions: [] } }); vi.mocked(adminFinanceService.getWithdrawals).mockResolvedValue(page); vi.mocked(adminFinanceService.rejectWithdrawal).mockResolvedValue({ ...withdrawal, status: "rejected", admin_note: "Sai số tài khoản" }); });

  it("requires a rejection note and explains the wallet refund", async () => {
    render(<AdminWithdrawalDirectory />);
    await screen.findByText("123456789");
    fireEvent.click(screen.getByRole("button", { name: "Từ chối yêu cầu rút 3" }));
    expect(screen.getByText(/hoàn tự động vào ví/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Từ chối và hoàn ví" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Vui lòng nhập lý do");
    fireEvent.change(screen.getByLabelText("Lý do từ chối"), { target: { value: "Sai số tài khoản" } });
    fireEvent.click(screen.getByRole("button", { name: "Từ chối và hoàn ví" }));
    await waitFor(() => expect(adminFinanceService.rejectWithdrawal).toHaveBeenCalledWith(3, "Sai số tài khoản"));
  });
});
