import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { adminVpsService } from "@/services/admin/adminVpsService";
import { useAuthStore } from "@/stores/authStore";
import AdminVpsConsole from "./AdminVpsConsole";

vi.mock("react-toastify", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock("@/services/admin/adminVpsService", () => ({ adminVpsService: { getProviderConfig: vi.fn(), getPlans: vi.fn(), getLocations: vi.fn(), getInstances: vi.fn(), getProviderHealth: vi.fn(), updateProviderConfig: vi.fn(), syncCatalog: vi.fn(), updatePlan: vi.fn(), updateLocation: vi.fn(), getInstance: vi.fn(), syncInstance: vi.fn(), retryProvision: vi.fn() } }));

const emptyPage = { success: true as const, message: null, data: [], links: { first: null, last: null, prev: null, next: null }, meta: { current_page: 1, from: null, last_page: 1, path: "", per_page: 15, to: null, total: 0 } };

describe("AdminVpsConsole", () => {
  beforeEach(() => { vi.clearAllMocks(); useAuthStore.setState({ user: { id: 1, name: "Admin", email: "admin@test.vn", is_active: true, roles: ["admin"], permissions: [] } }); vi.mocked(adminVpsService.getProviderConfig).mockResolvedValue({ provider: "xvps", configured: true, environment: "sandbox", base_url: "https://api-sandbox.xvps.vn", api_username_masked: "tes****ser", api_app_masked: "san****app", has_api_secret: true, max_retries: 2, timeout_seconds: 30, is_active: true }); vi.mocked(adminVpsService.getPlans).mockResolvedValue(emptyPage); vi.mocked(adminVpsService.getLocations).mockResolvedValue(emptyPage); vi.mocked(adminVpsService.getInstances).mockResolvedValue(emptyPage); });

  it("shows masked credential state but never hydrates secret inputs", async () => {
    render(<AdminVpsConsole />);
    expect(await screen.findByText("tes****ser")).toBeInTheDocument();
    expect(screen.getByLabelText(/API username/)).toHaveValue("");
    expect(screen.getByLabelText(/API app/)).toHaveValue("");
    expect(screen.getByLabelText(/API secret/)).toHaveValue("");
  });
});
