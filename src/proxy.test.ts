import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { proxy } from "./proxy";

const request = (path: string, authenticated = false) => new NextRequest(`https://buycode.vn${path}`, {
  headers: authenticated ? { cookie: "auth_token=valid-token" } : undefined,
});

describe("auth proxy", () => {
  it("redirects a guest from a protected route with the complete return URL", () => {
    const response = proxy(request("/user/orders?status=pending"));
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://buycode.vn/login?returnUrl=%2Fuser%2Forders%3Fstatus%3Dpending");
  });

  it("redirects authenticated users away from login", () => {
    const response = proxy(request("/login", true));
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://buycode.vn/");
  });

  it("honors a safe return URL for an authenticated login request", () => {
    const response = proxy(request("/login?returnUrl=%2Fuser%2Forders", true));
    expect(response.headers.get("location")).toBe("https://buycode.vn/user/orders");
  });
});
