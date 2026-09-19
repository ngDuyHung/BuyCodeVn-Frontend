import { describe, expect, it } from "vitest";
import { parseCatalogQuery, toCatalogSearchParams } from "./catalog-query";

describe("catalog query", () => {
  it("parses supported filters and ignores invalid values", () => {
    expect(
      parseCatalogQuery({
        search: "  Laravel ",
        category_id: "3",
        type: "source_code",
        page: "2",
      }),
    ).toEqual({
      per_page: 15,
      search: "Laravel",
      category_id: 3,
      type: "source_code",
      page: 2,
    });

    expect(
      parseCatalogQuery({ category_id: "-1", type: "invalid", page: "0" }),
    ).toEqual({ per_page: 15 });
  });

  it("serializes only shareable filters", () => {
    expect(
      toCatalogSearchParams({
        per_page: 15,
        search: "Laravel",
        category_id: 3,
        type: "template",
        page: 4,
      }).toString(),
    ).toBe("search=Laravel&category_id=3&type=template&page=4");
  });
});
