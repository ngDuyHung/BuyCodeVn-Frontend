import { cache } from "react";
import { getApiBaseUrl } from "@/config/env";
import type { ApiResource } from "@/types/api";
import type { NavigationMenus } from "@/types/navigation";

export const getNavigationMenus = cache(async (): Promise<NavigationMenus | null> => {
  try {
    const response = await fetch(`${getApiBaseUrl()}/v1/navigation-menus`, {
      headers: { Accept: "application/json" }, next: { revalidate: 60 }, signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) return null;
    return ((await response.json()) as ApiResource<NavigationMenus>).data;
  } catch {
    return null;
  }
});
