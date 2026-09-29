import { cache } from "react";
import { getServerApiBaseUrl, PUBLIC_DATA_REVALIDATE_SECONDS, SERVER_API_TIMEOUT_MS } from "@/config/server-runtime";
import type { ApiResource } from "@/types/api";
import { DEFAULT_SITE_SETTINGS, type SiteSettings } from "@/types/site-settings";

export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  try {
    const response = await fetch(`${getServerApiBaseUrl()}/v1/site-settings`, {
      headers: { Accept: "application/json" },
      next: { revalidate: PUBLIC_DATA_REVALIDATE_SECONDS, tags: ["public-site-settings"] },
      signal: AbortSignal.timeout(SERVER_API_TIMEOUT_MS),
    });
    if (!response.ok) return DEFAULT_SITE_SETTINGS;
    return { ...DEFAULT_SITE_SETTINGS, ...((await response.json()) as ApiResource<SiteSettings>).data };
  } catch {
    return DEFAULT_SITE_SETTINGS;
  }
});
