import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { adminNavigationService } from "@/services/admin/adminNavigationService";
import { useAuthStore } from "@/stores/authStore";
import type { AdminNavigationItem } from "@/types/navigation";
import AdminNavigationDirectory from "./AdminNavigationDirectory";

vi.mock("react-toastify", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock("@/services/admin/adminNavigationService", () => ({ adminNavigationService: { getItems: vi.fn(), createItem: vi.fn(), updateItem: vi.fn(), deleteItem: vi.fn(), reorderItems: vi.fn() } }));

const base = { icon: null, target: "_self" as const, is_active: true, created_at: "", updated_at: "", children: [] };
const items: AdminNavigationItem[] = [
  { ...base, id: 1, placement: "header", parent_id: null, label: "Sản phẩm", url: null, sort_order: 10 },
  { ...base, id: 2, placement: "header", parent_id: 1, label: "Hosting", url: "/hosting", sort_order: 10 },
  { ...base, id: 3, placement: "header", parent_id: 1, label: "VPS", url: "/vps", sort_order: 20 },
];

describe("AdminNavigationDirectory", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(adminNavigationService.getItems).mockResolvedValue(items);
    vi.mocked(adminNavigationService.reorderItems).mockResolvedValue({} as never);
    useAuthStore.setState({ user: { id: 1, name: "Admin", email: "admin@example.com", is_active: true, roles: ["admin"], permissions: [] } });
  });

  it("renders hierarchy and reorders only siblings", async () => {
    render(<AdminNavigationDirectory />);
    await screen.findByText("Hosting");
    fireEvent.click(screen.getByRole("button", { name: "Đưa VPS lên" }));
    await waitFor(() => expect(adminNavigationService.reorderItems).toHaveBeenCalledWith([{ id: 3, sort_order: 10 }, { id: 2, sort_order: 20 }]));
  });

  it("hides mutations from a settings viewer", async () => {
    useAuthStore.setState({ user: { id: 2, name: "Viewer", email: "v@example.com", is_active: true, roles: ["staff"], permissions: ["settings.view"] } });
    render(<AdminNavigationDirectory />);
    await screen.findByText("Hosting");
    expect(screen.queryByRole("button", { name: "Thêm mục menu" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Chỉnh sửa Hosting" })).not.toBeInTheDocument();
  });
});
