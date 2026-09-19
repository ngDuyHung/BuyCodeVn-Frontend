import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import HostingStorefront from "./HostingStorefront";

const mocks = vi.hoisted(() => ({
  query: "",
  replace: vi.fn(),
  useHostingPlans: vi.fn(),
  useServerCategories: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/hosting",
  useRouter: () => ({ replace: mocks.replace }),
  useSearchParams: () => new URLSearchParams(mocks.query),
}));

vi.mock("@/hooks/client/useHostingPlans", () => ({
  useHostingPlans: mocks.useHostingPlans,
}));

vi.mock("@/hooks/client/useServerCategories", () => ({
  useServerCategories: mocks.useServerCategories,
}));

vi.mock("./HostingCheckout", () => ({ default: () => null }));
vi.mock("./HostingPlanCard", () => ({
  default: ({ plan }: { plan: { name: string } }) => <div>{plan.name}</div>,
}));

const paginationMeta = {
  current_page: 1,
  from: 1,
  last_page: 3,
  path: "/api/v1/services/hosting-plans",
  per_page: 12,
  to: 1,
  total: 25,
};

describe("HostingStorefront", () => {
  beforeEach(() => {
    mocks.query = "";
    mocks.replace.mockReset();
    mocks.useHostingPlans.mockReturnValue({
      plans: [
        {
          id: 1,
          name: "Hosting Giá Rẻ",
          disk_quota: 1024,
          price_per_month: "20000.00",
        },
      ],
      meta: paginationMeta,
      isLoading: false,
      error: null,
      retry: vi.fn(),
    });
    mocks.useServerCategories.mockReturnValue({
      categories: [
        { id: 1, slug: "server-01", name: "Server 01" },
        { id: 2, slug: "vietnam-premium", name: "Vietnam Premium" },
      ],
      isLoading: false,
      error: null,
      retry: vi.fn(),
    });
    vi.stubGlobal("scrollTo", vi.fn());
  });

  it("filters plans by category and shares filter pagination in the URL", async () => {
    render(<HostingStorefront />);

    fireEvent.change(screen.getByLabelText("Danh mục server"), {
      target: { value: "server-01" },
    });

    await waitFor(() => {
      expect(mocks.useHostingPlans).toHaveBeenLastCalledWith({
        page: 1,
        per_page: 12,
        server_category: "server-01",
      });
      expect(mocks.replace).toHaveBeenCalledWith(
        "/hosting?server_category=server-01",
        { scroll: false },
      );
    });

    fireEvent.click(screen.getByRole("button", { name: "2" }));

    await waitFor(() => {
      expect(mocks.replace).toHaveBeenCalledWith(
        "/hosting?server_category=server-01&page=2",
        { scroll: false },
      );
    });
  });

  it("clears a category slug that is not in the public category list", async () => {
    mocks.query = "server_category=unknown-server";

    render(<HostingStorefront />);

    await waitFor(() => {
      expect(mocks.useHostingPlans).toHaveBeenLastCalledWith({
        page: 1,
        per_page: 12,
        server_category: undefined,
      });
      expect(mocks.replace).toHaveBeenCalledWith("/hosting", { scroll: false });
    });
  });
});
