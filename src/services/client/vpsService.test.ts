import { beforeEach, describe, expect, it, vi } from "vitest";
import api from "../api";
import { vpsService } from "./vpsService";

vi.mock("../api", () => ({ default: { get: vi.fn() } }));

describe("vpsService", () => {
  beforeEach(() => vi.clearAllMocks());

  it("reads public plan and OS envelopes and normalizes sale price", async () => {
    const plan = { id: 1, pricing: { "1_month": { amount: 90000 } }, locations: [{ id: 2, surcharge: 10000 }] };
    vi.mocked(api.get)
      .mockResolvedValueOnce({ data: { success: true, data: [plan] } })
      .mockResolvedValueOnce({ data: { success: true, data: [{ id: 3, name: "Ubuntu", icon_url: null }] } });

    await expect(vpsService.getPlans()).resolves.toMatchObject([{ pricing: { "1_month": { amount: "90000.00" } }, locations: [{ surcharge: "10000.00" }] }]);
    await expect(vpsService.getOsImages()).resolves.toMatchObject([{ id: 3 }]);
    expect(api.get).toHaveBeenNthCalledWith(1, "/v1/services/vps-plans", { signal: undefined, suppressErrorToast: true });
    expect(api.get).toHaveBeenNthCalledWith(2, "/v1/services/vps-os-images", { signal: undefined, suppressErrorToast: true });
  });
});
