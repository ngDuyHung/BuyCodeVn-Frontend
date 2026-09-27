import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { adminOperationsService } from "@/services/admin/adminOperationsService";
import { useAuthStore } from "@/stores/authStore";
import AdminServiceOperations from "./AdminServiceOperations";

vi.mock("next/navigation", () => ({ usePathname: () => "/admin/services", useRouter: () => ({ replace: vi.fn() }), useSearchParams: () => new URLSearchParams() }));
vi.mock("react-toastify", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock("@/services/admin/adminOperationsService", () => ({ adminOperationsService: { getServices: vi.fn(), getService: vi.fn(), approveDomain: vi.fn(), activateHosting: vi.fn() } }));

const service = { id: 7, service_type: "domain" as const, status: "active" as const, domain_name: "example.vn", expires_at: "2027-09-27T00:00:00Z", created_at: "2026-09-27T00:00:00Z", user: { id: 2, name: "Customer", email: "customer@test.vn", is_active: true }, pending_renewal: { id: 9, status: "pending", years: 2, order_id: 10 }, actions: { can_renew: false, can_change_password: false, can_view_credentials: false, can_approve_domain: true, can_activate_hosting: false } };
const response = { success: true as const, message: null, data: [service], links: { first: null, last: null, prev: null, next: null }, meta: { current_page: 1, from: 1, last_page: 1, path: "", per_page: 15, to: 1, total: 1 } };

describe("AdminServiceOperations", () => {
  beforeEach(() => { vi.clearAllMocks(); useAuthStore.setState({ user: { id: 1, name: "Admin", email: "admin@test.vn", is_active: true, roles: ["admin"], permissions: [] } }); vi.mocked(adminOperationsService.getServices).mockResolvedValue(response); vi.mocked(adminOperationsService.approveDomain).mockResolvedValue({ service_id: 7, order_id: 10, domain: "example.vn", operation: "renewal", renewal_id: 9, expires_at: "2029-09-27T00:00:00Z", idempotent: false }); });

  it("confirms and approves a pending domain renewal once", async () => {
    render(<AdminServiceOperations />);
    await screen.findByText("example.vn");
    fireEvent.click(screen.getByRole("button", { name: "Duyệt tên miền example.vn" }));
    expect(screen.getByRole("heading", { name: "Duyệt gia hạn tên miền" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Duyệt gia hạn" }));
    await waitFor(() => expect(adminOperationsService.approveDomain).toHaveBeenCalledTimes(1));
  });
});
