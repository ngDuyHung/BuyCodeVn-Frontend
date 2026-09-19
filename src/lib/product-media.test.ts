import { describe, expect, it } from "vitest";
import {
  getProductImageUrl,
  getSafeExternalUrl,
  PRODUCT_IMAGE_FALLBACK,
} from "./product-media";

describe("product media URLs", () => {
  it("accepts only absolute HTTP and HTTPS URLs", () => {
    expect(getSafeExternalUrl("https://demo.example.com/product")).toBe(
      "https://demo.example.com/product",
    );
    expect(getSafeExternalUrl("http://localhost:8000/demo")).toBe(
      "http://localhost:8000/demo",
    );
    expect(getSafeExternalUrl("javascript:alert(1)")).toBeNull();
    expect(getSafeExternalUrl("/relative-demo")).toBeNull();
  });

  it("uses the local image when a thumbnail is absent or invalid", () => {
    expect(getProductImageUrl(null)).toBe(PRODUCT_IMAGE_FALLBACK);
    expect(getProductImageUrl("products/source.zip")).toBe(
      PRODUCT_IMAGE_FALLBACK,
    );
  });
});
