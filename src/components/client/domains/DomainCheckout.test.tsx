import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { financeService } from "@/services/client/financeService";
import { orderService } from "@/services/client/orderService";
import { useAuthStore } from "@/stores/authStore";
import DomainCheckout from "./DomainCheckout";

vi.mock("@/services/client/financeService", () => ({
  financeService: { getWallet: vi.fn() },
}));

vi.mock("@/services/client/orderService", () => ({
  orderService: { previewCoupon: vi.fn(), buyDomain: vi.fn() },
}));

const domainResult = {
  domain: "school.edu.vn",
  is_available: true,
  register_price: "300000.00",
  renew_price: "320000.00",
  message: "Tên miền còn trống.",
};

const wallet = {
  id: 1,
  balance: "5000000.00",
  currency: "VND",
  is_active: true,
  updated_at: "2026-09-19T00:00:00+00:00",
};

const fillContact = () => {
  fireEvent.change(screen.getByLabelText("Họ và tên"), { target: { value: "Nguyen Van A" } });
  fireEvent.change(screen.getByLabelText("Email"), { target: { value: "owner@example.com" } });
  fireEvent.change(screen.getByLabelText("Số điện thoại"), { target: { value: "0900000000" } });
};

describe("DomainCheckout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
    vi.mocked(financeService.getWallet).mockResolvedValue(wallet);
    useAuthStore.setState({
      token: null,
      user: null,
      isAuthenticated: false,
      isSessionReady: true,
      hasHydrated: true,
    });
  });

  it("asks guests to log in and preserves the checked domain", () => {
    render(<DomainCheckout domainResult={domainResult} onClose={vi.fn()} />);

    expect(screen.getByRole("link", { name: /đăng nhập/i })).toHaveAttribute(
      "href",
      "/login?returnUrl=%2Fdomains%3Fdomain%3Dschool.edu.vn",
    );
  });

  it("buys an automatic domain with decimal-safe yearly totals", async () => {
    useAuthStore.setState({ isAuthenticated: true, isSessionReady: true });
    vi.mocked(orderService.buyDomain).mockResolvedValue({
      success: true,
      message: "Registered",
      data: { domain: "school.edu.vn", status: "success" },
    });
    render(<DomainCheckout domainResult={domainResult} onClose={vi.fn()} />);

    await screen.findByText("5.000.000đ");
    fillContact();
    fireEvent.change(screen.getByLabelText("CCCD (không bắt buộc)"), { target: { value: "012345678901" } });
    fireEvent.change(screen.getByLabelText("Số năm đăng ký"), { target: { value: "3" } });
    expect(screen.getAllByText("900.000đ").length).toBeGreaterThan(0);
    fireEvent.click(screen.getByLabelText(/ghi nhớ họ tên/i));
    fireEvent.click(screen.getByRole("button", { name: "Xác nhận đăng ký" }));

    expect(await screen.findByText(/tên miền đã được đăng ký thành công/i)).toBeInTheDocument();
    expect(orderService.buyDomain).toHaveBeenCalledWith({
      domain: "school.edu.vn",
      years: 3,
      contact_info: {
        name: "Nguyen Van A",
        email: "owner@example.com",
        phone: "0900000000",
        cccd: "012345678901",
      },
    });
    expect(window.localStorage.getItem("buycode:domain-contact-draft")).not.toContain("012345678901");
  });

  it("shows pending manual as paid and waiting, not failed", async () => {
    useAuthStore.setState({ isAuthenticated: true, isSessionReady: true });
    vi.mocked(orderService.buyDomain).mockResolvedValue({
      success: true,
      message: "Pending",
      data: { domain: "school.edu.vn", status: "pending_manual" },
    });
    render(<DomainCheckout domainResult={domainResult} onClose={vi.fn()} />);

    await screen.findByText("5.000.000đ");
    fillContact();
    fireEvent.click(screen.getByRole("button", { name: "Xác nhận đăng ký" }));

    await waitFor(() => {
      expect(screen.getByText(/đang chờ xử lý thủ công/i)).toBeInTheDocument();
      expect(screen.getByText(/thanh toán đã được ghi nhận/i)).toBeInTheDocument();
    });
  });

  it("previews a coupon against the decimal-safe yearly total", async () => {
    useAuthStore.setState({ isAuthenticated: true, isSessionReady: true });
    vi.mocked(orderService.previewCoupon).mockResolvedValue({
      success: true,
      message: "Applied",
      data: { discount_amount: "50000.00", final_amount: "550000.00" },
    });
    render(<DomainCheckout domainResult={domainResult} onClose={vi.fn()} />);

    await screen.findByText("5.000.000đ");
    fireEvent.change(screen.getByLabelText("Số năm đăng ký"), {
      target: { value: "2" },
    });
    fireEvent.change(screen.getByLabelText("Mã giảm giá"), {
      target: { value: " sale10 " },
    });
    fireEvent.click(screen.getByRole("button", { name: "Áp dụng" }));

    await waitFor(() => {
      expect(orderService.previewCoupon).toHaveBeenCalledWith({
        coupon_code: "SALE10",
        total_amount: "600000.00",
      });
      expect(screen.getByText("550.000đ")).toBeInTheDocument();
    });
  });
});
