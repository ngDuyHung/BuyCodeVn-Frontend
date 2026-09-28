import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PresentationSlide } from "@/types/presentation";
import HeroSection from "./HeroSection";

const slide = (id: number, title: string): PresentationSlide => ({
  id, placement: "home_hero", eyebrow: "Dịch vụ", title, description: "Mô tả slide",
  desktop_image_url: `/hero-${id}.webp`, mobile_image_url: `/hero-${id}-mobile.webp`, image_alt: title,
  primary_cta: { label: "Xem ngay", url: "/source-code" }, secondary_cta: null,
  highlights: [{ icon: "fa-award", label: "Chất lượng đảm bảo" }],
  layout: "split", content_alignment: "left", theme: "light", overlay_opacity: 20,
});

describe("HeroSection", () => {
  beforeEach(() => vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({ matches: true })));

  it("renders the built-in fallback when no configured slide exists", () => {
    render(<HeroSection slides={[]} />);
    expect(screen.getByRole("heading", { name: "BUYCODE.VN" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Slide tiếp theo" })).not.toBeInTheDocument();
  });

  it("switches configured slides with accessible controls", () => {
    render(<HeroSection slides={[slide(1, "Slide một"), slide(2, "Slide hai")]} />);
    expect(screen.getByRole("heading", { name: "Slide một" })).toBeInTheDocument();
    expect(screen.getByText("Chất lượng đảm bảo")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Slide tiếp theo" }));
    expect(screen.getByRole("heading", { name: "Slide hai" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Xem ngay/ })).toHaveAttribute("href", "/source-code");
  });
});
