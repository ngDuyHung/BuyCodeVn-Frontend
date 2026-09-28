import api from "@/services/api";
import type { ApiResource } from "@/types/api";
import type { SiteSettingPayload, SiteSettings } from "@/types/site-settings";

const options = { suppressErrorToast: true };

const toFormData = (payload: SiteSettingPayload) => {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    formData.append(key, value instanceof File ? value : typeof value === "boolean" ? (value ? "1" : "0") : String(value));
  });
  return formData;
};

export const adminSiteSettingService = {
  getSettings: async (signal?: AbortSignal) => {
    const response = await api.get<ApiResource<SiteSettings>>("/v1/admin/site-settings", { ...options, signal });
    return response.data.data;
  },
  updateSettings: async (payload: SiteSettingPayload) => {
    const response = await api.post<ApiResource<SiteSettings>>("/v1/admin/site-settings", toFormData(payload), options);
    return response.data.data;
  },
};
