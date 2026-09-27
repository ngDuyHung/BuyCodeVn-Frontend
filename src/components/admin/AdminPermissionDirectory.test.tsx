import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { adminService } from "@/services/admin/adminService";
import AdminPermissionDirectory from "./AdminPermissionDirectory";

vi.mock("react-toastify", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock("@/services/admin/adminService", () => ({ adminService: { getPermissions: vi.fn(), getRoles: vi.fn(), createRole: vi.fn(), updateRole: vi.fn(), deleteRole: vi.fn() } }));

describe("AdminPermissionDirectory", () => {
  beforeEach(() => { vi.clearAllMocks(); vi.mocked(adminService.getPermissions).mockResolvedValue([{ id: 1, name: "users.view" }]); vi.mocked(adminService.getRoles).mockResolvedValue([{ id: 1, name: "admin", permissions: ["users.view"], users_count: 1, created_at: "", updated_at: "" }, { id: 6, name: "operator", permissions: [], users_count: 0, created_at: "", updated_at: "" }]); });

  it("protects system roles and exposes delete only for an unused custom role", async () => {
    render(<AdminPermissionDirectory />);
    await screen.findByText("operator");
    expect(screen.queryByRole("button", { name: "Xóa vai trò admin" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Xóa vai trò operator" })).toBeEnabled();
  });
});
