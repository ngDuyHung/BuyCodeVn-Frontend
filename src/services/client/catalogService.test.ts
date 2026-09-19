import { beforeEach, describe, expect, it, vi } from "vitest";
import api from "../api";
import { catalogService } from "./catalogService";

vi.mock("../api", () => ({
  default: {
    get: vi.fn(),
  },
}));

const product = {
  id: 1,
  category_id: 1,
  type: "source_code" as const,
  title: "Laravel Shop",
  slug: "laravel-shop",
  description: "Mô tả",
  thumbnail_url: "https://cdn.example.com/laravel-shop.jpg",
  demo_url: "https://demo.example.com/laravel-shop",
  price: "150000.00",
  is_active: true,
  created_at: "2026-09-08T06:16:54+00:00",
  updated_at: "2026-09-08T06:16:54+00:00",
};

describe("catalogService", () => {
  beforeEach(() => vi.clearAllMocks());

  it("loads a product by encoded slug and unwraps the resource", async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: { success: true, message: null, data: product },
    });
    const controller = new AbortController();

    await expect(
      catalogService.getProduct("laravel shop", controller.signal),
    ).resolves.toEqual(product);
    expect(api.get).toHaveBeenCalledWith(
      "/v1/catalog/products/laravel%20shop",
      { signal: controller.signal, suppressErrorToast: true },
    );
  });

  it("passes filters and cancellation signal to product listing", async () => {
    const response = {
      success: true,
      message: null,
      data: [product],
      links: {},
      meta: { total: 1 },
    };
    vi.mocked(api.get).mockResolvedValue({ data: response });
    const controller = new AbortController();
    const query = { search: "Laravel", page: 2 };

    await expect(
      catalogService.getProducts(query, controller.signal),
    ).resolves.toEqual(response);
    expect(api.get).toHaveBeenCalledWith("/v1/catalog/products", {
      params: query,
      signal: controller.signal,
      suppressErrorToast: true,
    });
  });
});
