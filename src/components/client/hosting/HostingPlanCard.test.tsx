import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { HostingPlan } from "@/types/services";
import HostingPlanCard from "./HostingPlanCard";

const plan: HostingPlan = {
  id: 1,
  name: "Hosting Giá Rẻ",
  disk_quota: 1024,
  bandwidth_limit_mb: 10240,
  memory_limit_mb: 512,
  max_databases: 5,
  max_addon_domains: 2,
  custom_features: { backup: "Hàng ngày" },
  price_per_month: "20000.00",
};

describe("HostingPlanCard", () => {
  it("renders public plan data and links to the selected plan", () => {
    render(<HostingPlanCard plan={plan} />);

    expect(screen.getByRole("heading", { name: plan.name })).toBeInTheDocument();
    expect(screen.getByText("1 GB lưu trữ")).toBeInTheDocument();
    expect(screen.getByText("10.240 MB băng thông")).toBeInTheDocument();
    expect(screen.getByText("512 MB RAM")).toBeInTheDocument();
    expect(screen.getByText(/backup:/)).toBeInTheDocument();
    expect(screen.getByText(/20\.000/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Đăng ký ngay" })).toHaveAttribute(
      "href",
      "/hosting?plan=1",
    );
  });

  it("selects the plan directly in the storefront", () => {
    const onSelect = vi.fn();
    render(<HostingPlanCard plan={plan} onSelect={onSelect} />);

    fireEvent.click(screen.getByRole("button", { name: "Đăng ký ngay" }));

    expect(onSelect).toHaveBeenCalledWith(plan);
  });

  it("renders zero disk quota as unlimited", () => {
    render(<HostingPlanCard plan={{ ...plan, disk_quota: 0 }} />);
    expect(screen.getByText("Không giới hạn lưu trữ")).toBeInTheDocument();
  });
});
