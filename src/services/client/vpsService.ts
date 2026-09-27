import api from "../api";
import { normalizeVpsPlan } from "@/lib/vps";
import type { ApiResource } from "@/types/api";
import type { VpsOsImage, VpsPlan } from "@/types/services";

export const vpsService = {
  getPlans: async (signal?: AbortSignal) => {
    const response = await api.get<ApiResource<VpsPlan[]>>(
      "/v1/services/vps-plans",
      { signal, suppressErrorToast: true },
    );
    return response.data.data.map(normalizeVpsPlan);
  },
  getPlan: async (id: number, signal?: AbortSignal) => {
    const response = await api.get<ApiResource<VpsPlan>>(
      `/v1/services/vps-plans/${id}`,
      { signal, suppressErrorToast: true },
    );
    return normalizeVpsPlan(response.data.data);
  },
  getOsImages: async (signal?: AbortSignal) => {
    const response = await api.get<ApiResource<VpsOsImage[]>>(
      "/v1/services/vps-os-images",
      { signal, suppressErrorToast: true },
    );
    return response.data.data;
  },
};
