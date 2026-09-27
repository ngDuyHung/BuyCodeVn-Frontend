import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api-error";
import { adminServicesService } from "@/services/admin/adminServicesService";
import { useAuthStore } from "@/stores/authStore";
import AdminServerDirectory from "./AdminServerDirectory";

const replace = vi.fn();
vi.mock("next/navigation", () => ({
  usePathname: () => "/admin/services/servers",
  useRouter: () => ({ replace }),
  useSearchParams: () => new URLSearchParams(),
}));
vi.mock("react-toastify", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock("@/services/admin/adminServicesService", () => ({
  adminServicesService: {
    getServers: vi.fn(), createServer: vi.fn(), updateServer: vi.fn(), deleteServer: vi.fn(),
    testServerConnection: vi.fn(), getProviderPlans: vi.fn(), getProviderCapabilities: vi.fn(), getHostingPlans: vi.fn(),
    createProviderPlan: vi.fn(), updateProviderPlan: vi.fn(), deleteProviderPlan: vi.fn(),
  },
}));

const server = {
  id: 1, name: "WHM 01", slug: "whm-01", ip_address: "whm.example.com", type: "whm" as const,
  provisioning_mode: "automatic" as const, login_url: "https://panel.example.com:2083",
  api_username: "reseller", api_auth_type: "password" as const, api_port: 2087, verify_tls: true,
  connect_timeout: 10, request_timeout: 30, is_active: true,
  created_at: "2026-09-26T00:00:00Z", has_api_token: true,
};
const response = {
  success: true as const, message: null, data: [server],
  links: { first: null, last: null, prev: null, next: null },
  meta: { current_page: 1, from: 1, last_page: 1, path: "", per_page: 15, to: 1, total: 1 },
};

describe("AdminServerDirectory", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({ user: { id: 1, name: "Admin", email: "admin@example.com", is_active: true, roles: ["admin"], permissions: [] } });
    vi.mocked(adminServicesService.getServers).mockResolvedValue(response);
    vi.mocked(adminServicesService.getHostingPlans).mockResolvedValue({ ...response, data: [] });
    vi.mocked(adminServicesService.getProviderCapabilities).mockRejectedValue(new Error("Capability unavailable"));
  });

  it("shows the extended WHM connection form without exposing the stored secret", async () => {
    render(<AdminServerDirectory />);
    await screen.findByText("WHM 01");
    expect(screen.getByText("Đã cấu hình")).toBeInTheDocument();
    expect(screen.getByText(/reseller · Mật khẩu · TLS bật/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Chỉnh sửa WHM 01" }));
    expect(screen.getByLabelText("Hostname hoặc IP")).toHaveValue("whm.example.com");
    expect(screen.getByLabelText("Tài khoản API")).toHaveValue("reseller");
    const secretInput = screen.getByPlaceholderText("Đã cấu hình; để trống để giữ nguyên");
    expect(secretInput).toHaveValue("");
    expect(secretInput).toHaveAttribute("type", "password");
  });

  it("tests the connection and reads provider packages", async () => {
    vi.mocked(adminServicesService.testServerConnection).mockResolvedValue({ success: true, version: "11.134", username: "reseller", tls_verified: true });
    vi.mocked(adminServicesService.getProviderPlans).mockResolvedValue([{ name: "reseller_basic", quota_mb: 1024, bandwidth_mb: 10240, max_ftp_accounts: 2, max_email_accounts: 5, max_addon_domains: 1, max_databases: 5, max_subdomains: 2, max_parked_domains: 1 }]);
    render(<AdminServerDirectory />);
    await screen.findByText("WHM 01");
    fireEvent.click(screen.getByRole("button", { name: "Kiểm tra kết nối WHM 01" }));
    await waitFor(() => expect(adminServicesService.testServerConnection).toHaveBeenCalledWith(1));
    fireEvent.click(screen.getByRole("button", { name: "Quản lý package WHM 01" }));
    expect(await screen.findByText("reseller_basic")).toBeInTheDocument();
  });

  it("offers disable when dependency deletion returns conflict", async () => {
    vi.mocked(adminServicesService.deleteServer).mockRejectedValue(new ApiError("Máy chủ đang có gói hosting.", { status: 409 }));
    render(<AdminServerDirectory />);
    await screen.findByText("WHM 01");
    fireEvent.click(screen.getByRole("button", { name: "Xóa WHM 01" }));
    fireEvent.click(screen.getByRole("button", { name: "Xóa máy chủ" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Tắt máy chủ" })).toBeInTheDocument());
  });
});
