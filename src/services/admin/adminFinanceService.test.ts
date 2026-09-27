import { beforeEach, describe, expect, it, vi } from "vitest";
import api from "@/services/api";
import { adminFinanceService } from "./adminFinanceService";

vi.mock("@/services/api", () => ({ default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() } }));

describe("adminFinanceService", () => {
  beforeEach(() => vi.clearAllMocks());

  it("maps finance actions to canonical endpoints and preserves zero actual amount", async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { data: [], meta: { total: 0 } } });
    vi.mocked(api.post).mockResolvedValue({ data: { data: { id: 2, amount: 0, actual_amount: 0 } } });

    await adminFinanceService.getBankAccounts({ is_active: 1 });
    await adminFinanceService.getDeposits({ status: "pending" });
    await adminFinanceService.getWithdrawals({ status: "pending" });
    const deposit = await adminFinanceService.approveDeposit(2, "0.00");
    await adminFinanceService.rejectWithdrawal(3, "Sai số tài khoản");

    expect(api.get).toHaveBeenNthCalledWith(1, "/v1/finance/admin/bank-accounts", expect.objectContaining({ params: { is_active: 1 } }));
    expect(api.post).toHaveBeenCalledWith("/v1/finance/admin/deposits/2/approve", { actual_amount: "0.00" }, expect.anything());
    expect(api.post).toHaveBeenCalledWith("/v1/finance/admin/withdraws/3/reject", { admin_note: "Sai số tài khoản" }, expect.anything());
    expect(deposit.actual_amount).toBe("0.00");
  });
});
