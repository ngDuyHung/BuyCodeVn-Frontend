import api from "@/services/api";
import type { ApiResource, PaginatedResponse } from "@/types/api";
import type { AdminPresentationSlide, AdminPresentationSlideQuery, PresentationSlidePayload } from "@/types/presentation";

const readOptions = (signal?: AbortSignal) => ({ signal, suppressErrorToast: true });
const writeOptions = { suppressErrorToast: true };

const toFormData = (payload: PresentationSlidePayload) => {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (key === "highlights" && Array.isArray(value)) {
      value.forEach((highlight, index) => {
        formData.append(`highlights[${index}][icon]`, highlight.icon);
        formData.append(`highlights[${index}][label]`, highlight.label);
      });
    } else if (typeof value === "boolean") formData.append(key, value ? "1" : "0");
    else formData.append(key, value instanceof File ? value : String(value));
  });
  return formData;
};

export const adminPresentationService = {
  getSlides: async (query: AdminPresentationSlideQuery = {}, signal?: AbortSignal) => {
    const response = await api.get<PaginatedResponse<AdminPresentationSlide>>("/v1/admin/presentation-slides", {
      ...readOptions(signal), params: query,
    });
    return response.data;
  },
  createSlide: async (payload: PresentationSlidePayload) => {
    const response = await api.post<ApiResource<AdminPresentationSlide>>(
      "/v1/admin/presentation-slides", toFormData(payload), writeOptions,
    );
    return response.data.data;
  },
  updateSlide: async (id: number, payload: PresentationSlidePayload) => {
    const response = await api.post<ApiResource<AdminPresentationSlide>>(
      `/v1/admin/presentation-slides/${id}`, toFormData(payload), writeOptions,
    );
    return response.data.data;
  },
  deleteSlide: async (id: number) => {
    await api.delete(`/v1/admin/presentation-slides/${id}`, writeOptions);
  },
  reorderSlides: async (slides: Array<{ id: number; sort_order: number }>) => {
    await api.post("/v1/admin/presentation-slides/reorder", { slides }, writeOptions);
  },
};
