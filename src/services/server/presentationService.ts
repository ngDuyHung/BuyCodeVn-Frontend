import { cache } from "react";
import { getServerApiBaseUrl, PUBLIC_DATA_REVALIDATE_SECONDS, SERVER_API_TIMEOUT_MS } from "@/config/server-runtime";
import type { ApiResource } from "@/types/api";
import type { PresentationSlide } from "@/types/presentation";

export const getHomePresentationSlides = cache(async (): Promise<PresentationSlide[]> => {
  try {
    const response = await fetch(`${getServerApiBaseUrl()}/v1/presentation-slides?placement=home_hero`, {
      headers: { Accept: "application/json" },
      next: { revalidate: PUBLIC_DATA_REVALIDATE_SECONDS, tags: ["public-presentation"] },
      signal: AbortSignal.timeout(SERVER_API_TIMEOUT_MS),
    });
    if (!response.ok) return [];
    const payload = (await response.json()) as ApiResource<PresentationSlide[]>;
    return payload.data;
  } catch {
    return [];
  }
});
