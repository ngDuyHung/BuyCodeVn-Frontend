import { describe, expect, it } from "vitest";
import { getSafeReturnUrl } from "./auth-redirect";

describe("getSafeReturnUrl", () => {
  it("returns a local return URL", () => {
    expect(
      getSafeReturnUrl("?returnUrl=%2Fuser%2Forders%3Fstatus%3Dcompleted"),
    ).toBe("/user/orders?status=completed");
  });

  it("falls back for external and protocol-relative URLs", () => {
    expect(getSafeReturnUrl("?returnUrl=https://example.com")).toBe("/");
    expect(getSafeReturnUrl("?returnUrl=//example.com")).toBe("/");
    expect(getSafeReturnUrl("")).toBe("/");
  });

  it("prevents redirect loops back to guest-only pages", () => {
    expect(getSafeReturnUrl("?returnUrl=%2Flogin")).toBe("/");
    expect(getSafeReturnUrl("?returnUrl=%2Fregister%3Ffrom%3Dlogin")).toBe("/");
  });
});
