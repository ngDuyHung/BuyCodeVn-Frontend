import { describe, expect, it } from "vitest";
import { normalizeTld } from "./tld";

describe("normalizeTld", () => {
  it.each([
    ["com", ".com"],
    [".VN", ".vn"],
    ["  ..Net  ", ".net"],
    ["", ""],
  ])("normalizes %s", (input, expected) => {
    expect(normalizeTld(input)).toBe(expected);
  });
});
