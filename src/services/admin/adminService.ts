import api from "@/services/api";
import type { ApiResource, PaginatedResponse } from "@/types/api";
import type { AdminRole, AdminRolePayload, AdminUserCreatePayload, AdminUserUpdatePayload, User } from "@/types/identity";
import type {
  AdminUserWalletHistory,
  AdminWalletAdjustmentPayload,
  AdminWalletAdjustmentResult,
  WalletTransactionQuery,
} from "@/types/finance";

export interface AdminUserQuery {
  page?: number;
  per_page?: number;
  search?: string;
  is_active?: 0 | 1;
  role?: string;
}

export interface AdminPermissionResource {
  id: number;
  name: string;
}

const readOptions = (signal?: AbortSignal) => ({ signal, suppressErrorToast: true });
const writeOptions = { suppressErrorToast: true };

export const adminService = {
  getUsers: async (query: AdminUserQuery = {}, signal?: AbortSignal) => {
    const response = await api.get<PaginatedResponse<User>>("/v1/admin/users", {
      ...readOptions(signal), params: query,
    });
    return response.data;
  },
  getUser: async (id: number, signal?: AbortSignal) => {
    const response = await api.get<ApiResource<User>>(`/v1/admin/users/${id}`, readOptions(signal));
    return response.data.data;
  },
  createUser: async (payload: AdminUserCreatePayload) => {
    const response = await api.post<ApiResource<User>>("/v1/admin/users", payload, writeOptions);
    return response.data.data;
  },
  updateUser: async (id: number, payload: AdminUserUpdatePayload) => {
    const response = await api.patch<ApiResource<User>>(`/v1/admin/users/${id}`, payload, writeOptions);
    return response.data.data;
  },
  updateUserStatus: async (id: number, isActive: boolean) => {
    const response = await api.patch<ApiResource<User>>(`/v1/admin/users/${id}/status`, { is_active: isActive }, writeOptions);
    return response.data.data;
  },
  syncUserRoles: async (id: number, roles: string[]) => {
    const response = await api.put<ApiResource<User>>(`/v1/admin/users/${id}/roles`, { roles }, writeOptions);
    return response.data.data;
  },
  deleteUser: async (id: number) => api.delete(`/v1/admin/users/${id}`, writeOptions),
  getUserWalletTransactions: async (
    id: number,
    query: WalletTransactionQuery = {},
    signal?: AbortSignal,
  ) => {
    const response = await api.get<AdminUserWalletHistory>(
      `/v1/admin/users/${id}/wallet-transactions`,
      { ...readOptions(signal), params: query },
    );
    return response.data;
  },
  adjustUserWallet: async (id: number, payload: AdminWalletAdjustmentPayload) => {
    const response = await api.post<ApiResource<AdminWalletAdjustmentResult>>(
      `/v1/admin/users/${id}/wallet-adjustments`,
      payload,
      writeOptions,
    );
    return response.data.data;
  },
  getPermissions: async (signal?: AbortSignal) => {
    const response = await api.get<ApiResource<AdminPermissionResource[]>>(
      "/v1/admin/permissions", readOptions(signal),
    );
    return response.data.data;
  },
  getRoles: async (signal?: AbortSignal) => {
    const response = await api.get<ApiResource<AdminRole[]>>("/v1/admin/roles", readOptions(signal));
    return response.data.data;
  },
  createRole: async (payload: AdminRolePayload) => {
    const response = await api.post<ApiResource<AdminRole>>("/v1/admin/roles", payload, writeOptions);
    return response.data.data;
  },
  updateRole: async (id: number, payload: Partial<AdminRolePayload>) => {
    const response = await api.put<ApiResource<AdminRole>>(`/v1/admin/roles/${id}`, payload, writeOptions);
    return response.data.data;
  },
  deleteRole: async (id: number) => api.delete(`/v1/admin/roles/${id}`, writeOptions),
  getTotal: async (resource: "users" | "orders" | "services" | "catalog/products", signal?: AbortSignal) => {
    const response = await api.get<PaginatedResponse<unknown>>(`/v1/admin/${resource}`, {
      ...readOptions(signal), params: { per_page: 1 },
    });
    return response.data.meta.total;
  },
};
