import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api-error";
import { orderService } from "@/services/client/orderService";
import { userService } from "@/services/client/userService";
import { vpsService } from "@/services/client/vpsService";
import type { UserService } from "@/types/services";
import VpsServiceActions from "./VpsServiceActions";

vi.mock("@/services/client/orderService", () => ({ orderService: { renewVps: vi.fn() } }));
vi.mock("@/services/client/userService", () => ({ userService: { getCredentials: vi.fn(), vpsAction: vi.fn(), rebuildVps: vi.fn(), changeVpsPassword: vi.fn(), changeVpsHostname: vi.fn(), syncVps: vi.fn() } }));
vi.mock("@/services/client/vpsService", () => ({ vpsService: { getPlan: vi.fn() } }));
vi.mock("react-toastify", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const service: UserService = {
  id: 55, service_type: "vps", status: "active", domain_name: null, expires_at: "2027-09-21", created_at: "2026-09-21",
  actions: { can_renew: true, can_view_credentials: true, can_change_password: false, can_manage_vps: true },
  service: { id: 1, name: "KVM 2GB", cpu: 2, ram_mb: 2048, disk_gb: 40 },
  vps: { instance_id: 8, hostname: "web-01", ip_address: "203.0.113.10", provisioning_status: "active", power_status: "running", os_name: "Ubuntu", location: { id: 2, name: "Ho Chi Minh", code: "HCM" }, last_synced_at: null },
};

describe("VpsServiceActions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(vpsService.getPlan).mockResolvedValue({ id: 1, slug: "kvm-2gb", name: "KVM 2GB", group_name: "KVM", cpu: 2, ram_mb: 2048, disk_gb: 40, bandwidth: "Unlimited", ip_description: "1 IPv4", pricing: { "1_month": { amount: "90000.00" } }, locations: [{ id: 2, slug: "hcm", code: "HCM", name: "Ho Chi Minh", surcharge: "10000.00" }] });
  });

  it("loads credentials only on demand and hides actions denied by backend", async () => {
    vi.mocked(userService.getCredentials).mockResolvedValue({ service_id: 55, service_type: "vps", ip_address: "203.0.113.10", login_url: null, username: "root", password: "secret" });
    render(<VpsServiceActions service={{ ...service, actions: { can_renew: false, can_manage_vps: false, can_change_password: false, can_view_credentials: true } }} osImages={[]} onUpdated={vi.fn()} />);
    expect(userService.getCredentials).not.toHaveBeenCalled();
    expect(screen.queryByRole("button", { name: "Nguồn" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Gia hạn" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Thông tin đăng nhập" }));
    expect(await screen.findByText("secret")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Đóng" }));
    expect(screen.queryByText("secret")).not.toBeInTheDocument();
  });

  it("discards credentials returned after the panel is closed", async () => {
    let finish!: (value: Awaited<ReturnType<typeof userService.getCredentials>>) => void;
    vi.mocked(userService.getCredentials).mockImplementation(() => new Promise((resolve) => { finish = resolve; }));
    render(<VpsServiceActions service={service} osImages={[]} onUpdated={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Thông tin đăng nhập" }));
    fireEvent.click(screen.getByRole("button", { name: "Đóng" }));
    finish({ service_id: 55, service_type: "vps", ip_address: "203.0.113.10", login_url: null, username: "root", password: "late-secret" });
    await waitFor(() => expect(screen.queryByText("late-secret")).not.toBeInTheDocument());
    expect(screen.queryByText("Thông tin đăng nhập", { selector: "h3" })).not.toBeInTheDocument();
  });

  it("requires explicit data-loss confirmation before rebuild", async () => {
    vi.mocked(userService.rebuildVps).mockResolvedValue({ success: true, message: "OK", data: service });
    render(<VpsServiceActions service={service} osImages={[{ id: 3, name: "Ubuntu", icon_url: null }]} onUpdated={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Cài lại OS" }));
    expect(screen.getByRole("button", { name: /xác nhận xóa dữ liệu/i })).toBeDisabled();
    fireEvent.click(screen.getByLabelText(/dữ liệu trên VPS sẽ bị xóa vĩnh viễn/i));
    fireEvent.click(screen.getByRole("button", { name: /xác nhận xóa dữ liệu/i }));
    await waitFor(() => expect(userService.rebuildVps).toHaveBeenCalledWith(55, { os_image_id: 3 }));
  });

  it("keeps renewal UUID after provider conflict", async () => {
    vi.mocked(orderService.renewVps)
      .mockRejectedValueOnce(new ApiError("Đang đối soát", { status: 409 }))
      .mockResolvedValueOnce({ success: true, message: "OK", data: { order_id: 100, idempotent: true } });
    render(<VpsServiceActions service={service} osImages={[]} onUpdated={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Gia hạn" }));
    expect(await screen.findByText(/100.000/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Xác nhận gia hạn" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Đang đối soát");
    fireEvent.click(screen.getByRole("button", { name: "Thử lại yêu cầu" }));
    await screen.findByText(/không tạo giao dịch mới/i);
    expect(vi.mocked(orderService.renewVps).mock.calls[0][1].idempotency_key).toBe(vi.mocked(orderService.renewVps).mock.calls[1][1].idempotency_key);
  });

  it("does not enable renewal when the public plan is unavailable", async () => {
    vi.mocked(vpsService.getPlan).mockRejectedValue(new ApiError("Gói không còn công khai", { status: 404 }));
    render(<VpsServiceActions service={service} osImages={[]} onUpdated={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Gia hạn" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Gói không còn công khai");
    expect(screen.getByRole("button", { name: "Xác nhận gia hạn" })).toBeDisabled();
  });
});
