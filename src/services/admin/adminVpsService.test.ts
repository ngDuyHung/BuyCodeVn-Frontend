import { beforeEach, describe, expect, it, vi } from "vitest";
import api from "@/services/api";
import { adminVpsService } from "./adminVpsService";

vi.mock("@/services/api", () => ({ default: { get: vi.fn(), post: vi.fn(), put: vi.fn() } }));

describe("adminVpsService", () => {
  beforeEach(() => vi.clearAllMocks());

  it("uses canonical VPS admin endpoints", async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { data: [], meta: { total: 0 } } });
    vi.mocked(api.post).mockResolvedValue({ data: { data: { id: 9 } } });
    vi.mocked(api.put).mockResolvedValue({ data: { data: { id: 1 } } });
    await adminVpsService.getPlans();
    await adminVpsService.getInstances({ status: "failed", user_id: 3 });
    await adminVpsService.syncCatalog();
    await adminVpsService.retryProvision(9);
    await adminVpsService.updateLocation(2, { name: "HCM", sale_surcharge: "10000.00", is_active: true });
    expect(api.get).toHaveBeenNthCalledWith(1, "/v1/admin/vps/plans", expect.anything());
    expect(api.get).toHaveBeenNthCalledWith(2, "/v1/admin/vps/instances", expect.objectContaining({ params: { status: "failed", user_id: 3 } }));
    expect(api.post).toHaveBeenCalledWith("/v1/admin/vps/instances/9/retry-provision", undefined, expect.anything());
    expect(api.put).toHaveBeenCalledWith("/v1/admin/vps/locations/2", expect.objectContaining({ sale_surcharge: "10000.00" }), expect.anything());
  });
});
