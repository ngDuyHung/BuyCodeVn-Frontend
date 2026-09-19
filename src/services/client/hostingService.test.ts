import { beforeEach, describe, expect, it, vi } from "vitest";
import api from "../api";
import { hostingService } from "./hostingService";

vi.mock("../api", () => ({
  default: { get: vi.fn() },
}));

describe("hostingService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("maps public server categories without infrastructure fields", async () => {
    const category = {
      id: 1,
      slug: "vietnam-premium",
      name: "Vietnam Premium",
    };
    vi.mocked(api.get).mockResolvedValueOnce({
      data: { success: true, message: null, data: [category] },
    });

    await expect(hostingService.getServerCategories()).resolves.toEqual([
      category,
    ]);
    expect(api.get).toHaveBeenCalledWith(
      "/v1/services/server-categories",
      expect.objectContaining({ suppressErrorToast: true }),
    );
    expect(category).not.toHaveProperty("ip_address");
    expect(category).not.toHaveProperty("api_token");
  });

  it("maps public list and detail envelopes without internal server fields", async () => {
    const plan = {
      id: 1,
      name: "Business",
      disk_quota: 10240,
      price_per_month: "50000.00",
    };
    const list = {
      success: true,
      message: null,
      data: [plan],
      links: {},
      meta: { current_page: 1, last_page: 1 },
    };
    vi.mocked(api.get)
      .mockResolvedValueOnce({ data: list })
      .mockResolvedValueOnce({
        data: { success: true, message: null, data: plan },
      });

    await expect(
      hostingService.getPlans({
        per_page: 3,
        server_category: "vietnam-premium",
      }),
    ).resolves.toBe(list);
    await expect(hostingService.getPlan(1)).resolves.toBe(plan);
    expect(api.get).toHaveBeenNthCalledWith(
      1,
      "/v1/services/hosting-plans",
      expect.objectContaining({
        params: {
          per_page: 3,
          server_category: "vietnam-premium",
        },
      }),
    );
    expect(plan).not.toHaveProperty("server_id");
    expect(plan).not.toHaveProperty("whm_package_name");
  });
});
