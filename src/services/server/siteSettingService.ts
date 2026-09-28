import { cache } from "react";
import { getApiBaseUrl } from "@/config/env";
import type { ApiResource } from "@/types/api";
import { DEFAULT_SITE_SETTINGS, type SiteSettings } from "@/types/site-settings";

export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  try {
    const response = await fetch(`${getApiBaseUrl()}/v1/site-settings`, {
      headers: { Accept: "application/json" }, cache: "no-store", signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) return DEFAULT_SITE_SETTINGS;
    return { ...DEFAULT_SITE_SETTINGS, ...((await response.json()) as ApiResource<SiteSettings>).data };
  } catch {
    return DEFAULT_SITE_SETTINGS;
  }
});
