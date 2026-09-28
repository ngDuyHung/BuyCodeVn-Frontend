import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { adminPresentationService } from "@/services/admin/adminPresentationService";
import { useAuthStore } from "@/stores/authStore";
import type { AdminPresentationSlide } from "@/types/presentation";
import AdminPresentationDirectory from "./AdminPresentationDirectory";

vi.mock("react-toastify", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock("@/services/admin/adminPresentationService", () => ({ adminPresentationService: {
  getSlides: vi.fn(), createSlide: vi.fn(), updateSlide: vi.fn(), deleteSlide: vi.fn(), reorderSlides: vi.fn(),
} }));

const slides: AdminPresentationSlide[] = [
  { id: 1, placement: "home_hero", internal_name: "Hero chính", eyebrow: "Uy tín", title: "BUYCODE", description: null, desktop_image_url: "/one.webp", mobile_image_url: null, image_alt: "Hero", primary_cta: null, secondary_cta: null, highlights: [{ icon: "fa-award", label: "Chất lượng đảm bảo" }], layout: "split", content_alignment: "left", theme: "light", overlay_opacity: 20, sort_order: 10, is_active: true, starts_at: null, ends_at: null, created_at: "2026-09-28T00:00:00Z", updated_at: "2026-09-28T00:00:00Z" },
  { id: 2, placement: "home_hero", internal_name: "Hero phụ", eyebrow: null, title: "Hosting", description: null, desktop_image_url: "/two.webp", mobile_image_url: null, image_alt: "Hosting", primary_cta: null, secondary_cta: null, highlights: [], layout: "cover", content_alignment: "center", theme: "dark", overlay_opacity: 40, sort_order: 20, is_active: false, starts_at: null, ends_at: null, created_at: "2026-09-28T00:00:00Z", updated_at: "2026-09-28T00:00:00Z" },
];

const response = { success: true as const, message: null, data: slides, links: { first: null, last: null, prev: null, next: null }, meta: { current_page: 1, from: 1, last_page: 1, path: "", per_page: 100, to: 2, total: 2 } };

describe("AdminPresentationDirectory", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(adminPresentationService.getSlides).mockResolvedValue(response);
    vi.mocked(adminPresentationService.reorderSlides).mockResolvedValue(undefined);
    useAuthStore.setState({ user: { id: 1, name: "Admin", email: "admin@example.com", is_active: true, roles: ["admin"], permissions: [] } });
  });

  it("lists slides and lets a manager reorder them", async () => {
    render(<AdminPresentationDirectory />);
    await screen.findByText("Hero chính");
    fireEvent.click(screen.getByRole("button", { name: "Đưa Hero phụ lên" }));
    await waitFor(() => expect(adminPresentationService.reorderSlides).toHaveBeenCalledWith([
      { id: 2, sort_order: 10 }, { id: 1, sort_order: 20 },
    ]));
  });

  it("keeps write controls hidden for settings viewers", async () => {
    useAuthStore.setState({ user: { id: 2, name: "Viewer", email: "viewer@example.com", is_active: true, roles: ["staff"], permissions: ["settings.view"] } });
    render(<AdminPresentationDirectory />);
    await screen.findByText("Hero chính");
    expect(screen.queryByRole("button", { name: "Thêm slide" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Chỉnh sửa Hero chính" })).not.toBeInTheDocument();
  });

  it("updates the real hero preview while editing", async () => {
    render(<AdminPresentationDirectory />);
    await screen.findByText("Hero chính");
    fireEvent.click(screen.getByRole("button", { name: "Chỉnh sửa Hero chính" }));
    const titleInput = screen.getByLabelText("Tiêu đề");
    fireEvent.change(titleInput, { target: { value: "Hero xem trước" } });
    expect(screen.getByRole("heading", { name: "Hero xem trước" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Xem trước nội dung nổi bật" })).toBeInTheDocument();
  });
});
