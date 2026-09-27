import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { adminService } from "@/services/admin/adminService";
import { useAuthStore } from "@/stores/authStore";
import AdminUserDirectory from "./AdminUserDirectory";

vi.mock("next/navigation", () => ({ usePathname: () => "/admin/users", useRouter: () => ({ replace: vi.fn() }), useSearchParams: () => new URLSearchParams() }));
vi.mock("react-toastify", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock("@/services/admin/adminService", () => ({ adminService: { getUsers: vi.fn(), getRoles: vi.fn(), getUser: vi.fn(), createUser: vi.fn(), updateUser: vi.fn(), updateUserStatus: vi.fn(), syncUserRoles: vi.fn(), deleteUser: vi.fn() } }));

const self = { id: 1, name: "Admin", email: "admin@test.vn", is_active: true, roles: ["admin"], permissions: [], created_at: "2026-09-27T00:00:00Z" };
const target = { id: 2, name: "Customer", email: "customer@test.vn", is_active: true, roles: ["customer"], permissions: [], created_at: "2026-09-27T00:00:00Z" };
const page = { success: true as const, message: null, data: [self, target], links: { first: null, last: null, prev: null, next: null }, meta: { current_page: 1, from: 1, last_page: 1, path: "", per_page: 15, to: 2, total: 2 } };

describe("AdminUserDirectory", () => {
  beforeEach(() => { vi.clearAllMocks(); useAuthStore.setState({ user: self }); vi.mocked(adminService.getUsers).mockResolvedValue(page); vi.mocked(adminService.getRoles).mockResolvedValue([]); vi.mocked(adminService.updateUserStatus).mockResolvedValue({ ...target, is_active: false }); });

  it("hides self destructive actions and confirms target deactivation", async () => {
    render(<AdminUserDirectory />);
    await screen.findByText("customer@test.vn");
    expect(screen.getByRole("button", { name: "Lịch sử giao dịch người dùng 2" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Khóa người dùng 1" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Xóa người dùng 1" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Khóa người dùng 2" }));
    expect(screen.getByText(/thu hồi/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Khóa tài khoản" }));
    await waitFor(() => expect(adminService.updateUserStatus).toHaveBeenCalledWith(2, false));
  });
});
