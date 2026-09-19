import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ProductCard from "./ProductCard";

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

describe("ProductCard", () => {
  it("links to the slug detail and renders the public thumbnail", () => {
    render(<ProductCard product={product} />);

    expect(
      screen
        .getAllByRole("link", { name: product.title })
        .every((link) => link.getAttribute("href") === "/source-code/laravel-shop"),
    ).toBe(true);
    expect(screen.getByRole("img", { name: product.title })).toHaveAttribute(
      "src",
      "https://cdn.example.com/laravel-shop.jpg",
    );
  });

  it("falls back when the thumbnail URL is not HTTP or HTTPS", () => {
    render(
      <ProductCard product={{ ...product, thumbnail_url: "javascript:alert(1)" }} />,
    );

    expect(screen.getByRole("img", { name: product.title })).toHaveAttribute(
      "src",
      "/images/demo_product.png",
    );
  });
});
