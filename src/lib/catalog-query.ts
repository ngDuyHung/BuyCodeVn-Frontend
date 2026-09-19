import {
  PRODUCT_TYPES,
  type CatalogQuery,
  type CatalogSearchParams,
  type ProductType,
} from "@/types/catalog";

const firstValue = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

const positiveInteger = (value: string | undefined) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
};

const isProductType = (value: string | undefined): value is ProductType =>
  Boolean(value && PRODUCT_TYPES.includes(value as ProductType));

export const parseCatalogQuery = (
  searchParams: CatalogSearchParams,
): CatalogQuery => {
  const search = firstValue(searchParams.search)?.trim();
  const categoryId = positiveInteger(firstValue(searchParams.category_id));
  const type = firstValue(searchParams.type);
  const page = positiveInteger(firstValue(searchParams.page));

  return {
    per_page: 15,
    ...(search ? { search } : {}),
    ...(categoryId ? { category_id: categoryId } : {}),
    ...(isProductType(type) ? { type } : {}),
    ...(page && page > 1 ? { page } : {}),
  };
};

export const toCatalogSearchParams = (query: CatalogQuery) => {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set("search", query.search.trim());
  if (query.category_id) params.set("category_id", String(query.category_id));
  if (query.type) params.set("type", query.type);
  if (query.page && query.page > 1) params.set("page", String(query.page));
  return params;
};
