import api from "../api";
import type { ApiResource, PaginatedResponse } from "@/types/api";
import type {
  HostingPlan,
  ServerCategory,
  ServiceListQuery,
} from "@/types/services";

export const hostingService = {
  getServerCategories: async (signal?: AbortSignal) => {
    const response = await api.get<ApiResource<ServerCategory[]>>(
      "/v1/services/server-categories",
      { signal, suppressErrorToast: true },
    );
    return response.data.data;
  },

  getPlans: async (params: ServiceListQuery = {}, signal?: AbortSignal) => {
    const response = await api.get<PaginatedResponse<HostingPlan>>(
      "/v1/services/hosting-plans",
      { params, signal, suppressErrorToast: true },
    );
    return response.data;
  },

  getPlan: async (planId: number, signal?: AbortSignal) => {
    const response = await api.get<ApiResource<HostingPlan>>(
      `/v1/services/hosting-plans/${planId}`,
      { signal, suppressErrorToast: true },
    );
    return response.data.data;
  },
};
