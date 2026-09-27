import api from "@/services/api";
import type { ApiResource, PaginatedResponse } from "@/types/api";
import type { AdminOrder, AdminOrderQuery, Coupon, CouponWritePayload } from "@/types/orders";
import type {
  ActivateManualHostingPayload,
  AdminServiceCommandResult,
  AdminUserService,
  AdminUserServiceQuery,
} from "@/types/services";

type ActiveFilter = 0 | 1;
export interface AdminCouponQuery { page?: number; per_page?: number; search?: string; is_active?: ActiveFilter }

const readOptions = (signal?: AbortSignal) => ({ signal, suppressErrorToast: true });
const writeOptions = { suppressErrorToast: true };

export const adminOperationsService = {
  getCoupons: async (query: AdminCouponQuery = {}, signal?: AbortSignal) => {
    const response = await api.get<PaginatedResponse<Coupon>>("/v1/orders/coupons", { ...readOptions(signal), params: query });
    return response.data;
  },
  createCoupon: async (payload: CouponWritePayload) => {
    const response = await api.post<ApiResource<Coupon>>("/v1/orders/coupons", payload, writeOptions);
    return response.data.data;
  },
  updateCoupon: async (id: number, payload: CouponWritePayload) => {
    const response = await api.put<ApiResource<Coupon>>(`/v1/orders/coupons/${id}`, payload, writeOptions);
    return response.data.data;
  },
  deleteCoupon: async (id: number) => api.delete(`/v1/orders/coupons/${id}`, writeOptions),
  getOrders: async (query: AdminOrderQuery = {}, signal?: AbortSignal) => {
    const response = await api.get<PaginatedResponse<AdminOrder>>("/v1/admin/orders", { ...readOptions(signal), params: query });
    return response.data;
  },
  getOrder: async (id: number, signal?: AbortSignal) => {
    const response = await api.get<ApiResource<AdminOrder>>(`/v1/admin/orders/${id}`, readOptions(signal));
    return response.data.data;
  },
  getServices: async (query: AdminUserServiceQuery = {}, signal?: AbortSignal) => {
    const response = await api.get<PaginatedResponse<AdminUserService>>("/v1/admin/services", { ...readOptions(signal), params: query });
    return response.data;
  },
  getService: async (id: number, signal?: AbortSignal) => {
    const response = await api.get<ApiResource<AdminUserService>>(`/v1/admin/services/${id}`, readOptions(signal));
    return response.data.data;
  },
  approveDomain: async (id: number) => {
    const response = await api.post<ApiResource<AdminServiceCommandResult>>(`/v1/admin/services/${id}/approve-domain`, undefined, writeOptions);
    return response.data.data;
  },
  activateHosting: async (id: number, payload: ActivateManualHostingPayload) => {
    const response = await api.post<ApiResource<AdminServiceCommandResult>>(`/v1/admin/services/${id}/activate-hosting`, payload, writeOptions);
    return response.data.data;
  },
};
