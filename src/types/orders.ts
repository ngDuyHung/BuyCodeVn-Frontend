import type { ListQuery, MoneyString } from "./api";

export type OrderStatus = "processing" | "completed" | "failed";
export type OrderItemType = "product" | "hosting" | "domain" | "vps";
import type { VpsBillingCycle } from "./services";
export interface Coupon {
  id: number;
  code: string;
  discount_percent: MoneyString | null;
  discount_amount: MoneyString | null;
  usage_limit: number | null;
  used_count: number;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

export interface CouponWritePayload {
  code: string;
  discount_percent: MoneyString | null;
  discount_amount: MoneyString | null;
  usage_limit: number | null;
  expires_at: string | null;
  is_active: boolean;
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

export interface BuyVpsPayload {
  vps_plan_id: number;
  os_image_id: number;
  billing_cycle: VpsBillingCycle;
  hostname: string;
  location_id: number;
  idempotency_key: string;
}

export interface BuyVpsResult {
  order_id: number;
  service_id: number;
  instance_id: number;
  status: string;
  hostname: string;
  idempotent: boolean;
}

export interface RenewVpsPayload {
  billing_cycle: VpsBillingCycle;
  idempotency_key: string;
}

export interface RenewVpsResult {
  order_id: number;
  service_id?: number;
  status?: string;
  expires_at?: string | null;
  idempotent?: boolean;
}

export interface DomainCheckResult {
  domain: string;
  is_available: boolean;
  register_price: MoneyString;
  renew_price: MoneyString;
  message: string;
}

export interface DomainContactInfo {
  name: string;
  email: string;
  phone: string;
  cccd?: string;
}

export interface BuyDomainPayload {
  domain: string;
  years: number;
  contact_info: DomainContactInfo;
  coupon_code?: string;
}

export type DomainPurchaseStatus = "success" | "pending_manual";

export interface BuyDomainResult {
  domain: string;
  status: DomainPurchaseStatus;
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

export interface AdminOrderItem extends OrderItem {
  config: Record<string, unknown> | null;
}

export interface AdminOrder extends Omit<Order, "items"> {
  user: { id: number; name: string; email: string; is_active: boolean } | null;
  items: AdminOrderItem[];
}

export interface AdminOrderQuery extends ListQuery {
  user_id?: number;
  status?: OrderStatus | "";
  item_type?: OrderItemType | "";
  date_from?: string;
  date_to?: string;
  min_amount?: string;
  max_amount?: string;
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

export interface ChangeHostingPasswordPayload {
  new_password?: string;
}

export interface ChangeHostingPasswordResult {
  new_password: string;
}

export interface RenewHostingPayload {
  months: HostingMonths;
  idempotency_key: string;
}

export interface RenewHostingResult {
  order_id: number;
  expires_at: string;
  idempotent: boolean;
}

export interface RenewDomainPayload {
  years: number;
  idempotency_key: string;
}

export type DomainRenewalStatus = "success" | "pending_manual" | "failed";

export interface RenewDomainResult {
  renewal_id: number;
  order_id: number;
  domain: string;
  status: DomainRenewalStatus;
  expires_at: string;
  idempotent: boolean;
}
