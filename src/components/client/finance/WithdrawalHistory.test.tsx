import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { financeService } from "@/services/client/financeService";
import WithdrawalHistory from "./WithdrawalHistory";

vi.mock("@/services/client/financeService", () => ({
  financeService: { getWithdrawals: vi.fn() },
}));

const withdrawal = {
  id: 1,
  user_id: 1,
  amount: "50000.00",
  bank_name: "MBBank",
  account_number: "123456789",
  account_name: "NGUYEN VAN A",
  status: "pending" as const,
  admin_note: null,
  created_at: "2026-09-19T00:00:00+00:00",
  updated_at: "2026-09-19T00:00:00+00:00",
};

describe("WithdrawalHistory", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(financeService.getWithdrawals).mockImplementation(async (params = {}) => ({
      success: true,
      message: null,
      data: [withdrawal],
      links: { first: null, last: null, prev: null, next: null },
      meta: {
        current_page: params.page ?? 1,
        from: 1,
        last_page: 2,
        path: "/api/v1/finance/withdraws",
        per_page: 10,
        to: 1,
        total: 2,
      },
    }));
  });

  it("masks bank accounts and paginates only with supported params", async () => {
    render(<WithdrawalHistory />);

    expect(await screen.findByText(/•••••6789/)).toBeInTheDocument();
    expect(screen.queryByText("123456789")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "2" }));

    await waitFor(() => {
      expect(financeService.getWithdrawals).toHaveBeenLastCalledWith(
        { page: 2, per_page: 10 },
        expect.any(AbortSignal),
      );
    });
  });
});
