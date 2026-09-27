import { describe, expect, it } from "vitest";
import { updateAdminQuery } from "./useAdminQueryState";

describe("admin URL query", () => {
  it("preserves unrelated filters and clears empty values", () => {
    expect(updateAdminQuery("search=abc&page=3&is_active=0", { search: "", page: 1 }))
      .toBe("page=1&is_active=0");
    expect(updateAdminQuery("page=2", { role: "customer", page: null }))
      .toBe("role=customer");
  });
});
