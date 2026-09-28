import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { adminSiteSettingService } from "@/services/admin/adminSiteSettingService";
import { useAuthStore } from "@/stores/authStore";
import { DEFAULT_SITE_SETTINGS } from "@/types/site-settings";
import AdminSiteSettingForm from "./AdminSiteSettingForm";

vi.mock("react-toastify", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock("@/services/admin/adminSiteSettingService", () => ({ adminSiteSettingService: { getSettings: vi.fn(), updateSettings: vi.fn() } }));

describe("AdminSiteSettingForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(adminSiteSettingService.getSettings).mockResolvedValue(DEFAULT_SITE_SETTINGS);
    vi.mocked(adminSiteSettingService.updateSettings).mockResolvedValue({ ...DEFAULT_SITE_SETTINGS, site_name: "BuyCode mới" });
    useAuthStore.setState({ user: { id: 1, name: "Admin", email: "admin@example.com", is_active: true, roles: ["admin"], permissions: [] } });
  });

  it("updates website identity through the real settings payload", async () => {
    render(<AdminSiteSettingForm />);
    const name = await screen.findByLabelText("Tên website mặc định");
    fireEvent.change(name, { target: { value: "BuyCode mới" } });
    fireEvent.click(screen.getByRole("button", { name: /Lưu cài đặt/ }));
    await waitFor(() => expect(adminSiteSettingService.updateSettings).toHaveBeenCalledWith(expect.objectContaining({ site_name: "BuyCode mới" })));
  });

  it("renders settings read-only for a viewer", async () => {
    useAuthStore.setState({ user: { id: 2, name: "Viewer", email: "v@example.com", is_active: true, roles: ["staff"], permissions: ["settings.view"] } });
    render(<AdminSiteSettingForm />);
    expect(await screen.findByLabelText("Tên website mặc định")).toBeDisabled();
    expect(screen.queryByRole("button", { name: /Lưu cài đặt/ })).not.toBeInTheDocument();
  });
});
