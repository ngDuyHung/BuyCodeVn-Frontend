import api from "@/services/api";
import type { ApiResource, PaginatedResponse } from "@/types/api";
import type { AdminVpsHealth, AdminVpsInstance, AdminVpsInstanceQuery, AdminVpsLocation, AdminVpsPlan, AdminVpsProviderConfig, AdminVpsProviderPayload } from "@/types/services";

const readOptions = (signal?: AbortSignal) => ({ signal, suppressErrorToast: true });
const writeOptions = { suppressErrorToast: true };

export const adminVpsService = {
  getProviderConfig: async (signal?: AbortSignal) => (await api.get<ApiResource<AdminVpsProviderConfig>>("/v1/admin/vps/provider-config", readOptions(signal))).data.data,
  updateProviderConfig: async (payload: AdminVpsProviderPayload) => (await api.put<ApiResource<AdminVpsProviderConfig>>("/v1/admin/vps/provider-config", payload, writeOptions)).data.data,
  getProviderHealth: async () => (await api.get<ApiResource<AdminVpsHealth>>("/v1/admin/vps/provider-health", writeOptions)).data.data,
  syncCatalog: async () => (await api.post<ApiResource<Record<string, unknown>>>("/v1/admin/vps/sync-catalog", undefined, writeOptions)).data.data,
  getPlans: async (signal?: AbortSignal) => (await api.get<PaginatedResponse<AdminVpsPlan>>("/v1/admin/vps/plans", readOptions(signal))).data,
  updatePlan: async (id: number, payload: { name: string; sale_pricing: AdminVpsPlan["sale_pricing"]; is_active: boolean }) => (await api.put<ApiResource<AdminVpsPlan>>(`/v1/admin/vps/plans/${id}`, payload, writeOptions)).data.data,
  getLocations: async (signal?: AbortSignal) => (await api.get<PaginatedResponse<AdminVpsLocation>>("/v1/admin/vps/locations", readOptions(signal))).data,
  updateLocation: async (id: number, payload: { name: string; sale_surcharge: string | null; is_active: boolean }) => (await api.put<ApiResource<AdminVpsLocation>>(`/v1/admin/vps/locations/${id}`, payload, writeOptions)).data.data,
  getInstances: async (query: AdminVpsInstanceQuery = {}, signal?: AbortSignal) => (await api.get<PaginatedResponse<AdminVpsInstance>>("/v1/admin/vps/instances", { ...readOptions(signal), params: query })).data,
  getInstance: async (id: number, signal?: AbortSignal) => (await api.get<ApiResource<AdminVpsInstance>>(`/v1/admin/vps/instances/${id}`, readOptions(signal))).data.data,
  syncInstance: async (id: number) => (await api.post<ApiResource<AdminVpsInstance>>(`/v1/admin/vps/instances/${id}/sync`, undefined, writeOptions)).data.data,
  retryProvision: async (id: number) => (await api.post<ApiResource<AdminVpsInstance>>(`/v1/admin/vps/instances/${id}/retry-provision`, undefined, writeOptions)).data.data,
};
