import api from "../api";
import type { ApiResource, BusinessResponse } from "@/types/api";
import type {
  ActiveBankAccount,
  DepositPayload,
  DepositResult,
  Wallet,
} from "@/types/finance";

export const financeService = {
  getWallet: async (signal?: AbortSignal) => {
    const response = await api.get<ApiResource<Wallet>>("/v1/finance/wallet", {
      signal,
      suppressErrorToast: true,
    });
    return response.data.data;
  },

  // Lấy danh sách ngân hàng đang hoạt động
  getBanks: async () => {
    const response = await api.get<ApiResource<ActiveBankAccount[]>>(
      "/v1/finance/banks",
    );
    return response.data.data;
  },

  // Tạo lệnh nạp tiền
  createDeposit: async (payload: DepositPayload) => {
    const response = await api.post<BusinessResponse<DepositResult>>(
      "/v1/finance/deposit",
      payload,
    );
    return response.data;
  },
};
