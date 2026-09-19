import { describe, expect, it } from "vitest";
import { getPaginationItems } from "./Pagination";

describe("getPaginationItems", () => {
  it("shows every page for a short result set", () => {
    expect(getPaginationItems(2, 5)).toEqual([1, 2, 3, 4, 5]);
  });

  it("compacts a long result set around the current page", () => {
    expect(getPaginationItems(5, 10)).toEqual([
      1,
      "ellipsis-start",
      4,
      5,
      6,
      "ellipsis-end",
      10,
    ]);
  });
});
