import { beforeEach, describe, expect, it, vi } from "vitest";
import api from "@/services/api";
import { adminCatalogService } from "./adminCatalogService";

vi.mock("@/services/api", () => ({ default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() } }));

describe("adminCatalogService", () => {
  beforeEach(() => vi.clearAllMocks());

  it("uses admin read endpoints and catalog write endpoints", async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: { data: [] } }).mockResolvedValueOnce({ data: { data: [], meta: { total: 0 } } });
    await adminCatalogService.getCategories();
    await adminCatalogService.getProducts({ page: 2, is_active: 0 });
    expect(api.get).toHaveBeenNthCalledWith(1, "/v1/admin/catalog/categories", expect.objectContaining({ suppressErrorToast: true }));
    expect(api.get).toHaveBeenNthCalledWith(2, "/v1/admin/catalog/products", expect.objectContaining({ params: { page: 2, is_active: 0 } }));

    vi.mocked(api.post).mockResolvedValue({ data: { data: { id: 1 } } });
    await adminCatalogService.createCategory({ name: "Template", parent_id: null, is_active: true });
    expect(api.post).toHaveBeenCalledWith("/v1/catalog/categories", expect.objectContaining({ name: "Template" }), expect.anything());
  });

  it("does not request file_url back when updating a product", async () => {
    vi.mocked(api.put).mockResolvedValue({ data: { data: { id: 8, slug: "backend-slug" } } });
    await adminCatalogService.updateProduct(8, { title: "Updated" });
    expect(api.put).toHaveBeenCalledWith("/v1/catalog/products/8", { title: "Updated" }, expect.anything());
  });
});
