import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { orderService } from "@/services/client/orderService";
import OrderHistory from "./OrderHistory";

vi.mock("@/services/client/orderService", () => ({
  orderService: {
    getOrders: vi.fn(),
    getOrder: vi.fn(),
    downloadProduct: vi.fn(),
  },
}));

vi.mock("react-toastify", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const order = {
  id: 10,
  status: "completed" as const,
  total_amount: "150000.00",
  discount_amount: "50000.00",
  final_amount: "100000.00",
  item_count: 1,
  items: [
    {
      id: 20,
      item_type: "product" as const,
      item_id: 1,
      price: "150000.00",
      quantity: 1,
      subtotal: "150000.00",
      item: {
        id: 1,
        title: "Laravel Shop",
        slug: "laravel-shop",
        thumbnail_url: null,
        demo_url: null,
      },
      service: null,
      created_at: "2026-09-19T00:00:00+00:00",
    },
  ],
  coupon: { id: 1, code: "SALE10" },
  created_at: "2026-09-19T00:00:00+00:00",
  updated_at: "2026-09-19T00:00:00+00:00",
};

const response = {
  success: true as const,
  message: null,
  data: [order],
  links: { first: null, last: null, prev: null, next: null },
  meta: {
    current_page: 1,
    from: 1,
    last_page: 1,
    path: "/v1/orders",
    per_page: 10,
    to: 1,
    total: 1,
  },
};

describe("OrderHistory", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(orderService.getOrders).mockResolvedValue(response);
    vi.mocked(orderService.getOrder).mockResolvedValue(order);
  });

  it("renders orders, loads owner detail and applies filters", async () => {
    render(<OrderHistory />);

    expect(await screen.findByText("Đơn #10")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Laravel Shop" })).toHaveAttribute(
      "href",
      "/source-code/laravel-shop",
    );
    expect(screen.getByText("100.000đ")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /xem chi tiết/i }));
    await screen.findByText(/SALE10/);
    expect(orderService.getOrder).toHaveBeenCalledWith(10);

    fireEvent.change(screen.getByLabelText("Trạng thái"), {
      target: { value: "completed" },
    });
    await waitFor(() =>
      expect(orderService.getOrders).toHaveBeenLastCalledWith(
        expect.objectContaining({ status: "completed", page: 1 }),
        expect.any(AbortSignal),
      ),
    );
  });
});
