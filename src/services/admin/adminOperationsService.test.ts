import { beforeEach, describe, expect, it, vi } from "vitest";
import api from "@/services/api";
import { adminOperationsService } from "./adminOperationsService";

vi.mock("@/services/api", () => ({ default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() } }));

describe("adminOperationsService", () => {
  beforeEach(() => vi.clearAllMocks());

  it("maps coupon, order and service operations to canonical endpoints", async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { data: [], meta: { total: 0 } } });
    vi.mocked(api.post).mockResolvedValue({ data: { data: { service_id: 4 } } });

    await adminOperationsService.getCoupons({ search: "SALE", is_active: 0 });
    await adminOperationsService.getOrders({ status: "processing", item_type: "domain" });
    await adminOperationsService.getServices({ status: "pending", service_type: "domain" });
    await adminOperationsService.approveDomain(4);
    await adminOperationsService.activateHosting(5, { username: "host5", password: "Password123", login_url: "https://panel.test" });

    expect(api.get).toHaveBeenNthCalledWith(1, "/v1/orders/coupons", expect.objectContaining({ params: { search: "SALE", is_active: 0 } }));
    expect(api.get).toHaveBeenNthCalledWith(2, "/v1/admin/orders", expect.objectContaining({ params: { status: "processing", item_type: "domain" } }));
    expect(api.get).toHaveBeenNthCalledWith(3, "/v1/admin/services", expect.objectContaining({ params: { status: "pending", service_type: "domain" } }));
    expect(api.post).toHaveBeenCalledWith("/v1/admin/services/4/approve-domain", undefined, expect.anything());
    expect(api.post).toHaveBeenCalledWith("/v1/admin/services/5/activate-hosting", expect.objectContaining({ username: "host5" }), expect.anything());
  });
});
