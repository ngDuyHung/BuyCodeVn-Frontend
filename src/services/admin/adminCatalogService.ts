import api from "@/services/api";
import type { ApiResource, PaginatedResponse } from "@/types/api";
import type { Category, CategoryWritePayload, Product, ProductType, ProductWritePayload } from "@/types/catalog";

export interface AdminProductQuery {
  page?: number;
  per_page?: number;
  search?: string;
  category_id?: number;
  type?: ProductType;
  is_active?: 0 | 1;
}

const readOptions = (signal?: AbortSignal) => ({ signal, suppressErrorToast: true });
const writeOptions = { suppressErrorToast: true };

export const adminCatalogService = {
  getCategories: async (signal?: AbortSignal) => {
    const response = await api.get<ApiResource<Category[]>>("/v1/admin/catalog/categories", readOptions(signal));
    return response.data.data;
  },
  createCategory: async (payload: CategoryWritePayload) => {
    const response = await api.post<ApiResource<Category>>("/v1/catalog/categories", payload, writeOptions);
    return response.data.data;
  },
  updateCategory: async (id: number, payload: Partial<CategoryWritePayload>) => {
    const response = await api.put<ApiResource<Category>>(`/v1/catalog/categories/${id}`, payload, writeOptions);
    return response.data.data;
  },
  deleteCategory: async (id: number) => {
    await api.delete(`/v1/catalog/categories/${id}`, writeOptions);
  },
  getProducts: async (query: AdminProductQuery = {}, signal?: AbortSignal) => {
    const response = await api.get<PaginatedResponse<Product>>("/v1/admin/catalog/products", {
      ...readOptions(signal), params: query,
    });
    return response.data;
  },
  createProduct: async (payload: ProductWritePayload) => {
    const response = await api.post<ApiResource<Product>>("/v1/catalog/products", payload, writeOptions);
    return response.data.data;
  },
  updateProduct: async (id: number, payload: Partial<ProductWritePayload>) => {
    const response = await api.put<ApiResource<Product>>(`/v1/catalog/products/${id}`, payload, writeOptions);
    return response.data.data;
  },
  deleteProduct: async (id: number) => {
    await api.delete(`/v1/catalog/products/${id}`, writeOptions);
  },
};
