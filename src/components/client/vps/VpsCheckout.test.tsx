import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api-error";
import { financeService } from "@/services/client/financeService";
import { orderService } from "@/services/client/orderService";
import { useAuthStore } from "@/stores/authStore";
import type { VpsPlan } from "@/types/services";
import VpsCheckout from "./VpsCheckout";

vi.mock("@/services/client/financeService", () => ({ financeService: { getWallet: vi.fn() } }));
vi.mock("@/services/client/orderService", () => ({ orderService: { buyVps: vi.fn() } }));

const plan: VpsPlan = {
  id: 1, slug: "kvm", name: "KVM 2GB", group_name: "KVM", cpu: 2, ram_mb: 2048, disk_gb: 40,
  bandwidth: "Unlimited", ip_description: "1 IPv4", pricing: { "1_month": { amount: "90000.00" } },
  locations: [{ id: 2, slug: "hcm", code: "HCM", name: "Ho Chi Minh", surcharge: "10000.00" }],
};

describe("VpsCheckout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({ isAuthenticated: true, isSessionReady: true });
    vi.mocked(financeService.getWallet).mockResolvedValue({ id: 1, balance: "500000.00", currency: "VND", is_active: true, updated_at: "2026-09-21" });
  });

  it("sends internal location ID, selected OS and a stable UUID on 409 retry", async () => {
    vi.mocked(orderService.buyVps)
      .mockRejectedValueOnce(new ApiError("Đang đối soát", { status: 409 }))
      .mockResolvedValueOnce({ success: true, message: "Accepted", data: { order_id: 100, service_id: 55, instance_id: 8, status: "reconciling", hostname: "web-01", idempotent: true } });
    render(<VpsCheckout plan={plan} osImages={[{ id: 3, name: "Ubuntu", icon_url: null }]} onClose={vi.fn()} />);

    await screen.findByText("500.000đ");
    expect(screen.getByText("100.000đ")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Hostname"), { target: { value: "web-01" } });
    fireEvent.click(screen.getByRole("button", { name: "Xác nhận thanh toán" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Đang đối soát");
    expect(screen.getByLabelText("Chu kỳ")).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Thử lại yêu cầu" }));

    await screen.findByText(/không trừ ví lần nữa/i);
    await waitFor(() => expect(orderService.buyVps).toHaveBeenCalledTimes(2));
    const first = vi.mocked(orderService.buyVps).mock.calls[0][0];
    const second = vi.mocked(orderService.buyVps).mock.calls[1][0];
    expect(first).toMatchObject({ vps_plan_id: 1, os_image_id: 3, location_id: 2, hostname: "web-01" });
    expect(first.idempotency_key).toBe(second.idempotency_key);
    expect(first.idempotency_key).toMatch(/^[0-9a-f-]{36}$/i);
  });

  it("keeps the same purchase UUID after an uncertain server error", async () => {
    vi.mocked(orderService.buyVps)
      .mockRejectedValueOnce(new ApiError("Lỗi máy chủ", { status: 500 }))
      .mockResolvedValueOnce({ success: true, message: "Accepted", data: { order_id: 12, service_id: 9, instance_id: 3, status: "reconciling", hostname: "web-02", idempotent: true } });
    render(<VpsCheckout plan={plan} osImages={[{ id: 3, name: "Ubuntu", icon_url: null }]} onClose={vi.fn()} />);

    await screen.findByText("500.000đ");
    fireEvent.change(screen.getByLabelText("Hostname"), { target: { value: "web-02" } });
    fireEvent.click(screen.getByRole("button", { name: "Xác nhận thanh toán" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Lỗi máy chủ");
    expect(screen.getByLabelText("Hostname")).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Thử lại yêu cầu" }));

    await waitFor(() => expect(orderService.buyVps).toHaveBeenCalledTimes(2));
    expect(vi.mocked(orderService.buyVps).mock.calls[0][0].idempotency_key)
      .toBe(vi.mocked(orderService.buyVps).mock.calls[1][0].idempotency_key);
  });
});
