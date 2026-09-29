import { afterEach, describe, expect, it, vi } from "vitest";

describe("server runtime configuration", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("prefers the private API URL for server-side requests", async () => {
    vi.stubEnv("API_INTERNAL_URL", "http://127.0.0.1:8000/api/");
    const { getServerApiBaseUrl } = await import("./server-runtime");
    expect(getServerApiBaseUrl()).toBe("http://127.0.0.1:8000/api");
  });

  it("rejects an invalid private API URL", async () => {
    vi.stubEnv("API_INTERNAL_URL", "not-a-url");
    const { getServerApiBaseUrl } = await import("./server-runtime");
    expect(() => getServerApiBaseUrl()).toThrow("API_INTERNAL_URL");
  });
});
