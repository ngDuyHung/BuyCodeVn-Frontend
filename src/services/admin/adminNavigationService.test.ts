import { beforeEach, describe, expect, it, vi } from "vitest";
import api from "@/services/api";
import { adminNavigationService } from "./adminNavigationService";

vi.mock("@/services/api", () => ({ default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() } }));

describe("adminNavigationService", () => {
  beforeEach(() => vi.clearAllMocks());

  it("uses admin CRUD and reorder endpoints", async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { data: [] } });
    vi.mocked(api.post).mockResolvedValue({ data: { data: { id: 1 } } });
    vi.mocked(api.put).mockResolvedValue({ data: { data: { id: 1 } } });
    const payload = { placement: "header" as const, parent_id: null, label: "Hosting", url: "/hosting", icon: "fa-server", target: "_self" as const, sort_order: 10, is_active: true };
    await adminNavigationService.getItems({ placement: "header" });
    await adminNavigationService.createItem(payload);
    await adminNavigationService.updateItem(1, payload);
    await adminNavigationService.reorderItems([{ id: 1, sort_order: 20 }]);
    expect(api.get).toHaveBeenCalledWith("/v1/admin/navigation-items", expect.objectContaining({ params: { placement: "header" } }));
    expect(api.post).toHaveBeenCalledWith("/v1/admin/navigation-items", payload, expect.anything());
    expect(api.put).toHaveBeenCalledWith("/v1/admin/navigation-items/1", payload, expect.anything());
    expect(api.post).toHaveBeenCalledWith("/v1/admin/navigation-items/reorder", { items: [{ id: 1, sort_order: 20 }] }, expect.anything());
  });
});
