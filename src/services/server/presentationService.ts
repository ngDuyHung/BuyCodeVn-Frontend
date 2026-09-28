import { cache } from "react";
import { getApiBaseUrl } from "@/config/env";
import type { ApiResource } from "@/types/api";
import type { PresentationSlide } from "@/types/presentation";

export const getHomePresentationSlides = cache(async (): Promise<PresentationSlide[]> => {
  try {
    const response = await fetch(`${getApiBaseUrl()}/v1/presentation-slides?placement=home_hero`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) return [];
    const payload = (await response.json()) as ApiResource<PresentationSlide[]>;
    return payload.data;
  } catch {
    return [];
  }
});
