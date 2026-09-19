import type { ListQuery, MoneyString } from "./api";

export type ServerType = "mock" | "cyberpanel" | "whm";

export interface Server {
  id: number;
  name: string;
  ip_address: string;
  type: ServerType;
  is_active: boolean;
  created_at: string;
  api_token?: string;
}

export interface HostingPlan {
  id: number;
  name: string;
  disk_quota: number;
  price_per_month: MoneyString;
}

export interface ServerCategory {
  id: number;
  slug: string;
  name: string;
}

export interface TldPricing {
  id: number;
  tld: string;
  register_price: MoneyString;
  renew_price: MoneyString;
  transfer_price: MoneyString;
  is_auto_register: boolean;
  is_active: boolean;
  created_at: string;
}

export interface ServiceListQuery extends ListQuery {
  is_active?: boolean;
  server_category?: number | string;
}
