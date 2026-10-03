import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { adminServicesService } from "@/services/admin/adminServicesService";
import { useAuthStore } from "@/stores/authStore";
import AdminHostingPlanDirectory from "./AdminHostingPlanDirectory";

vi.mock("next/navigation", () => ({
  usePathname: () => "/admin/services/hosting-plans",
  useRouter: () => ({ replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));
vi.mock("react-toastify", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock("@/services/admin/adminServicesService", () => ({
  adminServicesService: {
    getHostingPlans: vi.fn(), getServers: vi.fn(), getProviderPlans: vi.fn(),
    createHostingPlan: vi.fn(), updateHostingPlan: vi.fn(), deleteHostingPlan: vi.fn(),
  },
}));

const server = {
  id: 2, name: "WHM Reseller", slug: "whm-reseller", ip_address: "whm.example.com", type: "whm" as const,
  provisioning_mode: "automatic" as const, login_url: null, api_username: "reseller",
  api_auth_type: "password" as const, api_port: 2087, verify_tls: true, connect_timeout: 10,
  request_timeout: 30, is_active: true, created_at: "2026-09-26T00:00:00Z", has_api_token: true,
};
const plan = {
  id: 5, server_id: 2, name: "Legacy", whm_package_name: "reseller_legacy", disk_quota: 512,
  bandwidth_limit_mb: 5120, memory_limit_mb: 512, max_ftp_accounts: 2, max_email_accounts: 5,
  max_databases: 5, max_subdomains: 2, max_parked_domains: 1, max_addon_domains: 1,
  custom_features: { backup: "Hàng ngày" },
  price_per_month: "50000.00", display_order: 30, is_active: false, provider_available: false,
  provider_synced_at: "2026-09-26T10:00:00Z", created_at: "2026-09-26T00:00:00Z", server,
};
const meta = { current_page: 1, from: 1, last_page: 1, path: "", per_page: 15, to: 1, total: 1 };
const links = { first: null, last: null, prev: null, next: null };

describe("AdminHostingPlanDirectory", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({ user: { id: 1, name: "Admin", email: "admin@example.com", is_active: true, roles: ["admin"], permissions: [] } });
    vi.mocked(adminServicesService.getServers).mockResolvedValue({ success: true, message: null, data: [server], meta, links });
    vi.mocked(adminServicesService.getHostingPlans).mockResolvedValue({ success: true, message: null, data: [plan], meta, links });
    vi.mocked(adminServicesService.getProviderPlans).mockResolvedValue([{ name: "reseller_basic", quota_mb: 2048, bandwidth_mb: 20480, max_ftp_accounts: 5, max_email_accounts: 10, max_addon_domains: 2, max_databases: 10, max_subdomains: 5, max_parked_domains: 2 }]);
    vi.mocked(adminServicesService.updateHostingPlan).mockResolvedValue(plan);
  });

  it("shows provider availability and uses live WHM packages in the form", async () => {
    render(<AdminHostingPlanDirectory />);
    expect(await screen.findByText("Không còn package")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Chỉnh sửa Legacy" }));

    const packageSelect = await screen.findByLabelText("Package WHM");
    await waitFor(() => expect(packageSelect).toHaveTextContent("reseller_basic"));
    fireEvent.change(packageSelect, { target: { value: "reseller_basic" } });
    expect(screen.getByLabelText("Dung lượng (MB)")).toHaveValue(2048);
    expect(screen.getByLabelText("Băng thông (MB)")).toHaveValue(20480);
    expect(screen.getByLabelText("Dung lượng (MB)")).not.toHaveAttribute("readonly");
  });

  it("allows local limits above the WHM package and quick unlimited values", async () => {
    render(<AdminHostingPlanDirectory />);
    await screen.findByText("Không còn package");
    fireEvent.click(screen.getByRole("button", { name: "Chỉnh sửa Legacy" }));

    const packageSelect = await screen.findByLabelText("Package WHM");
    await waitFor(() => expect(packageSelect).toHaveTextContent("reseller_basic"));
    fireEvent.change(packageSelect, { target: { value: "reseller_basic" } });
    fireEvent.change(screen.getByLabelText("Dung lượng (MB)"), { target: { value: "8192" } });
    fireEvent.change(screen.getByLabelText("Thứ tự hiển thị"), { target: { value: "10" } });
    fireEvent.click(screen.getByLabelText("Băng thông (MB): Không giới hạn"));
    fireEvent.click(screen.getByRole("button", { name: "Lưu gói hosting" }));

    await waitFor(() => expect(adminServicesService.updateHostingPlan).toHaveBeenCalledWith(5, expect.objectContaining({
      disk_quota: 8192,
      bandwidth_limit_mb: 0,
      display_order: 10,
      whm_package_name: "reseller_basic",
    })));
  });

  it("can set every local resource to unlimited and restore the package suggestions", async () => {
    render(<AdminHostingPlanDirectory />);
    await screen.findByText("Không còn package");
    fireEvent.click(screen.getByRole("button", { name: "Chỉnh sửa Legacy" }));

    const packageSelect = await screen.findByLabelText("Package WHM");
    await waitFor(() => expect(packageSelect).toHaveTextContent("reseller_basic"));
    fireEvent.change(packageSelect, { target: { value: "reseller_basic" } });
    fireEvent.click(screen.getByRole("button", { name: "Tất cả không giới hạn" }));
    expect(screen.getByLabelText("Dung lượng (MB): Không giới hạn")).toBeChecked();
    expect(screen.getByLabelText("Addon domain: Không giới hạn")).toBeChecked();
    expect(screen.getByLabelText("RAM metadata: Không cấu hình")).toBeChecked();

    fireEvent.click(screen.getByRole("button", { name: "Lấy lại từ package" }));
    expect(screen.getByLabelText("Dung lượng (MB)")).toHaveValue(2048);
    expect(screen.getByLabelText("Addon domain")).toHaveValue(2);
  });
});
