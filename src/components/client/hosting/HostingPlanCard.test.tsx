import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { HostingPlan } from "@/types/services";
import HostingPlanCard from "./HostingPlanCard";

const plan: HostingPlan = {
  id: 1,
  name: "Hosting Giá Rẻ",
  disk_quota: 1024,
  price_per_month: "20000.00",
};

describe("HostingPlanCard", () => {
  it("renders public plan data and links to the selected plan", () => {
    render(<HostingPlanCard plan={plan} />);

    expect(screen.getByRole("heading", { name: plan.name })).toBeInTheDocument();
    expect(screen.getByText("1 GB lưu trữ")).toBeInTheDocument();
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
});
