import { beforeEach, describe, expect, it, vi } from "vitest";
import api from "@/services/api";
import { DEFAULT_SITE_SETTINGS } from "@/types/site-settings";
import { adminSiteSettingService } from "./adminSiteSettingService";

vi.mock("@/services/api", () => ({ default: { get: vi.fn(), post: vi.fn() } }));

describe("adminSiteSettingService", () => {
  beforeEach(() => vi.clearAllMocks());

  it("reads settings and serializes branding uploads", async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { data: DEFAULT_SITE_SETTINGS } });
    vi.mocked(api.post).mockResolvedValue({ data: { data: DEFAULT_SITE_SETTINGS } });
    await adminSiteSettingService.getSettings();
    const logo = new File(["logo"], "logo.webp", { type: "image/webp" });
    await adminSiteSettingService.updateSettings({ ...DEFAULT_SITE_SETTINGS, logo, remove_footer_logo: true });
    const body = vi.mocked(api.post).mock.calls[0][1] as FormData;
    expect(body.get("logo")).toBe(logo);
    expect(body.get("remove_footer_logo")).toBe("1");
    expect(api.get).toHaveBeenCalledWith("/v1/admin/site-settings", expect.objectContaining({ suppressErrorToast: true }));
  });
});
