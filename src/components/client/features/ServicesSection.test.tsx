import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ServicesSection from "./ServicesSection";

describe("ServicesSection", () => {
  it("renders four compact service cards and their available routes", () => {
    render(<ServicesSection />);
    expect(screen.getAllByRole("article")).toHaveLength(4);
    expect(screen.getByRole("link", { name: /Xem mã nguồn/ })).toHaveAttribute("href", "/source-code");
    expect(screen.getByRole("link", { name: /Xem hosting/ })).toHaveAttribute("href", "/hosting");
    expect(screen.getByRole("link", { name: /Xem gói VPS/ })).toHaveAttribute("href", "/vps");
  });
});
