import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api-error";
import { financeService } from "@/services/client/financeService";
import { orderService } from "@/services/client/orderService";
import { useAuthStore } from "@/stores/authStore";
import HostingCheckout from "./HostingCheckout";

vi.mock("@/services/client/financeService", () => ({
  financeService: { getWallet: vi.fn() },
}));

vi.mock("@/services/client/orderService", () => ({
  orderService: { previewCoupon: vi.fn(), buyHosting: vi.fn() },
}));

const plan = {
  id: 1,
  name: "Business",
  disk_quota: 10240,
  price_per_month: "50000.00",
};

const wallet = {
  id: 1,
  balance: "5000000.00",
  currency: "VND",
  is_active: true,
  updated_at: "2026-09-19T00:00:00+00:00",
};

describe("HostingCheckout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(financeService.getWallet).mockResolvedValue(wallet);
    useAuthStore.setState({
      token: null,
      user: null,
      isAuthenticated: false,
      isSessionReady: true,
      hasHydrated: true,
    });
  });

  it("preserves the selected plan when asking a guest to log in", () => {
    render(<HostingCheckout plan={plan} onClose={vi.fn()} />);

    expect(screen.getByRole("link", { name: /đăng nhập/i })).toHaveAttribute(
      "href",
      "/login?returnUrl=%2Fhosting%3Fplan%3D1",
    );
  });

  it("supports every billing cycle and blocks an invalid domain", async () => {
    useAuthStore.setState({ isAuthenticated: true, isSessionReady: true });
    render(<HostingCheckout plan={plan} onClose={vi.fn()} />);

    await screen.findByText("5.000.000đ");
    const cycle = screen.getByLabelText("Chu kỳ");
    const expectedTotals = new Map([
      [1, "50.000đ"],
      [3, "150.000đ"],
      [6, "300.000đ"],
      [12, "600.000đ"],
      [24, "1.200.000đ"],
      [36, "1.800.000đ"],
    ]);

    for (const [months, total] of expectedTotals) {
      fireEvent.change(cycle, { target: { value: String(months) } });
      expect(screen.getAllByText(total).length).toBeGreaterThan(0);
    }

    fireEvent.change(screen.getByLabelText("Tên miền sử dụng"), {
      target: { value: "not a domain" },
    });
    fireEvent.click(screen.getByRole("button", { name: /xác nhận đăng ký/i }));
    expect(await screen.findByText(/tên miền không hợp lệ/i)).toBeInTheDocument();
    expect(orderService.buyHosting).not.toHaveBeenCalled();
  });

  it("submits normalized data and shows automatic provisioning success", async () => {
    useAuthStore.setState({ isAuthenticated: true, isSessionReady: true });
    vi.mocked(orderService.buyHosting).mockResolvedValue({
      success: true,
      message: "Created",
      data: {
        status: "success",
        order_id: 20,
        service_id: 10,
        domain: "example.com",
      },
    });
    render(<HostingCheckout plan={plan} onClose={vi.fn()} />);

    await screen.findByText("5.000.000đ");
    fireEvent.change(screen.getByLabelText("Tên miền sử dụng"), {
      target: { value: "HTTPS://Example.COM/" },
    });
    fireEvent.change(screen.getByLabelText("Chu kỳ"), {
      target: { value: "3" },
    });
    fireEvent.click(screen.getByRole("button", { name: /xác nhận đăng ký/i }));

    await screen.findByText(/hosting đã được kích hoạt thành công/i);
    expect(orderService.buyHosting).toHaveBeenCalledWith({
      hosting_plan_id: 1,
      domain: "example.com",
      months: 3,
    });
    expect(screen.queryByText(/mật khẩu/i)).not.toBeInTheDocument();
  });

  it("explains that manual provisioning remains pending", async () => {
    useAuthStore.setState({ isAuthenticated: true, isSessionReady: true });
    vi.mocked(orderService.buyHosting).mockResolvedValue({
      success: true,
      message: "Pending manual activation",
      data: {
        status: "pending_manual",
        order_id: 21,
        service_id: 11,
        domain: "manual.example.com",
      },
    });
    render(<HostingCheckout plan={plan} onClose={vi.fn()} />);

    await screen.findByText("5.000.000đ");
    fireEvent.change(screen.getByLabelText("Tên miền sử dụng"), {
      target: { value: "manual.example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /xác nhận đăng ký/i }));

    expect(
      await screen.findByText(/yêu cầu hosting đang chờ kích hoạt/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/đang được xử lý thủ công/i)).toBeInTheDocument();
    expect(screen.getByText(/thông tin đăng nhập chỉ có sau/i)).toBeInTheDocument();
  });

  it("keeps the backend refund message and refreshes the wallet", async () => {
    useAuthStore.setState({ isAuthenticated: true, isSessionReady: true });
    vi.mocked(orderService.buyHosting).mockRejectedValue(
      new ApiError("Quá trình tạo hosting gặp sự cố. Tiền đã được hoàn lại."),
    );
    render(<HostingCheckout plan={plan} onClose={vi.fn()} />);

    await screen.findByText("5.000.000đ");
    fireEvent.change(screen.getByLabelText("Tên miền sử dụng"), {
      target: { value: "example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /xác nhận đăng ký/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent("hoàn lại");
    await waitFor(() => expect(financeService.getWallet).toHaveBeenCalledTimes(2));
  });
});
