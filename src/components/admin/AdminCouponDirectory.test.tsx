import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { adminOperationsService } from "@/services/admin/adminOperationsService";
import AdminCouponDirectory from "./AdminCouponDirectory";

vi.mock("next/navigation", () => ({ usePathname: () => "/admin/coupons", useRouter: () => ({ replace: vi.fn() }), useSearchParams: () => new URLSearchParams() }));
vi.mock("react-toastify", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock("@/services/admin/adminOperationsService", () => ({ adminOperationsService: { getCoupons: vi.fn(), createCoupon: vi.fn(), updateCoupon: vi.fn(), deleteCoupon: vi.fn() } }));

const pagination = { success: true as const, message: null, data: [], links: { first: null, last: null, prev: null, next: null }, meta: { current_page: 1, from: null, last_page: 1, path: "", per_page: 15, to: null, total: 0 } };

describe("AdminCouponDirectory", () => {
  beforeEach(() => { vi.clearAllMocks(); vi.mocked(adminOperationsService.getCoupons).mockResolvedValue(pagination); vi.mocked(adminOperationsService.createCoupon).mockResolvedValue({ id: 1, code: "SALE10", discount_percent: "10.00", discount_amount: null, usage_limit: null, used_count: 0, expires_at: null, is_active: true, created_at: "2026-09-27T00:00:00Z" }); });

  it("normalizes the code and sends exactly one discount type", async () => {
    render(<AdminCouponDirectory />);
    await screen.findByText("Chưa có mã giảm giá.");
    fireEvent.click(screen.getByRole("button", { name: "Tạo mã" }));
    fireEvent.change(screen.getByLabelText("Mã giảm giá"), { target: { value: " sale 10 " } });
    fireEvent.change(screen.getByLabelText("Phần trăm giảm (%)"), { target: { value: "10" } });
    fireEvent.click(screen.getByRole("button", { name: "Lưu mã giảm giá" }));
    await waitFor(() => expect(adminOperationsService.createCoupon).toHaveBeenCalledWith(expect.objectContaining({ code: "SALE10", discount_percent: "10.00", discount_amount: null })));
  });

  it("blocks an invalid discount before calling the API", async () => {
    render(<AdminCouponDirectory />);
    await screen.findByText("Chưa có mã giảm giá.");
    fireEvent.click(screen.getByRole("button", { name: "Tạo mã" }));
    fireEvent.change(screen.getByLabelText("Mã giảm giá"), { target: { value: "INVALID" } });
    fireEvent.change(screen.getByLabelText("Phần trăm giảm (%)"), { target: { value: "0" } });
    fireEvent.click(screen.getByRole("button", { name: "Lưu mã giảm giá" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Phần trăm giảm");
    expect(adminOperationsService.createCoupon).not.toHaveBeenCalled();
  });
});
