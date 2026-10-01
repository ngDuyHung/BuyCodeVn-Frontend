import api from "../api";
import type { ApiResource, PaginatedResponse } from "@/types/api";
import type {
  UserService,
  UserServiceQuery,
  ServiceCredentials,
  HostingLoginSession,
} from "@/types/services";

export const userService = {
  getServices: async (params: UserServiceQuery = {}, signal?: AbortSignal) => {
    const response = await api.get<PaginatedResponse<UserService>>(
      "/v1/services/my-services",
      { params, signal, suppressErrorToast: true },
    );
    return response.data;
  },

  getService: async (serviceId: number, signal?: AbortSignal) => {
    const response = await api.get<ApiResource<UserService>>(
      `/v1/services/my-services/${serviceId}`,
      { signal, suppressErrorToast: true },
    );
    return response.data.data;
  },

  getCredentials: async (serviceId: number, signal?: AbortSignal) => {
    const response = await api.get<ApiResource<ServiceCredentials>>(
      `/v1/services/my-services/${serviceId}/credentials`,
      { signal, suppressErrorToast: true },
    );
    return response.data.data;
  },

  createHostingLoginSession: async (serviceId: number) => {
    const response = await api.post<ApiResource<HostingLoginSession>>(
      `/v1/services/my-services/${serviceId}/login-session`,
      undefined,
      { suppressErrorToast: true },
    );
    return response.data.data;
  },

  upgradeHosting: async (serviceId: number, hostingPlanId: number, idempotencyKey: string) => {
    const response = await api.post<ApiResource<UserService>>(
      `/v1/services/my-services/${serviceId}/hosting-upgrade`,
      { hosting_plan_id: hostingPlanId, idempotency_key: idempotencyKey },
      { suppressErrorToast: true },
    );
    return response.data.data;
  },

  resetHosting: async (serviceId: number, confirmation: string) => {
    const response = await api.post<ApiResource<{ service: UserService; new_password: string }>>(
      `/v1/services/my-services/${serviceId}/hosting-reset`,
      { confirmation, acknowledge_data_loss: true },
      { suppressErrorToast: true },
    );
    return response.data.data;
  },

  terminateHosting: async (serviceId: number, confirmation: string) => {
    const response = await api.delete<ApiResource<UserService>>(
      `/v1/services/my-services/${serviceId}/hosting`,
      { data: { confirmation }, suppressErrorToast: true },
    );
    return response.data.data;
  },

  vpsAction: async (serviceId: number, action: "start" | "stop" | "restart" | "poweroff") => {
    const response = await api.post<ApiResource<UserService>>(
      `/v1/services/my-services/${serviceId}/vps-actions`,
      { action },
      { suppressErrorToast: true },
    );
    return response.data;
  },

  rebuildVps: async (serviceId: number, payload: { os_image_id: number; new_password?: string }) => {
    const response = await api.post<ApiResource<UserService>>(
      `/v1/services/my-services/${serviceId}/rebuild`,
      payload,
      { suppressErrorToast: true },
    );
    return response.data;
  },

  changeVpsPassword: async (serviceId: number, newPassword: string) => {
    const response = await api.post<ApiResource<UserService>>(
      `/v1/services/my-services/${serviceId}/vps-password`,
      { new_password: newPassword },
      { suppressErrorToast: true },
    );
    return response.data;
  },

  changeVpsHostname: async (serviceId: number, hostname: string) => {
    const response = await api.post<ApiResource<UserService>>(
      `/v1/services/my-services/${serviceId}/vps-hostname`,
      { hostname },
      { suppressErrorToast: true },
    );
    return response.data;
  },

  syncVps: async (serviceId: number) => {
    const response = await api.post<ApiResource<UserService>>(
      `/v1/services/my-services/${serviceId}/vps-sync`,
      undefined,
      { suppressErrorToast: true },
    );
    return response.data;
  },
};
