import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useCatalog } from "@/hooks/client/useCatalog";
import type { Product } from "@/types/catalog";
import FeaturedProducts from "./FeaturedProducts";

vi.mock("@/hooks/client/useCatalog", () => ({ useCatalog: vi.fn() }));

const products: Product[] = Array.from({ length: 6 }, (_, index) => ({
  id: index + 1,
  category_id: 1,
  type: "source_code",
  title: `Sản phẩm ${index + 1}`,
  slug: `san-pham-${index + 1}`,
  description: "Mô tả sản phẩm",
  thumbnail_url: null,
  demo_url: null,
  price: "150000",
  is_active: true,
  created_at: "2026-09-29T00:00:00Z",
  updated_at: "2026-09-29T00:00:00Z",
}));

describe("FeaturedProducts", () => {
  it("requests and renders at most four products", () => {
    vi.mocked(useCatalog).mockReturnValue({
      products,
      categories: [],
      meta: null,
      isLoading: false,
      error: null,
      retry: vi.fn(),
      updateParams: vi.fn(),
      params: { per_page: 4, is_active: true },
    });

    render(<FeaturedProducts />);

    expect(useCatalog).toHaveBeenCalledWith(
      { per_page: 4, is_active: true },
      { loadCategories: false },
    );
    expect(screen.getAllByRole("article")).toHaveLength(4);
    expect(screen.queryByText("Sản phẩm 5")).not.toBeInTheDocument();
  });
});
