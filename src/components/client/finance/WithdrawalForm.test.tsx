import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { financeService } from "@/services/client/financeService";
import WithdrawalForm from "./WithdrawalForm";

vi.mock("@/services/client/financeService", () => ({
  financeService: { getWallet: vi.fn(), createWithdrawal: vi.fn() },
}));

const wallet = {
  id: 1,
  balance: "100000.00",
  currency: "VND",
  is_active: true,
  updated_at: "2026-09-19T00:00:00+00:00",
};

const fillBank = () => {
  fireEvent.change(screen.getByLabelText("Ngân hàng"), { target: { value: "MBBank" } });
  fireEvent.change(screen.getByLabelText("Số tài khoản"), { target: { value: "123456789" } });
  fireEvent.change(screen.getByLabelText("Tên chủ tài khoản"), { target: { value: "Nguyen Van A" } });
};

describe("WithdrawalForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(financeService.getWallet).mockResolvedValue(wallet);
  });

  it("validates the minimum amount and available balance inline", async () => {
    render(<WithdrawalForm />);
    await screen.findByText("100.000đ");
    fillBank();

    fireEvent.change(screen.getByRole("spinbutton", { name: /số tiền/i }), { target: { value: "40000" } });
    fireEvent.click(screen.getByRole("button", { name: "Xác nhận rút tiền" }));
    expect(screen.getByText(/tối thiểu là 50\.000đ/i)).toBeInTheDocument();

    fireEvent.change(screen.getByRole("spinbutton", { name: /số tiền/i }), { target: { value: "150000" } });
    fireEvent.click(screen.getByRole("button", { name: "Xác nhận rút tiền" }));
    expect(screen.getByText(/số dư ví không đủ/i)).toBeInTheDocument();
    expect(financeService.createWithdrawal).not.toHaveBeenCalled();
  });

  it("creates a pending withdrawal and refreshes the wallet", async () => {
    vi.mocked(financeService.createWithdrawal).mockResolvedValue({
      success: true,
      message: "Pending",
      data: {},
    });
    render(<WithdrawalForm />);
    await screen.findByText("100.000đ");
    fillBank();
    fireEvent.change(screen.getByRole("spinbutton", { name: /số tiền/i }), { target: { value: "50000" } });
    fireEvent.click(screen.getByRole("button", { name: "Xác nhận rút tiền" }));

    expect(await screen.findByText(/lệnh rút tiền đang chờ duyệt/i)).toBeInTheDocument();
    expect(financeService.createWithdrawal).toHaveBeenCalledWith({
      amount: "50000.00",
      bank_name: "MBBank",
      account_number: "123456789",
      account_name: "Nguyen Van A",
    });
    await waitFor(() => expect(financeService.getWallet).toHaveBeenCalledTimes(2));
  });
});
