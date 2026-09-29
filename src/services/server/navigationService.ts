import { cache } from "react";
import { getServerApiBaseUrl, PUBLIC_DATA_REVALIDATE_SECONDS, SERVER_API_TIMEOUT_MS } from "@/config/server-runtime";
import type { ApiResource } from "@/types/api";
import type { NavigationMenus } from "@/types/navigation";

export const getNavigationMenus = cache(async (): Promise<NavigationMenus | null> => {
  try {
    const response = await fetch(`${getServerApiBaseUrl()}/v1/navigation-menus`, {
      headers: { Accept: "application/json" },
      next: { revalidate: PUBLIC_DATA_REVALIDATE_SECONDS, tags: ["public-navigation"] },
      signal: AbortSignal.timeout(SERVER_API_TIMEOUT_MS),
    });
    if (!response.ok) return null;
    return ((await response.json()) as ApiResource<NavigationMenus>).data;
  } catch {
    return null;
  }
});
