import api from "@/services/api";
import type { ApiResource, PaginatedResponse } from "@/types/api";
import type {
  AdminHostingPlan,
  HostingPlanWritePayload,
  ProviderHostingCapabilities,
  ProviderHostingPlan,
  ProviderHostingPlanWritePayload,
  Server,
  ServerConnectionResult,
  ServerType,
  ServerWritePayload,
  TldPricing,
  TldPricingWritePayload,
} from "@/types/services";

type ActiveFilter = 0 | 1;

export interface AdminServerQuery {
  page?: number;
  per_page?: number;
  search?: string;
  type?: ServerType;
  is_active?: ActiveFilter;
}

export interface AdminHostingPlanQuery {
  page?: number;
  per_page?: number;
  search?: string;
  server_id?: number;
  is_active?: ActiveFilter;
}

export interface AdminTldQuery {
  page?: number;
  per_page?: number;
  search?: string;
  is_active?: ActiveFilter;
  is_auto_register?: ActiveFilter;
}

const readOptions = (signal?: AbortSignal) => ({ signal, suppressErrorToast: true });
const writeOptions = { suppressErrorToast: true };

export const adminServicesService = {
  getServers: async (query: AdminServerQuery = {}, signal?: AbortSignal) => {
    const response = await api.get<PaginatedResponse<Server>>("/v1/services/servers", {
      ...readOptions(signal), params: query,
    });
    return response.data;
  },
  createServer: async (payload: ServerWritePayload) => {
    const response = await api.post<ApiResource<Server>>("/v1/services/servers", payload, writeOptions);
    return response.data.data;
  },
  updateServer: async (id: number, payload: Partial<ServerWritePayload>) => {
    const response = await api.put<ApiResource<Server>>(`/v1/services/servers/${id}`, payload, writeOptions);
    return response.data.data;
  },
  deleteServer: async (id: number) => {
    await api.delete(`/v1/services/servers/${id}`, writeOptions);
  },
  testServerConnection: async (id: number) => {
    const response = await api.post<ApiResource<ServerConnectionResult>>(
      `/v1/services/servers/${id}/test-connection`,
      undefined,
      writeOptions,
    );
    return response.data.data;
  },
  getProviderPlans: async (id: number, signal?: AbortSignal) => {
    const response = await api.get<ApiResource<ProviderHostingPlan[]>>(
      `/v1/services/servers/${id}/provider-plans`,
      readOptions(signal),
    );
    return response.data.data;
  },
  getProviderCapabilities: async (id: number, signal?: AbortSignal) => {
    const response = await api.get<ApiResource<ProviderHostingCapabilities>>(
      `/v1/services/servers/${id}/provider-capabilities`,
      readOptions(signal),
    );
    return response.data.data;
  },
  createProviderPlan: async (serverId: number, payload: ProviderHostingPlanWritePayload & { name: string }) => {
    const response = await api.post<ApiResource<AdminHostingPlan>>(
      `/v1/services/servers/${serverId}/provider-plans`, payload, writeOptions,
    );
    return response.data.data;
  },
  updateProviderPlan: async (serverId: number, packageName: string, payload: ProviderHostingPlanWritePayload) => {
    const response = await api.patch<ApiResource<AdminHostingPlan>>(
      `/v1/services/servers/${serverId}/provider-plans/${encodeURIComponent(packageName)}`, payload, writeOptions,
    );
    return response.data.data;
  },
  deleteProviderPlan: async (serverId: number, packageName: string) => {
    const response = await api.delete<ApiResource<{ package_name: string; local_plan_id: number | null; provider_available: false }>>(
      `/v1/services/servers/${serverId}/provider-plans/${encodeURIComponent(packageName)}`,
      { ...writeOptions, data: { confirm_name: packageName } },
    );
    return response.data.data;
  },
  getHostingPlans: async (query: AdminHostingPlanQuery = {}, signal?: AbortSignal) => {
    const response = await api.get<PaginatedResponse<AdminHostingPlan>>("/v1/admin/services/hosting-plans", {
      ...readOptions(signal), params: query,
    });
    return response.data;
  },
  createHostingPlan: async (payload: HostingPlanWritePayload) => {
    const response = await api.post<ApiResource<AdminHostingPlan>>("/v1/admin/services/hosting-plans", payload, writeOptions);
    return response.data.data;
  },
  updateHostingPlan: async (id: number, payload: Partial<HostingPlanWritePayload>) => {
    const response = await api.put<ApiResource<AdminHostingPlan>>(`/v1/admin/services/hosting-plans/${id}`, payload, writeOptions);
    return response.data.data;
  },
  deleteHostingPlan: async (id: number) => {
    await api.delete(`/v1/admin/services/hosting-plans/${id}`, writeOptions);
  },
  getTldPricing: async (query: AdminTldQuery = {}, signal?: AbortSignal) => {
    const response = await api.get<PaginatedResponse<TldPricing>>("/v1/services/tld-pricing", {
      ...readOptions(signal), params: query,
    });
    return response.data;
  },
  createTldPricing: async (payload: TldPricingWritePayload) => {
    const response = await api.post<ApiResource<TldPricing>>("/v1/services/tld-pricing", payload, writeOptions);
    return response.data.data;
  },
  updateTldPricing: async (id: number, payload: Partial<TldPricingWritePayload>) => {
    const response = await api.put<ApiResource<TldPricing>>(`/v1/services/tld-pricing/${id}`, payload, writeOptions);
    return response.data.data;
  },
  deleteTldPricing: async (id: number) => {
    await api.delete(`/v1/services/tld-pricing/${id}`, writeOptions);
  },
};
