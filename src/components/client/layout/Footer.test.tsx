import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Footer from "./Footer";

describe("Footer", () => {
  it("renders dynamic link groups", () => {
    render(<Footer items={[{
      id: 1, label: "Hạ tầng", url: null, icon: null, target: "_self",
      children: [{ id: 2, label: "Cloud VPS", url: "/vps", icon: "fa-cloud", target: "_self", children: [] }],
    }]} />);
    expect(screen.getByRole("heading", { name: "Hạ tầng" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Cloud VPS" })).toHaveAttribute("href", "/vps");
  });
});
