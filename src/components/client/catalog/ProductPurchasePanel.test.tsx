import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { orderService } from "@/services/client/orderService";
import { financeService } from "@/services/client/financeService";
import { useAuthStore } from "@/stores/authStore";
import ProductPurchasePanel from "./ProductPurchasePanel";

vi.mock("@/services/client/orderService", () => ({
  orderService: {
    previewCoupon: vi.fn(),
    buyProduct: vi.fn(),
    hasCompletedProduct: vi.fn(),
    downloadProduct: vi.fn(),
  },
}));

vi.mock("@/services/client/financeService", () => ({
  financeService: { getWallet: vi.fn() },
}));

vi.mock("react-toastify", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("@/lib/download", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/lib/download")>();
  return { ...original, saveBlob: vi.fn() };
});

const product = {
  id: 1,
  category_id: 1,
  type: "source_code" as const,
  title: "Laravel Shop",
  slug: "laravel-shop",
  description: "Description",
  thumbnail_url: "https://cdn.example.com/laravel-shop.jpg",
  demo_url: "https://demo.example.com/laravel-shop",
  price: "150000.00",
  is_active: true,
  created_at: "2026-09-08T06:16:54+00:00",
  updated_at: "2026-09-08T06:16:54+00:00",
};

describe("ProductPurchasePanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(financeService.getWallet).mockResolvedValue({
      id: 1,
      balance: "500000.00",
      currency: "VND",
      is_active: true,
      updated_at: "2026-09-19T00:00:00+00:00",
    });
    vi.mocked(orderService.hasCompletedProduct).mockResolvedValue(false);
    useAuthStore.setState({
      token: null,
      user: null,
      isAuthenticated: false,
      isSessionReady: true,
      hasHydrated: true,
    });
  });

  it("sends guests to login and preserves the product return URL", () => {
    render(<ProductPurchasePanel product={product} />);

    expect(screen.getByRole("link", { name: /đăng nhập để mua/i })).toHaveAttribute(
      "href",
      "/login?returnUrl=%2Fsource-code%2Flaravel-shop",
    );
  });

  it("previews the coupon, prevents repeated submits and offers download", async () => {
    useAuthStore.setState({
      token: "token-123",
      isAuthenticated: true,
      isSessionReady: true,
    });
    vi.mocked(orderService.previewCoupon).mockResolvedValue({
      success: true,
      message: "Applied",
      data: { discount_amount: "50000.00", final_amount: "100000.00" },
    });
    let resolvePurchase: ((value: {
      success: true;
      message: string;
      data: { order_id: number };
    }) => void) | undefined;
    vi.mocked(orderService.buyProduct).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolvePurchase = resolve;
        }),
    );

    render(<ProductPurchasePanel product={product} />);
    fireEvent.click(await screen.findByRole("button", { name: /mua ngay/i }));
    fireEvent.change(screen.getByLabelText(/mã giảm giá/i), {
      target: { value: " sale10 " },
    });
    fireEvent.click(screen.getByRole("button", { name: /áp dụng/i }));

    await screen.findByText(/sale10 đã được áp dụng/i);
    expect(orderService.previewCoupon).toHaveBeenCalledWith({
      coupon_code: "SALE10",
      total_amount: "150000.00",
    });
    expect(screen.getByText("100.000đ")).toBeInTheDocument();

    const buyButton = screen.getByRole("button", { name: /xác nhận mua/i });
    fireEvent.click(buyButton);
    fireEvent.click(buyButton);
    expect(orderService.buyProduct).toHaveBeenCalledTimes(1);

    resolvePurchase?.({
      success: true as const,
      message: "Purchased",
      data: { order_id: 10 },
    });
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: /tải mã nguồn/i }),
      ).toBeInTheDocument(),
    );
  });
});
