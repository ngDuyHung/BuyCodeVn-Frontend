import { beforeEach, describe, expect, it, vi } from "vitest";
import api from "@/services/api";
import { adminPresentationService } from "./adminPresentationService";

vi.mock("@/services/api", () => ({ default: { get: vi.fn(), post: vi.fn(), delete: vi.fn() } }));

describe("adminPresentationService", () => {
  beforeEach(() => vi.clearAllMocks());

  it("loads slides with admin filters", async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { data: [], meta: { total: 0 } } });
    await adminPresentationService.getSlides({ placement: "home_hero", is_active: 1 });
    expect(api.get).toHaveBeenCalledWith("/v1/admin/presentation-slides", expect.objectContaining({
      params: { placement: "home_hero", is_active: 1 }, suppressErrorToast: true,
    }));
  });

  it("serializes files, booleans and numbers as multipart data", async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { data: { id: 1 } } });
    const image = new File(["image"], "hero.webp", { type: "image/webp" });
    await adminPresentationService.createSlide({
      placement: "home_hero", internal_name: "Home", title: "BUYCODE", desktop_image: image,
      layout: "split", content_alignment: "left", theme: "light", overlay_opacity: 20,
      sort_order: 10, is_active: true, highlights: [{ icon: "fa-award", label: "Chất lượng" }],
    });
    const body = vi.mocked(api.post).mock.calls[0][1] as FormData;
    expect(body.get("desktop_image")).toBe(image);
    expect(body.get("overlay_opacity")).toBe("20");
    expect(body.get("is_active")).toBe("1");
    expect(body.get("highlights[0][icon]")).toBe("fa-award");
    expect(body.get("highlights[0][label]")).toBe("Chất lượng");
  });

  it("uses the multipart update alias and reorder endpoint", async () => {
    vi.mocked(api.post).mockResolvedValue({ data: { data: { id: 8 } } });
    const payload = { placement: "home_hero" as const, internal_name: "Home", title: "Hero", layout: "cover" as const, content_alignment: "center" as const, theme: "dark" as const, overlay_opacity: 40, sort_order: 10, is_active: false };
    await adminPresentationService.updateSlide(8, payload);
    await adminPresentationService.reorderSlides([{ id: 8, sort_order: 20 }]);
    expect(api.post).toHaveBeenNthCalledWith(1, "/v1/admin/presentation-slides/8", expect.any(FormData), expect.anything());
    expect(api.post).toHaveBeenNthCalledWith(2, "/v1/admin/presentation-slides/reorder", { slides: [{ id: 8, sort_order: 20 }] }, expect.anything());
  });
});
