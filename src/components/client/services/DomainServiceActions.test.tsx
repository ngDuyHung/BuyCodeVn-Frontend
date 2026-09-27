import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { orderService } from "@/services/client/orderService";
import { ApiError } from "@/lib/api-error";
import type { UserService } from "@/types/services";
import DomainServiceActions from "./DomainServiceActions";

vi.mock("@/services/client/orderService", () => ({ orderService: { renewDomain: vi.fn() } }));

const service: UserService = {
  id: 7, service_type: "domain", status: "active", domain_name: "demo.vn", expires_at: "2027-01-01", created_at: "2026-01-01",
  actions: { can_renew: true, can_change_password: false, can_view_credentials: false },
  tld_pricing: { id: 1, tld: ".vn", renew_price: "500000.00" },
};

describe("DomainServiceActions", () => {
  it("keeps its key on provider-error retry and distinguishes pending manual", async () => {
    vi.mocked(orderService.renewDomain)
      .mockRejectedValueOnce(
        new ApiError("Nhà cung cấp từ chối gia hạn", {
          status: 409,
          code: "PROVIDER_CONFLICT",
          requestId: "renew-request",
        }),
      )
      .mockResolvedValueOnce({ success: true, message: "Pending", data: { renewal_id: 3, order_id: 8, domain: "demo.vn", status: "pending_manual", expires_at: "2028-01-01", idempotent: false } });
    render(<DomainServiceActions service={service} onUpdated={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: /gia hạn tên miền/i }));
    fireEvent.change(screen.getByLabelText("Số năm"), { target: { value: "2" } });
    expect(screen.getByText("1.000.000đ")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /xác nhận gia hạn/i }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Nhà cung cấp từ chối gia hạn");
    fireEvent.click(screen.getByRole("button", { name: /xác nhận gia hạn/i }));

    expect(await screen.findByText(/đang chờ xử lý thủ công/i)).toBeInTheDocument();
    await waitFor(() => expect(orderService.renewDomain).toHaveBeenCalledTimes(2));
    expect(vi.mocked(orderService.renewDomain).mock.calls[1][1].idempotency_key).toBe(
      vi.mocked(orderService.renewDomain).mock.calls[0][1].idempotency_key,
    );
  });
});
