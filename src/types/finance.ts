import type { MoneyString } from "./api";

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
