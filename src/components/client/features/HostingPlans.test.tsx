import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useHostingPlans } from "@/hooks/client/useHostingPlans";
import type { HostingPlan } from "@/types/services";
import HostingPlans from "./HostingPlans";

vi.mock("@/hooks/client/useHostingPlans", () => ({ useHostingPlans: vi.fn() }));

const plans: HostingPlan[] = Array.from({ length: 6 }, (_, index) => ({
  id: index + 1,
  name: `Hosting ${index + 1}`,
  disk_quota: 1024,
  bandwidth_limit_mb: 10240,
  memory_limit_mb: 512,
  max_databases: 5,
  max_addon_domains: 2,
  price_per_month: "20000.00",
}));

describe("HostingPlans", () => {
  it("renders the infrastructure banner and at most four plans", () => {
    vi.mocked(useHostingPlans).mockReturnValue({ plans, meta: null, isLoading: false, error: null, retry: vi.fn() });

    render(<HostingPlans />);

    expect(useHostingPlans).toHaveBeenCalledWith({ per_page: 4 });
    expect(screen.getByRole("img", { name: "Hạ tầng máy chủ hosting hiện đại" })).toBeInTheDocument();
    expect(screen.getAllByRole("article")).toHaveLength(4);
    expect(screen.queryByText("Hosting 5")).not.toBeInTheDocument();
  });
});
