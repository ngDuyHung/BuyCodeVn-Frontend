import { beforeEach, describe, expect, it, vi } from "vitest";
import api from "@/services/api";
import { adminServicesService } from "./adminServicesService";

vi.mock("@/services/api", () => ({ default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn() } }));

describe("adminServicesService", () => {
  beforeEach(() => vi.clearAllMocks());

  it("uses the service admin endpoints and preserves zero-value filters", async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { data: [], meta: { total: 0 } } });

    await adminServicesService.getServers({ page: 2, type: "whm", is_active: 0 });
    await adminServicesService.getHostingPlans({ server_id: 4, is_active: 0 });
    await adminServicesService.getTldPricing({ is_auto_register: 0, is_active: 1 });

    expect(api.get).toHaveBeenNthCalledWith(1, "/v1/services/servers", expect.objectContaining({ params: { page: 2, type: "whm", is_active: 0 } }));
    expect(api.get).toHaveBeenNthCalledWith(2, "/v1/admin/services/hosting-plans", expect.objectContaining({ params: { server_id: 4, is_active: 0 } }));
    expect(api.get).toHaveBeenNthCalledWith(3, "/v1/services/tld-pricing", expect.objectContaining({ params: { is_auto_register: 0, is_active: 1 } }));
  });

  it("does not add a token when updating unrelated server fields", async () => {
    vi.mocked(api.put).mockResolvedValue({ data: { data: { id: 3 } } });
    await adminServicesService.updateServer(3, { name: "WHM VN 02", is_active: false });
    expect(api.put).toHaveBeenCalledWith(
      "/v1/services/servers/3",
      { name: "WHM VN 02", is_active: false },
      expect.objectContaining({ suppressErrorToast: true }),
    );
  });

  it("uses the canonical admin hosting-plan write route", async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { data: { id: 9 } } });
    await adminServicesService.createHostingPlan({ server_id: 1, name: "Basic", whm_package_name: "basic", disk_quota: 1024, bandwidth_limit_mb: 10240, memory_limit_mb: null, max_ftp_accounts: 0, max_email_accounts: 0, max_databases: 0, max_subdomains: 0, max_parked_domains: 0, max_addon_domains: 0, custom_features: {}, price_per_month: "50000.00", display_order: 10, is_active: true });
    expect(api.post).toHaveBeenCalledWith("/v1/admin/services/hosting-plans", expect.objectContaining({ whm_package_name: "basic" }), expect.anything());
  });

  it("maps WHM connection and provider package endpoints", async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { data: { success: true, version: "11.134" } } });
    vi.mocked(api.get).mockResolvedValue({ data: { data: [{ name: "reseller_basic" }] } });

    await adminServicesService.testServerConnection(7);
    await adminServicesService.getProviderPlans(7);
    await adminServicesService.getProviderCapabilities(7);

    expect(api.post).toHaveBeenCalledWith("/v1/services/servers/7/test-connection", undefined, expect.anything());
    expect(api.get).toHaveBeenCalledWith("/v1/services/servers/7/provider-plans", expect.objectContaining({ suppressErrorToast: true }));
    expect(api.get).toHaveBeenCalledWith("/v1/services/servers/7/provider-capabilities", expect.objectContaining({ suppressErrorToast: true }));
  });

  it("maps provider package create update and confirmed delete commands", async () => {
    const payload = {
      disk_quota: 2048, bandwidth_limit_mb: 20480, memory_limit_mb: 1024,
      max_ftp_accounts: 5, max_email_accounts: 10, max_databases: 10,
      max_subdomains: 5, max_parked_domains: 2, max_addon_domains: 2,
      custom_features: { backup: "Hàng ngày" },
    };
    vi.mocked(api.post).mockResolvedValue({ data: { data: { id: 1 } } });
    vi.mocked(api.patch).mockResolvedValue({ data: { data: { id: 1 } } });
    vi.mocked(api.delete).mockResolvedValue({ data: { data: { package_name: "reseller_starter" } } });

    await adminServicesService.createProviderPlan(7, { ...payload, name: "starter" });
    await adminServicesService.updateProviderPlan(7, "reseller_starter", payload);
    await adminServicesService.deleteProviderPlan(7, "reseller_starter");

    expect(api.post).toHaveBeenCalledWith("/v1/services/servers/7/provider-plans", expect.objectContaining({ name: "starter" }), expect.anything());
    expect(api.patch).toHaveBeenCalledWith("/v1/services/servers/7/provider-plans/reseller_starter", payload, expect.anything());
    expect(api.delete).toHaveBeenCalledWith("/v1/services/servers/7/provider-plans/reseller_starter", expect.objectContaining({ data: { confirm_name: "reseller_starter" } }));
  });
});
