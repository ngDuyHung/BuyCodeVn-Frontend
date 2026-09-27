import { beforeEach, describe, expect, it, vi } from "vitest";
import api from "../api";
import { financeService } from "./financeService";

vi.mock("../api", () => ({
  default: { get: vi.fn(), post: vi.fn() },
}));

describe("financeService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("unwraps the wallet envelope", async () => {
    const wallet = {
      id: 1,
      balance: "150000.00",
      currency: "VND",
      is_active: true,
      updated_at: "2026-09-19T00:00:00+00:00",
    };
    vi.mocked(api.get).mockResolvedValue({
      data: { success: true, message: null, data: wallet },
    });

    await expect(financeService.getWallet()).resolves.toEqual(wallet);
    expect(api.get).toHaveBeenCalledWith("/v1/finance/wallet", {
      signal: undefined,
      suppressErrorToast: true,
    });
  });

  it("normalizes deposits, wallet transactions and withdrawals", async () => {
    const page = (data: unknown[]) => ({
      success: true,
      message: null,
      data,
      links: { first: null, last: null, prev: null, next: null },
      meta: { current_page: 1, last_page: 1 },
    });
    vi.mocked(api.post)
      .mockResolvedValueOnce({
        data: {
          success: true,
          message: "Created",
          data: {
            transaction_id: 10,
            transaction_code: "SE10",
            amount: 100000,
            bank_name: "MBBank",
            account_number: "123456789",
            account_name: "NGUYEN VAN A",
            qr_url: "https://img.vietqr.io/qr.png",
          },
        },
      })
      .mockResolvedValueOnce({ data: { success: true, message: "Pending", data: {} } });
    vi.mocked(api.get)
      .mockResolvedValueOnce({
        data: page([
          {
            id: 1,
            type: "deposit",
            amount: 100000,
            balance_after: 100000,
            reference: { type: "payment_transactions", id: 10 },
            created_at: "2026-09-19T00:00:00+00:00",
          },
        ]),
      })
      .mockResolvedValueOnce({
        data: page([
          {
            id: 2,
            user_id: 1,
            amount: 50000,
            bank_name: "MBBank",
            account_number: "123456789",
            account_name: "NGUYEN VAN A",
            status: "pending",
            admin_note: null,
            created_at: "2026-09-19T00:00:00+00:00",
            updated_at: "2026-09-19T00:00:00+00:00",
          },
        ]),
      });

    await expect(
      financeService.createDeposit({ bank_account_id: 1, amount: "100000.00" }),
    ).resolves.toMatchObject({ data: { amount: "100000.00" } });
    await expect(
      financeService.getWalletTransactions({ per_page: 5 }),
    ).resolves.toMatchObject({
      data: [{ amount: "100000.00", balance_after: "100000.00" }],
    });
    await expect(financeService.getWithdrawals({ per_page: 10 })).resolves.toMatchObject({
      data: [{ amount: "50000.00" }],
    });
    await financeService.createWithdrawal({
      amount: "50000.00",
      bank_name: "MBBank",
      account_number: "123456789",
      account_name: "Nguyen Van A",
    });

    expect(api.post).toHaveBeenLastCalledWith(
      "/v1/finance/withdraw",
      expect.objectContaining({ amount: "50000.00" }),
      { suppressErrorToast: true },
    );
  });
});
