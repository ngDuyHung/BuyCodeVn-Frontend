import api from "../api";
import { toMoneyString } from "@/lib/money";
import type {
  ApiResource,
  BusinessResponse,
  ListQuery,
  PaginatedResponse,
} from "@/types/api";
import type {
  ActiveBankAccount,
  DepositPayload,
  DepositResult,
  Wallet,
  WalletTransaction,
  WalletTransactionQuery,
  Withdrawal,
  WithdrawalPayload,
} from "@/types/finance";

const normalizeWallet = (wallet: Wallet): Wallet => ({
  ...wallet,
  balance: toMoneyString(wallet.balance),
});

const normalizeTransaction = (transaction: WalletTransaction): WalletTransaction => ({
  ...transaction,
  amount: toMoneyString(transaction.amount),
  ...(transaction.balance_after !== undefined
    ? { balance_after: toMoneyString(transaction.balance_after) }
    : {}),
});

const normalizeWithdrawal = (withdrawal: Withdrawal): Withdrawal => ({
  ...withdrawal,
  amount: toMoneyString(withdrawal.amount),
});

export const financeService = {
  getWallet: async (signal?: AbortSignal) => {
    const response = await api.get<ApiResource<Wallet>>("/v1/finance/wallet", {
      signal,
      suppressErrorToast: true,
    });
    return normalizeWallet(response.data.data);
  },

  getBanks: async (signal?: AbortSignal) => {
    const response = await api.get<ApiResource<ActiveBankAccount[]>>(
      "/v1/finance/banks",
      { signal, suppressErrorToast: true },
    );
    return response.data.data;
  },

  createDeposit: async (payload: DepositPayload) => {
    const response = await api.post<BusinessResponse<DepositResult>>(
      "/v1/finance/deposit",
      payload,
      { suppressErrorToast: true },
    );
    return {
      ...response.data,
      data: {
        ...response.data.data,
        amount: toMoneyString(response.data.data.amount),
      },
    };
  },

  getWalletTransactions: async (
    params: WalletTransactionQuery = {},
    signal?: AbortSignal,
  ) => {
    const response = await api.get<PaginatedResponse<WalletTransaction>>(
      "/v1/finance/wallet/transactions",
      { params, signal, suppressErrorToast: true },
    );
    return {
      ...response.data,
      data: response.data.data.map(normalizeTransaction),
    };
  },

  getWalletTransaction: async (transactionId: number, signal?: AbortSignal) => {
    const response = await api.get<ApiResource<WalletTransaction>>(
      `/v1/finance/wallet/transactions/${transactionId}`,
      { signal, suppressErrorToast: true },
    );
    return normalizeTransaction(response.data.data);
  },

  getWithdrawals: async (params: ListQuery = {}, signal?: AbortSignal) => {
    const response = await api.get<PaginatedResponse<Withdrawal>>(
      "/v1/finance/withdraws",
      { params, signal, suppressErrorToast: true },
    );
    return {
      ...response.data,
      data: response.data.data.map(normalizeWithdrawal),
    };
  },

  createWithdrawal: async (payload: WithdrawalPayload) => {
    const response = await api.post<BusinessResponse<Record<string, never>>>(
      "/v1/finance/withdraw",
      payload,
      { suppressErrorToast: true },
    );
    return response.data;
  },
};
