import { cache } from "react";
import { getApiBaseUrl } from "@/config/env";
import type { ApiResource } from "@/types/api";
import type { Product } from "@/types/catalog";

export const getPublicProduct = cache(async (idOrSlug: string) => {
  const response = await fetch(
    `${getApiBaseUrl()}/v1/catalog/products/${encodeURIComponent(idOrSlug)}`,
    {
      headers: { Accept: "application/json" },
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(10000),
    },
  );

  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`Không thể tải sản phẩm (HTTP ${response.status}).`);
  }

  const payload = (await response.json()) as ApiResource<Product>;
  return payload.data;
});
