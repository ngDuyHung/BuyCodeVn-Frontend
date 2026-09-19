import { describe, expect, it } from "vitest";
import { isValidDomain, normalizeDomain } from "./validation";

describe("domain validation", () => {
  it("normalizes protocol, case and trailing slash", () => {
    expect(normalizeDomain(" HTTPS://Example.COM/ ")).toBe("example.com");
  });

  it.each([
    "example.com",
    "shop.example.com",
    "example.edu.vn",
    "my-site.vn",
  ])("accepts valid domain %s", (domain) => {
    expect(isValidDomain(domain)).toBe(true);
  });

  it.each(["localhost", "-example.com", "example", "not a domain", "a..com"])(
    "rejects invalid domain %s",
    (domain) => {
      expect(isValidDomain(domain)).toBe(false);
    },
  );
});
