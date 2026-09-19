import { afterEach, describe, expect, it, vi } from "vitest";
import { getPublicProduct } from "./catalogService";

const product = {
  id: 1,
  category_id: 1,
  type: "source_code",
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

describe("server catalog service", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("unwraps a public product response", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ success: true, message: null, data: product }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(getPublicProduct("laravel-shop-test")).resolves.toMatchObject({
      id: 1,
      slug: "laravel-shop",
    });
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/v1/catalog/products/laravel-shop-test"),
      expect.objectContaining({ headers: { Accept: "application/json" } }),
    );
  });

  it("returns null for a missing product", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(null, { status: 404 })),
    );

    await expect(getPublicProduct("missing-product-test")).resolves.toBeNull();
  });
});
