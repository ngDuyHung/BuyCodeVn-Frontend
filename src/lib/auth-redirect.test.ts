import { describe, expect, it } from "vitest";
import { getSafeReturnUrl } from "./auth-redirect";

describe("getSafeReturnUrl", () => {
  it("returns a local return URL", () => {
    expect(
      getSafeReturnUrl("?returnUrl=%2Fuser%2Forders%3Fstatus%3Dcompleted"),
    ).toBe("/user/orders?status=completed");
  });

  it("falls back for external and protocol-relative URLs", () => {
    expect(getSafeReturnUrl("?returnUrl=https://example.com")).toBe("/user");
    expect(getSafeReturnUrl("?returnUrl=//example.com")).toBe("/user");
    expect(getSafeReturnUrl("")).toBe("/user");
  });
});
