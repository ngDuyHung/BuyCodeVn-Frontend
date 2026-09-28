import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { vpsService } from "@/services/client/vpsService";
import type { VpsPlan } from "@/types/services";
import HomeVpsPlans from "./HomeVpsPlans";

vi.mock("@/services/client/vpsService", () => ({
  vpsService: { getPlans: vi.fn() },
}));

const plan: VpsPlan = {
  id: 1,
  slug: "cloud-2gb",
  name: "Cloud 2GB",
  group_name: "Cloud KVM",
  cpu: 2,
  ram_mb: 2048,
  disk_gb: 40,
  bandwidth: "Không giới hạn",
  ip_description: "1 IPv4",
  pricing: { monthly: { amount: "100000.00" } },
  locations: [{ id: 2, slug: "hcm", code: "HCM", name: "Hồ Chí Minh", surcharge: "10000.00" }],
};

describe("HomeVpsPlans", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(vpsService.getPlans).mockResolvedValue([
      plan,
      { ...plan, id: 2, name: "Cloud 4GB" },
      { ...plan, id: 3, name: "Cloud 8GB" },
      { ...plan, id: 4, name: "Cloud 16GB" },
    ]);
  });

  it("shows three public plans with responsive specs and location-inclusive pricing", async () => {
    render(<HomeVpsPlans />);

    expect(await screen.findByText("Cloud 2GB")).toBeInTheDocument();
    expect(screen.getByText("Cloud 4GB")).toBeInTheDocument();
    expect(screen.getByText("Cloud 8GB")).toBeInTheDocument();
    expect(screen.queryByText("Cloud 16GB")).not.toBeInTheDocument();
    expect(screen.getAllByText("110.000đ")).toHaveLength(3);
    expect(screen.getAllByText("2 GB")).toHaveLength(3);
    expect(screen.getByRole("link", { name: /Xem tất cả cấu hình/i })).toHaveAttribute("href", "/vps");
  });
});
