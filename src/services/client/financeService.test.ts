import { describe, expect, it, vi } from "vitest";
import api from "../api";
import { financeService } from "./financeService";

vi.mock("../api", () => ({
  default: { get: vi.fn(), post: vi.fn() },
}));

describe("financeService", () => {
  it("unwraps the wallet envelope", async () => {
    const wallet = {
      id: 1,
      balance: "150000.00",
      currency: "VND",
      is_active: true,
      updated_at: "2026-09-19T00:00:00+00:00",
    };
    vi.mocked(api.get).mockResolvedValue({
      data: { success: true, message: null, data: wallet },
    });

    await expect(financeService.getWallet()).resolves.toEqual(wallet);
    expect(api.get).toHaveBeenCalledWith("/v1/finance/wallet", {
      signal: undefined,
      suppressErrorToast: true,
    });
  });
});
