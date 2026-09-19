import api from "../api";
import type { ApiResource, PaginatedResponse } from "@/types/api";
import type { CatalogQuery, Category, Product } from "@/types/catalog";

export const catalogService = {
  getCategories: async (signal?: AbortSignal) => {
    const response = await api.get<ApiResource<Category[]>>(
      "/v1/catalog/categories",
      { signal, suppressErrorToast: true },
    );
    return response.data.data;
  },

  getProducts: async (params: CatalogQuery = {}, signal?: AbortSignal) => {
    const response = await api.get<PaginatedResponse<Product>>(
      "/v1/catalog/products",
      { params, signal, suppressErrorToast: true },
    );
    return response.data;
  },

  getProduct: async (idOrSlug: number | string, signal?: AbortSignal) => {
    const response = await api.get<ApiResource<Product>>(
      `/v1/catalog/products/${encodeURIComponent(idOrSlug)}`,
      { signal, suppressErrorToast: true },
    );
    return response.data.data;
  },
};
