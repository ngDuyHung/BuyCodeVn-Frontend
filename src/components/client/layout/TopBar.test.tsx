import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DEFAULT_SITE_SETTINGS } from "@/types/site-settings";
import TopBar from "./TopBar";

describe("TopBar", () => {
  it("prefers the configured hotline", () => {
    render(<TopBar settings={{ ...DEFAULT_SITE_SETTINGS, site_hotline: "0900 123 456" }} />);
    expect(screen.getByRole("link", { name: /Hotline: 0900 123 456/ })).toHaveAttribute("href", "tel:0900123456");
  });
});
