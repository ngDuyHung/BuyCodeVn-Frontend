import { afterEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_SITE_SETTINGS } from "@/types/site-settings";
import { getSiteSettings } from "./siteSettingService";

describe("server site setting service", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("loads public branding without caching stale admin changes", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ success: true, data: { site_name: "BuyCode Test" } }), { status: 200 })));
    await expect(getSiteSettings()).resolves.toMatchObject({ site_name: "BuyCode Test", site_email: DEFAULT_SITE_SETTINGS.site_email });
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining("/v1/site-settings"), expect.objectContaining({ cache: "no-store" }));
  });

  it("falls back to safe defaults when backend is unavailable", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    await expect(getSiteSettings()).resolves.toEqual(DEFAULT_SITE_SETTINGS);
  });
});
