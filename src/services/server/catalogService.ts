import { cache } from "react";
import { getServerApiBaseUrl, PUBLIC_DATA_REVALIDATE_SECONDS, SERVER_API_TIMEOUT_MS } from "@/config/server-runtime";
import type { ApiResource } from "@/types/api";
import type { Product } from "@/types/catalog";

export const getPublicProduct = cache(async (idOrSlug: string) => {
  const response = await fetch(
    `${getServerApiBaseUrl()}/v1/catalog/products/${encodeURIComponent(idOrSlug)}`,
    {
      headers: { Accept: "application/json" },
      next: { revalidate: PUBLIC_DATA_REVALIDATE_SECONDS, tags: ["public-catalog"] },
      signal: AbortSignal.timeout(SERVER_API_TIMEOUT_MS),
    },
  );

  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`Không thể tải sản phẩm (HTTP ${response.status}).`);
  }

  const payload = (await response.json()) as ApiResource<Product>;
  return payload.data;
});
