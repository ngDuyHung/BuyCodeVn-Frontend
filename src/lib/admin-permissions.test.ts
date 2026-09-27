import { describe, expect, it } from "vitest";
import { can, hasAdminAccess } from "./admin-permissions";

describe("admin permissions", () => {
  it("requires exact backend permissions instead of trusting a role name", () => {
    const customer = { roles: ["customer"], permissions: [] };
    const operator = { roles: ["cskh"], permissions: ["users.view"] };
    expect(hasAdminAccess(customer)).toBe(false);
    expect(hasAdminAccess(operator)).toBe(true);
    expect(can(operator, "users.view")).toBe(true);
    expect(can(operator, "users.delete")).toBe(false);
    expect(hasAdminAccess({ roles: ["customer"], permissions: ["unrelated.custom"] })).toBe(false);
    const admin = { roles: ["admin"], permissions: [] };
    expect(hasAdminAccess(admin)).toBe(true);
    expect(can(admin, "roles.manage")).toBe(true);
  });
});
