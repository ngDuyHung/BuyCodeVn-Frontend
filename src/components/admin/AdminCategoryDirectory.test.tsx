import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { toast } from "react-toastify";
import { ApiError } from "@/lib/api-error";
import { adminCatalogService } from "@/services/admin/adminCatalogService";
import { useAuthStore } from "@/stores/authStore";
import AdminCategoryDirectory from "./AdminCategoryDirectory";

vi.mock("react-toastify", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock("@/services/admin/adminCatalogService", () => ({ adminCatalogService: { getCategories: vi.fn(), createCategory: vi.fn(), updateCategory: vi.fn(), deleteCategory: vi.fn() } }));

describe("AdminCategoryDirectory", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({ user: { id: 1, name: "Admin", email: "admin@example.com", is_active: true, roles: ["admin"], permissions: [] } });
    vi.mocked(adminCatalogService.getCategories).mockResolvedValue([{ id: 1, parent_id: null, name: "Source", slug: "source", is_active: true, children: [], created_at: "", updated_at: "" }]);
  });

  it("keeps the category visible when backend rejects dependency deletion", async () => {
    vi.mocked(adminCatalogService.deleteCategory).mockRejectedValue(new ApiError("Danh mục đang có sản phẩm.", { status: 409 }));
    render(<AdminCategoryDirectory />);
    await screen.findByText("Source");
    fireEvent.click(screen.getByRole("button", { name: "Xóa Source" }));
    fireEvent.click(screen.getByRole("button", { name: "Xóa danh mục" }));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Danh mục đang có sản phẩm."));
    expect(screen.getByText("Source")).toBeInTheDocument();
  });
});
