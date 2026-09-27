import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { adminOperationsService } from "@/services/admin/adminOperationsService";
import AdminOrderDirectory from "./AdminOrderDirectory";

vi.mock("next/navigation", () => ({
  usePathname: () => "/admin/orders",
  useRouter: () => ({ replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/services/admin/adminOperationsService", () => ({
  adminOperationsService: { getOrders: vi.fn(), getOrder: vi.fn() },
}));

const order = {
  id: 23,
  status: "completed" as const,
  total_amount: "250000.00",
  discount_amount: "50000.00",
  final_amount: "200000.00",
  created_at: "2026-09-27T08:00:00Z",
  updated_at: "2026-09-27T08:01:00Z",
  item_count: 1,
  user: { id: 8, name: "Khach hang", email: "customer@example.vn", is_active: true },
  coupon: { id: 4, code: "SALE20", discount_percent: "20.00", discount_amount: null },
  items: [{
    id: 41,
    item_type: "hosting" as const,
    item_id: 3,
    quantity: 1,
    price: "250000.00",
    subtotal: "250000.00",
    created_at: "2026-09-27T08:00:00Z",
    config: { billing_cycle: "yearly" },
    item: { id: 3, name: "Hosting Pro" },
    service: null,
  }],
};

const response = {
  success: true as const,
  message: null,
  data: [order],
  links: { first: null, last: null, prev: null, next: null },
  meta: { current_page: 1, from: 1, last_page: 1, path: "", per_page: 15, to: 1, total: 1 },
};

describe("AdminOrderDirectory", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(adminOperationsService.getOrders).mockResolvedValue(response);
    vi.mocked(adminOperationsService.getOrder).mockResolvedValue(order);
  });

  it("loads an order and opens its reconciliation detail", async () => {
    render(<AdminOrderDirectory />);

    await screen.findByText("customer@example.vn");
    fireEvent.click(screen.getByRole("button", { name: /23/ }));

    await waitFor(() => expect(adminOperationsService.getOrder).toHaveBeenCalledWith(23));
    expect(await screen.findByText("Hosting Pro")).toBeInTheDocument();
    expect(screen.getByText("SALE20")).toBeInTheDocument();
  });
});
