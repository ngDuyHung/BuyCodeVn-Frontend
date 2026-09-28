import api from "@/services/api";
import type { ApiResource } from "@/types/api";
import type { AdminNavigationItem, NavigationItemPayload, NavigationPlacement } from "@/types/navigation";

const options = { suppressErrorToast: true };

export const adminNavigationService = {
  getItems: async (query: { placement?: NavigationPlacement; is_active?: 0 | 1; search?: string } = {}, signal?: AbortSignal) => {
    const response = await api.get<ApiResource<AdminNavigationItem[]>>("/v1/admin/navigation-items", { ...options, signal, params: query });
    return response.data.data;
  },
  createItem: async (payload: NavigationItemPayload) => {
    const response = await api.post<ApiResource<AdminNavigationItem>>("/v1/admin/navigation-items", payload, options);
    return response.data.data;
  },
  updateItem: async (id: number, payload: NavigationItemPayload) => {
    const response = await api.put<ApiResource<AdminNavigationItem>>(`/v1/admin/navigation-items/${id}`, payload, options);
    return response.data.data;
  },
  deleteItem: async (id: number) => api.delete(`/v1/admin/navigation-items/${id}`, options),
  reorderItems: async (items: Array<{ id: number; sort_order: number }>) => api.post("/v1/admin/navigation-items/reorder", { items }, options),
};
