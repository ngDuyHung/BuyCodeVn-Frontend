import type { CSSProperties } from "react";
import { DEFAULT_SITE_SETTINGS, type SiteSettings } from "@/types/site-settings";

type SiteThemeStyle = CSSProperties & Record<`--${string}`, string>;

const HEX_COLOR_PATTERN = /^#[0-9a-f]{6}$/i;

const safeColor = (value: string, fallback: string) =>
  HEX_COLOR_PATTERN.test(value) ? value : fallback;

export const getSiteThemeStyle = (settings: SiteSettings): SiteThemeStyle => ({
  "--color-blue-primary": safeColor(settings.site_primary_color, DEFAULT_SITE_SETTINGS.site_primary_color),
  "--color-blue-nav": safeColor(settings.site_secondary_color, DEFAULT_SITE_SETTINGS.site_secondary_color),
  "--color-blue-dark": safeColor(settings.site_secondary_color, DEFAULT_SITE_SETTINGS.site_secondary_color),
  "--color-orange-main": safeColor(settings.site_accent_color, DEFAULT_SITE_SETTINGS.site_accent_color),
});
