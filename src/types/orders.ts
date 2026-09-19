import type { ListQuery, MoneyString } from "./api";

export type OrderStatus = "processing" | "completed" | "failed";
export type OrderItemType = "product" | "hosting" | "domain";
export type UserServiceStatus =
  | "pending"
  | "active"
  | "suspended"
  | "expired"
  | "failed"
  | "terminated";

export interface Coupon {
  id: number;
  code: string;
  discount_percent: number | null;
  discount_amount: MoneyString | null;
  usage_limit: number | null;
  used_count: number;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

export interface CouponPreview {
  discount_amount: MoneyString;
  final_amount: MoneyString;
}

export interface PreviewCouponPayload {
  coupon_code: string;
  total_amount: MoneyString;
}

export interface BuyProductPayload {
  product_id: number;
  coupon_code?: string;
}

export interface BuyProductResult {
  order_id: number;
}

export const HOSTING_MONTH_OPTIONS = [1, 3, 6, 12, 24, 36] as const;
export type HostingMonths = (typeof HOSTING_MONTH_OPTIONS)[number];

export interface BuyHostingPayload {
  hosting_plan_id: number;
  domain: string;
  months: HostingMonths;
  coupon_code?: string;
}

export type HostingPurchaseStatus = "success" | "pending_manual";

export interface BuyHostingResult {
  status: HostingPurchaseStatus;
  order_id: number;
  service_id: number;
  domain: string;
}

export interface ProductOrderSnapshot {
  id: number;
  title: string;
  slug: string;
  thumbnail_url: string | null;
  demo_url: string | null;
}

export interface OrderItem {
  id: number;
  item_type: OrderItemType;
  item_id: number;
  price: MoneyString;
  quantity: number;
  subtotal: MoneyString;
  item: ProductOrderSnapshot | Record<string, unknown> | null;
  service: {
    id: number;
    service_type: string;
    status: string;
    domain_name: string | null;
    expires_at: string | null;
  } | null;
  created_at: string;
}

export interface Order {
  id: number;
  status: OrderStatus;
  total_amount: MoneyString;
  discount_amount: MoneyString;
  final_amount: MoneyString;
  item_count: number;
  items: OrderItem[];
  coupon: { id: number; code: string } | null;
  created_at: string;
  updated_at: string;
}

export interface OrderQuery extends ListQuery {
  status?: OrderStatus | "";
  item_type?: OrderItemType | "";
  date_from?: string;
  date_to?: string;
}

export interface DownloadedProduct {
  blob: Blob;
  filename: string;
  contentType: string;
}
