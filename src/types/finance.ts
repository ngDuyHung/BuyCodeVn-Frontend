import type { ListQuery, MoneyString } from "./api";

export type PaymentStatus = "pending" | "completed" | "failed" | "cancelled";
export type WithdrawalStatus = "pending" | "completed" | "rejected";

export interface ActiveBankAccount {
  id: number;
  bank_name: string;
  account_number: string;
  account_name: string;
}

export interface Wallet {
  id: number;
  balance: MoneyString;
  currency: "VND" | string;
  is_active: boolean;
  updated_at: string;
}

export interface DepositPayload {
  bank_account_id: number;
  amount: MoneyString;
}

export interface DepositResult {
  transaction_id: number;
  transaction_code: string;
  amount: MoneyString;
  bank_name: string;
  account_number: string;
  account_name: string;
  qr_url: string;
}

export type WalletTransactionType =
  | "deposit"
  | "payment"
  | "refund"
  | "withdraw_pending"
  | "withdraw"
  | "refund_withdraw"
  | "admin_credit"
  | "admin_debit";

export interface WalletTransactionReference {
  type: string;
  id: number;
}

export interface WalletTransaction {
  id: number;
  type: WalletTransactionType;
  amount: MoneyString;
  balance_before?: MoneyString;
  balance_after?: MoneyString;
  description?: string | null;
  reference: WalletTransactionReference | null;
  created_at: string;
}

export interface WalletTransactionQuery extends ListQuery {
  type?: WalletTransactionType | "";
  reference_type?: string;
  date_from?: string;
  date_to?: string;
}

export interface WithdrawalPayload {
  amount: MoneyString;
  bank_name: string;
  account_number: string;
  account_name: string;
}

export interface Withdrawal {
  id: number;
  user_id: number;
  amount: MoneyString;
  bank_name: string;
  account_number: string;
  account_name: string;
  status: WithdrawalStatus;
  admin_note: string | null;
  created_at: string;
  updated_at: string;
}

export interface FinanceUserSummary {
  id: number;
  name: string;
  email: string;
}

export interface AdminUserWalletHistory {
  success: true;
  message: string | null;
  data: WalletTransaction[];
  links: import("./api").PaginationLinks;
  meta: import("./api").PaginationMeta & {
    wallet: Wallet;
    user: FinanceUserSummary;
  };
}

export interface AdminWalletAdjustmentPayload {
  direction: "credit" | "debit";
  amount: MoneyString;
  note: string;
  idempotency_key: string;
}

export interface AdminWalletAdjustmentResult {
  wallet: Wallet;
  transaction: WalletTransaction;
  idempotent: boolean;
}

export interface AdminBankAccount extends ActiveBankAccount {
  bank_code: string;
  is_auto: boolean;
  is_active: boolean;
  created_at: string;
}

export interface AdminBankAccountPayload {
  bank_name: string;
  bank_code: string;
  account_number: string;
  account_name: string;
  is_auto: boolean;
  is_active: boolean;
}

export interface AdminFinanceQuery extends ListQuery {
  status?: PaymentStatus | WithdrawalStatus | "";
  is_active?: 0 | 1;
  is_auto?: 0 | 1;
}

export interface AdminDeposit {
  id: number;
  user_id: number;
  bank_account_id: number;
  transaction_code: string;
  amount: MoneyString;
  actual_amount: MoneyString | null;
  status: PaymentStatus;
  paid_at: string | null;
  created_at: string;
  user?: FinanceUserSummary;
  bank_account?: Pick<ActiveBankAccount, "id" | "bank_name" | "account_number">;
}

export interface AdminWithdrawal extends Withdrawal {
  user?: FinanceUserSummary;
}
