import { afterEach, describe, expect, it, vi } from "vitest";
import { getHomePresentationSlides } from "./presentationService";

describe("server presentation service", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("loads the scheduled home hero slides", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ success: true, data: [{ id: 1, title: "Hero" }] }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    await expect(getHomePresentationSlides()).resolves.toEqual([{ id: 1, title: "Hero" }]);
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/v1/presentation-slides?placement=home_hero"), expect.objectContaining({ next: { revalidate: 60 } }));
  });

  it("uses an empty collection as a safe fallback when backend fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    await expect(getHomePresentationSlides()).resolves.toEqual([]);
  });
});
