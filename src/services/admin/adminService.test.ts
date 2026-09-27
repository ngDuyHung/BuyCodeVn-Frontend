import { beforeEach, describe, expect, it, vi } from "vitest";
import api from "@/services/api";
import { adminService } from "./adminService";

vi.mock("@/services/api", () => ({ default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), put: vi.fn(), delete: vi.fn() } }));

describe("adminService", () => {
  beforeEach(() => vi.clearAllMocks());

  it("passes user filters to the admin API", async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { data: [], meta: { total: 0 } } });
    await adminService.getUsers({ page: 2, search: "Lan", is_active: 0 });
    expect(api.get).toHaveBeenCalledWith("/v1/admin/users", expect.objectContaining({ params: { page: 2, search: "Lan", is_active: 0 } }));
  });

  it("reads permission resources and totals from real admin endpoints", async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ data: { data: [{ id: 1, name: "users.view" }] } })
      .mockResolvedValueOnce({ data: { meta: { total: 42 } } });
    expect(await adminService.getPermissions()).toEqual([{ id: 1, name: "users.view" }]);
    expect(await adminService.getTotal("orders")).toBe(42);
    expect(api.get).toHaveBeenLastCalledWith("/v1/admin/orders", expect.objectContaining({ params: { per_page: 1 } }));
  });

  it("maps IAM mutations to the protected admin commands", async () => {
    vi.mocked(api.patch).mockResolvedValue({ data: { data: { id: 2 } } });
    vi.mocked(api.put).mockResolvedValue({ data: { data: { id: 2 } } });
    await adminService.updateUserStatus(2, false);
    await adminService.syncUserRoles(2, ["cskh"]);
    expect(api.patch).toHaveBeenCalledWith("/v1/admin/users/2/status", { is_active: false }, expect.anything());
    expect(api.put).toHaveBeenCalledWith("/v1/admin/users/2/roles", { roles: ["cskh"] }, expect.anything());
  });

  it("maps user wallet history and adjustments to protected endpoints", async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { data: [], meta: { total: 0 } } });
    vi.mocked(api.post).mockResolvedValue({ data: { data: { idempotent: false } } });
    const payload = {
      direction: "credit" as const,
      amount: "100000.00",
      note: "Bù số dư",
      idempotency_key: "f4ad579d-2fff-4f6f-9757-547fce61f099",
    };

    await adminService.getUserWalletTransactions(9, { page: 2, type: "admin_credit" });
    await adminService.adjustUserWallet(9, payload);

    expect(api.get).toHaveBeenCalledWith("/v1/admin/users/9/wallet-transactions", expect.objectContaining({ params: { page: 2, type: "admin_credit" } }));
    expect(api.post).toHaveBeenCalledWith("/v1/admin/users/9/wallet-adjustments", payload, expect.anything());
  });
});
