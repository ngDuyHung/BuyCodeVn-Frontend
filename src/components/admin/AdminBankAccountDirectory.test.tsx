import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api-error";
import { adminFinanceService } from "@/services/admin/adminFinanceService";
import AdminBankAccountDirectory from "./AdminBankAccountDirectory";

vi.mock("next/navigation", () => ({ usePathname: () => "/admin/finance/bank-accounts", useRouter: () => ({ replace: vi.fn() }), useSearchParams: () => new URLSearchParams() }));
vi.mock("react-toastify", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock("@/services/admin/adminFinanceService", () => ({ adminFinanceService: { getBankAccounts: vi.fn(), getBankAccount: vi.fn(), createBankAccount: vi.fn(), updateBankAccount: vi.fn(), deleteBankAccount: vi.fn() } }));

const bank = { id: 1, bank_name: "MBBank", bank_code: "970422", account_number: "123456789", account_name: "BUYCODE VN", is_auto: false, is_active: true, created_at: "2026-09-27T00:00:00Z" };
const page = { success: true as const, message: null, data: [bank], links: { first: null, last: null, prev: null, next: null }, meta: { current_page: 1, from: 1, last_page: 1, path: "", per_page: 15, to: 1, total: 1 } };

describe("AdminBankAccountDirectory", () => {
  beforeEach(() => { vi.clearAllMocks(); vi.mocked(adminFinanceService.getBankAccounts).mockResolvedValue(page); vi.mocked(adminFinanceService.getBankAccount).mockResolvedValue(bank); vi.mocked(adminFinanceService.updateBankAccount).mockResolvedValue({ ...bank, is_active: false }); });

  it("masks the list value and reveals it only in the detail dialog", async () => {
    render(<AdminBankAccountDirectory />);
    expect(await screen.findByText("*****6789")).toBeInTheDocument();
    expect(screen.queryByText("123456789")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Xem tài khoản 1" }));
    expect(await screen.findByText("123456789")).toBeInTheDocument();
  });

  it("offers disabling when a referenced account cannot be deleted", async () => {
    vi.mocked(adminFinanceService.deleteBankAccount).mockRejectedValue(new ApiError("Đang được sử dụng", { status: 409 }));
    render(<AdminBankAccountDirectory />);
    await screen.findByText("*****6789");
    fireEvent.click(screen.getByRole("button", { name: "Xóa tài khoản 1" }));
    fireEvent.click(screen.getByRole("button", { name: "Xóa tài khoản" }));
    expect(await screen.findByRole("heading", { name: "Không thể xóa tài khoản" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Tắt tài khoản" }));
    await waitFor(() => expect(adminFinanceService.updateBankAccount).toHaveBeenCalledWith(1, { is_active: false }));
  });
});
