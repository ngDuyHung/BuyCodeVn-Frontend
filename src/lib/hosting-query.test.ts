import { describe, expect, it } from "vitest";
import { parseHostingQuery, toHostingSearchParams } from "./hosting-query";

describe("hosting query", () => {
  it("parses category and page while ignoring malformed values", () => {
    expect(
      parseHostingQuery(
        new URLSearchParams("server_category=vietnam-premium&page=3"),
      ),
    ).toEqual({
      per_page: 12,
      server_category: "vietnam-premium",
      page: 3,
    });

    expect(
      parseHostingQuery(
        new URLSearchParams("server_category=invalid%20category&page=-1"),
      ),
    ).toEqual({ per_page: 12 });
  });

  it("serializes the shareable filter and preserves a checkout plan", () => {
    expect(
      toHostingSearchParams(
        { server_category: "vietnam-premium", page: 2 },
        8,
      ).toString(),
    ).toBe("server_category=vietnam-premium&page=2&plan=8");
  });
});
