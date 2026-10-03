import { describe, expect, it } from "vitest";
import { DEFAULT_SITE_SETTINGS } from "@/types/site-settings";
import { getSiteThemeStyle } from "./site-theme";

describe("getSiteThemeStyle", () => {
  it("maps configured brand colors to global design tokens", () => {
    expect(getSiteThemeStyle({
      ...DEFAULT_SITE_SETTINGS,
      site_primary_color: "#126b67",
      site_secondary_color: "#173b51",
      site_accent_color: "#f4a340",
    })).toMatchObject({
      "--color-blue-primary": "#126b67",
      "--color-blue-nav": "#173b51",
      "--color-blue-dark": "#173b51",
      "--color-orange-main": "#f4a340",
    });
  });

  it("rejects unsafe color values from public settings", () => {
    expect(getSiteThemeStyle({
      ...DEFAULT_SITE_SETTINGS,
      site_primary_color: "red; display:none",
    })["--color-blue-primary"]).toBe(DEFAULT_SITE_SETTINGS.site_primary_color);
  });
});
