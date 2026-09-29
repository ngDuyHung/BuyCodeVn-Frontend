import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { VpsPlan } from "@/types/services";
import VpsPlanCard from "./VpsPlanCard";

const plan: VpsPlan = {
  id: 1, slug: "cloud-2gb", name: "Cloud 2GB", group_name: "Cloud KVM",
  cpu: 2, ram_mb: 2048, disk_gb: 40, bandwidth: "Không giới hạn", ip_description: "1 IPv4",
  pricing: { monthly: { amount: "100000.00" } },
  locations: [{ id: 2, slug: "hcm", code: "HCM", name: "Hồ Chí Minh", surcharge: "10000.00" }],
};

describe("VpsPlanCard", () => {
  it("shows compact specifications and location-inclusive pricing", () => {
    render(<VpsPlanCard plan={plan} actionHref="/vps" actionLabel="Chọn cấu hình" />);
    expect(screen.getByText("2 vCPU")).toBeInTheDocument();
    expect(screen.getByText("2 GB")).toBeInTheDocument();
    expect(screen.getByText("110.000đ")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Chọn cấu hình/ })).toHaveAttribute("href", "/vps");
  });

  it("runs the storefront action", () => {
    const onAction = vi.fn();
    render(<VpsPlanCard plan={plan} actionLabel="Đăng ký VPS" onAction={onAction} />);
    fireEvent.click(screen.getByRole("button", { name: /Đăng ký VPS/ }));
    expect(onAction).toHaveBeenCalledOnce();
  });
});
