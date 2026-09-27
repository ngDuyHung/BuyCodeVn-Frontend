import api from "@/services/api";
import { toMoneyString } from "@/lib/money";
import type { ApiResource, PaginatedResponse } from "@/types/api";
import type { AdminBankAccount, AdminBankAccountPayload, AdminDeposit, AdminFinanceQuery, AdminWithdrawal } from "@/types/finance";

const readOptions = (signal?: AbortSignal) => ({ signal, suppressErrorToast: true });
const writeOptions = { suppressErrorToast: true };
const normalizeDeposit = (item: AdminDeposit): AdminDeposit => ({ ...item, amount: toMoneyString(item.amount), actual_amount: item.actual_amount == null ? null : toMoneyString(item.actual_amount) });
const normalizeWithdrawal = (item: AdminWithdrawal): AdminWithdrawal => ({ ...item, amount: toMoneyString(item.amount) });

export const adminFinanceService = {
  getBankAccounts: async (query: AdminFinanceQuery = {}, signal?: AbortSignal) => {
    const response = await api.get<PaginatedResponse<AdminBankAccount>>("/v1/finance/admin/bank-accounts", { ...readOptions(signal), params: query });
    return response.data;
  },
  getBankAccount: async (id: number, signal?: AbortSignal) => {
    const response = await api.get<ApiResource<AdminBankAccount>>(`/v1/finance/admin/bank-accounts/${id}`, readOptions(signal));
    return response.data.data;
  },
  createBankAccount: async (payload: AdminBankAccountPayload) => {
    const response = await api.post<ApiResource<AdminBankAccount>>("/v1/finance/admin/bank-accounts", payload, writeOptions);
    return response.data.data;
  },
  updateBankAccount: async (id: number, payload: Partial<AdminBankAccountPayload>) => {
    const response = await api.put<ApiResource<AdminBankAccount>>(`/v1/finance/admin/bank-accounts/${id}`, payload, writeOptions);
    return response.data.data;
  },
  deleteBankAccount: async (id: number) => api.delete(`/v1/finance/admin/bank-accounts/${id}`, writeOptions),
  getDeposits: async (query: AdminFinanceQuery = {}, signal?: AbortSignal) => {
    const response = await api.get<PaginatedResponse<AdminDeposit>>("/v1/finance/admin/deposits", { ...readOptions(signal), params: query });
    return { ...response.data, data: response.data.data.map(normalizeDeposit) };
  },
  getDeposit: async (id: number, signal?: AbortSignal) => {
    const response = await api.get<ApiResource<AdminDeposit>>(`/v1/finance/admin/deposits/${id}`, readOptions(signal));
    return normalizeDeposit(response.data.data);
  },
  approveDeposit: async (id: number, actualAmount: string) => {
    const response = await api.post<ApiResource<AdminDeposit>>(`/v1/finance/admin/deposits/${id}/approve`, { actual_amount: actualAmount }, writeOptions);
    return normalizeDeposit(response.data.data);
  },
  cancelDeposit: async (id: number) => api.post(`/v1/finance/admin/deposits/${id}/cancel`, undefined, writeOptions),
  getWithdrawals: async (query: AdminFinanceQuery = {}, signal?: AbortSignal) => {
    const response = await api.get<PaginatedResponse<AdminWithdrawal>>("/v1/finance/admin/withdraws", { ...readOptions(signal), params: query });
    return { ...response.data, data: response.data.data.map(normalizeWithdrawal) };
  },
  approveWithdrawal: async (id: number) => {
    const response = await api.post<ApiResource<AdminWithdrawal>>(`/v1/finance/admin/withdraws/${id}/approve`, undefined, writeOptions);
    return normalizeWithdrawal(response.data.data);
  },
  rejectWithdrawal: async (id: number, adminNote: string) => {
    const response = await api.post<ApiResource<AdminWithdrawal>>(`/v1/finance/admin/withdraws/${id}/reject`, { admin_note: adminNote }, writeOptions);
    return normalizeWithdrawal(response.data.data);
  },
};
