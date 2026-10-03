import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { adminServicesService } from "@/services/admin/adminServicesService";
import ProviderPackageManagerDialog from "./ProviderPackageManagerDialog";

vi.mock("react-toastify", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock("@/services/admin/adminServicesService", () => ({
  adminServicesService: {
    getProviderPlans: vi.fn(), getProviderCapabilities: vi.fn(), getHostingPlans: vi.fn(),
    createProviderPlan: vi.fn(), updateProviderPlan: vi.fn(), deleteProviderPlan: vi.fn(),
  },
}));

const server = {
  id: 2, name: "WHM Reseller", slug: "whm-reseller", ip_address: "whm.example.com", type: "whm" as const,
  provisioning_mode: "automatic" as const, login_url: null, api_username: "reseller",
  api_auth_type: "password" as const, api_port: 2087, verify_tls: true, connect_timeout: 10,
  request_timeout: 30, is_active: true, created_at: "2026-09-27T00:00:00Z", has_api_token: true,
};
const providerPlan = {
  name: "reseller_starter", quota_mb: 2048, bandwidth_mb: 20480,
  max_ftp_accounts: 5, max_email_accounts: 10, max_databases: 10,
  max_subdomains: 5, max_parked_domains: 2, max_addon_domains: 2,
};
const capabilities = {
  provider: "whm", username: "reseller",
  account_limit: { used: 2, maximum: null, remaining: null, is_unlimited: true },
  permissions: { unlimited_features: true, unlimited_disk: false, unlimited_bandwidth: false },
  field_limits: {
    disk_quota: { maximum: null, allow_unlimited: false },
    bandwidth_limit_mb: { maximum: null, allow_unlimited: false },
    max_ftp_accounts: { maximum: null, allow_unlimited: true },
    max_email_accounts: { maximum: null, allow_unlimited: true },
    max_databases: { maximum: null, allow_unlimited: true },
    max_subdomains: { maximum: null, allow_unlimited: true },
    max_parked_domains: { maximum: null, allow_unlimited: true },
    max_addon_domains: { maximum: null, allow_unlimited: true },
  },
  warnings: ["WHM không cung cấp trần MB hữu hạn."], source: ["myprivs", "acctcounts"],
};
const meta = { current_page: 1, from: 1, last_page: 1, path: "", per_page: 100, to: 1, total: 1 };
const links = { first: null, last: null, prev: null, next: null };
const localPlan = {
  id: 8, server_id: 2, name: "Starter", whm_package_name: "reseller_starter",
  disk_quota: 2048, bandwidth_limit_mb: 20480, memory_limit_mb: 1024,
  max_ftp_accounts: 5, max_email_accounts: 10, max_databases: 10,
  max_subdomains: 5, max_parked_domains: 2, max_addon_domains: 2,
  custom_features: { backup: "Hàng ngày" }, price_per_month: "99000.00", display_order: 10,
  is_active: true, provider_available: true, provider_synced_at: "2026-09-27T00:00:00Z",
  created_at: "2026-09-27T00:00:00Z", server,
};

describe("ProviderPackageManagerDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(adminServicesService.getProviderPlans).mockResolvedValue([providerPlan]);
    vi.mocked(adminServicesService.getProviderCapabilities).mockResolvedValue(capabilities);
    vi.mocked(adminServicesService.getHostingPlans).mockResolvedValue({ success: true, message: null, data: [localPlan], meta, links });
    vi.mocked(adminServicesService.createProviderPlan).mockResolvedValue(localPlan);
    vi.mocked(adminServicesService.updateProviderPlan).mockResolvedValue(localPlan);
    vi.mocked(adminServicesService.deleteProviderPlan).mockResolvedValue({ package_name: providerPlan.name, local_plan_id: localPlan.id, provider_available: false });
  });

  it("creates a WHM package with advanced resources", async () => {
    render(<ProviderPackageManagerDialog server={server} onClose={vi.fn()} />);
    expect(await screen.findByText("reseller_starter")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Tạo package" }));
    fireEvent.change(screen.getByLabelText("Tên package"), { target: { value: "pro" } });
    fireEvent.change(screen.getByLabelText("Dung lượng (MB)"), { target: { value: "4096" } });
    fireEvent.change(screen.getByLabelText("Băng thông (MB)"), { target: { value: "40960" } });
    fireEvent.click(screen.getByLabelText("Không cấu hình RAM"));
    fireEvent.change(screen.getByLabelText("RAM metadata (MB)"), { target: { value: "2048" } });
    fireEvent.click(screen.getByRole("button", { name: "Thêm dòng Thông số tùy chỉnh" }));
    fireEvent.change(screen.getByLabelText("Thông số tùy chỉnh key"), { target: { value: "backup" } });
    fireEvent.change(screen.getByLabelText("Thông số tùy chỉnh value"), { target: { value: "6 giờ" } });
    fireEvent.click(screen.getByRole("button", { name: "Tạo trên WHM" }));

    await waitFor(() => expect(adminServicesService.createProviderPlan).toHaveBeenCalledWith(2, expect.objectContaining({
      name: "pro", disk_quota: 4096, bandwidth_limit_mb: 40960, memory_limit_mb: 2048,
      custom_features: { backup: "6 giờ" },
    })));
  });

  it("updates and confirms deletion with the canonical package name", async () => {
    render(<ProviderPackageManagerDialog server={server} onClose={vi.fn()} />);
    await screen.findByText("reseller_starter");
    expect(adminServicesService.getProviderCapabilities).toHaveBeenCalledWith(2, expect.any(AbortSignal));
    fireEvent.click(screen.getByRole("button", { name: "Sửa package reseller_starter" }));
    fireEvent.change(screen.getByLabelText("Addon domain"), { target: { value: "4" } });
    fireEvent.click(screen.getByRole("button", { name: "Cập nhật trên WHM" }));
    await waitFor(() => expect(adminServicesService.updateProviderPlan).toHaveBeenCalledWith(2, "reseller_starter", expect.objectContaining({ max_addon_domains: 4 })));

    fireEvent.click(screen.getByRole("button", { name: "Xóa package reseller_starter" }));
    fireEvent.click(screen.getByRole("button", { name: "Xóa package WHM" }));
    await waitFor(() => expect(adminServicesService.deleteProviderPlan).toHaveBeenCalledWith(2, "reseller_starter"));
  });

  it("explains fields and respects WHM unlimited permissions", async () => {
    render(<ProviderPackageManagerDialog server={server} onClose={vi.fn()} />);
    await screen.findByText("reseller_starter");
    fireEvent.click(screen.getByRole("button", { name: "Tạo package" }));

    expect(screen.getByLabelText("Dung lượng (MB): Không giới hạn")).toBeDisabled();
    expect(screen.getByLabelText("Tài khoản FTP: Không giới hạn")).toBeChecked();
    expect(screen.getByText("Tài khoản: 2 / Không giới hạn")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Giải thích Dung lượng (MB)" }));
    expect(screen.getByText(/Dung lượng đĩa tối đa/)).toBeInTheDocument();
  });
});
