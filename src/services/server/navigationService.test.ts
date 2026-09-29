import { afterEach, describe, expect, it, vi } from "vitest";
import { getNavigationMenus } from "./navigationService";

describe("server navigation service", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("unwraps public header and footer menus", async () => {
    const data = { header: [{ id: 1, label: "Home", children: [] }], footer: [] };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ success: true, data }), { status: 200 })));
    await expect(getNavigationMenus()).resolves.toEqual(data);
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining("/v1/navigation-menus"), expect.objectContaining({ next: expect.objectContaining({ revalidate: 60 }) }));
  });

  it("returns null so layouts can use defaults when API is unavailable", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    await expect(getNavigationMenus()).resolves.toBeNull();
  });
});
