import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useFinanceLogic } from "@/hooks/client/useFinanceLogic";
import DepositPage from "./page";

vi.mock("@/hooks/client/useFinanceLogic", () => ({
  useFinanceLogic: vi.fn(),
}));

const baseHook = {
  banks: [
    { id: 1, bank_name: "MBBank", account_number: "123456789", account_name: "NGUYEN VAN A" },
  ],
  isLoadingBanks: false,
  isDepositing: false,
  depositResult: null,
  error: null,
  setError: vi.fn(),
  retryBanks: vi.fn(),
  handleDeposit: vi.fn(),
  resetDeposit: vi.fn(),
};

describe("DepositPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useFinanceLogic).mockReturnValue(baseHook);
  });

  it("uses inline validation instead of submitting an invalid deposit", () => {
    render(<DepositPage />);
    fireEvent.click(screen.getByRole("button", { name: "Tạo lệnh nạp tiền" }));

    expect(screen.getByText(/tối thiểu là 10\.000đ/i)).toBeInTheDocument();
    expect(screen.getByText(/vui lòng chọn ngân hàng/i)).toBeInTheDocument();
    expect(baseHook.handleDeposit).not.toHaveBeenCalled();
  });

  it("renders copy actions and the mandatory transfer warning", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    vi.mocked(useFinanceLogic).mockReturnValue({
      ...baseHook,
      depositResult: {
        transaction_id: 10,
        transaction_code: "SE10",
        amount: "100000.00",
        bank_name: "MBBank",
        account_number: "123456789",
        account_name: "NGUYEN VAN A",
        qr_url: "https://img.vietqr.io/qr.png",
      },
    });
    render(<DepositPage />);

    expect(screen.getAllByText("SE10").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText(/lệnh đang chờ ngân hàng/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Sao chép số tài khoản" }));
    await waitFor(() => expect(writeText).toHaveBeenCalledWith("123456789"));
  });
});
