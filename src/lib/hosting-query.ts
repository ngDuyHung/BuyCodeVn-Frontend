import type { ServiceListQuery } from "@/types/services";

const positiveInteger = (value: string | null) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
};

const validCategory = (value: string | null) => {
  const normalized = value?.trim();
  return normalized && /^[a-z0-9-]+$/i.test(normalized) ? normalized : undefined;
};

export const parseHostingQuery = (searchParams: URLSearchParams): ServiceListQuery => {
  const serverCategory = validCategory(searchParams.get("server_category"));
  const page = positiveInteger(searchParams.get("page"));

  return {
    per_page: 12,
    ...(serverCategory ? { server_category: serverCategory } : {}),
    ...(page && page > 1 ? { page } : {}),
  };
};

export const toHostingSearchParams = (
  query: ServiceListQuery,
  planId?: number,
) => {
  const params = new URLSearchParams();
  if (query.server_category) {
    params.set("server_category", String(query.server_category));
  }
  if (query.page && query.page > 1) params.set("page", String(query.page));
  if (planId && Number.isInteger(planId) && planId > 0) {
    params.set("plan", String(planId));
  }
  return params;
};
