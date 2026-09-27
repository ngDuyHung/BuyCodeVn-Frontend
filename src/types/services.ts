import type { ListQuery, MoneyString } from "./api";

export type ServerType = "mock" | "cyberpanel" | "whm";
export type ProvisioningMode = "automatic" | "manual";
export type ServerAuthType = "token" | "password";

export interface Server {
  id: number;
  name: string;
  slug: string;
  ip_address: string;
  type: ServerType;
  provisioning_mode: ProvisioningMode;
  login_url: string | null;
  api_username: string;
  api_auth_type: ServerAuthType;
  api_port: number;
  verify_tls: boolean;
  connect_timeout: number;
  request_timeout: number;
  is_active: boolean;
  created_at: string;
  has_api_token: boolean;
}

export interface ServerWritePayload {
  name: string;
  ip_address: string;
  type: ServerType;
  provisioning_mode: ProvisioningMode;
  login_url: string | null;
  api_username: string;
  api_auth_type: ServerAuthType;
  api_token?: string | null;
  api_port: number;
  verify_tls: boolean;
  connect_timeout: number;
  request_timeout: number;
  is_active: boolean;
}

export interface ServerConnectionResult {
  success: boolean;
  version: string | null;
  username: string;
  tls_verified: boolean;
}

export interface ProviderHostingPlan {
  name: string;
  quota_mb: number;
  bandwidth_mb: number;
  max_ftp_accounts: number;
  max_email_accounts: number;
  max_addon_domains: number;
  max_databases: number;
  max_subdomains: number;
  max_parked_domains: number;
}

export type ProviderHostingLimitField =
  | "disk_quota"
  | "bandwidth_limit_mb"
  | "max_ftp_accounts"
  | "max_email_accounts"
  | "max_databases"
  | "max_subdomains"
  | "max_parked_domains"
  | "max_addon_domains";

export interface ProviderHostingFieldLimit {
  maximum: number | null;
  allow_unlimited: boolean | null;
}

export interface ProviderHostingCapabilities {
  provider: string;
  username: string;
  account_limit: {
    used: number | null;
    maximum: number | null;
    remaining: number | null;
    is_unlimited: boolean | null;
  };
  permissions: {
    unlimited_features?: boolean | null;
    unlimited_disk?: boolean | null;
    unlimited_bandwidth?: boolean | null;
    custom_email_limits?: boolean | null;
    addon_domains?: boolean | null;
    parked_domains?: boolean | null;
  };
  field_limits: Partial<Record<ProviderHostingLimitField, ProviderHostingFieldLimit>>;
  warnings: string[];
  source: string[];
}

export type HostingCustomFeatures = Record<string, string>;

export interface ProviderHostingPlanWritePayload {
  name?: string;
  disk_quota: number;
  bandwidth_limit_mb: number;
  memory_limit_mb: number | null;
  max_ftp_accounts: number;
  max_email_accounts: number;
  max_databases: number;
  max_subdomains: number;
  max_parked_domains: number;
  max_addon_domains: number;
  custom_features: HostingCustomFeatures;
  package_extensions?: string[];
  provider_options?: Record<string, string>;
}

export interface HostingPlan {
  id: number;
  name: string;
  disk_quota: number;
  bandwidth_limit_mb?: number;
  memory_limit_mb?: number | null;
  max_ftp_accounts?: number;
  max_email_accounts?: number;
  max_databases?: number;
  max_subdomains?: number;
  max_parked_domains?: number;
  max_addon_domains?: number;
  custom_features?: HostingCustomFeatures;
  price_per_month: MoneyString;
}

export interface AdminHostingPlan extends HostingPlan {
  server_id: number;
  whm_package_name: string;
  bandwidth_limit_mb: number;
  memory_limit_mb: number | null;
  max_ftp_accounts: number;
  max_email_accounts: number;
  max_databases: number;
  max_subdomains: number;
  max_parked_domains: number;
  max_addon_domains: number;
  custom_features: HostingCustomFeatures;
  is_active: boolean;
  provider_available: boolean;
  provider_synced_at: string | null;
  created_at: string;
  server?: Server;
}

export interface HostingPlanWritePayload {
  server_id: number;
  name: string;
  whm_package_name: string;
  disk_quota: number;
  bandwidth_limit_mb: number;
  memory_limit_mb: number | null;
  max_ftp_accounts: number;
  max_email_accounts: number;
  max_databases: number;
  max_subdomains: number;
  max_parked_domains: number;
  max_addon_domains: number;
  custom_features: HostingCustomFeatures;
  price_per_month: MoneyString;
  is_active: boolean;
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

export interface TldPricingWritePayload {
  tld: string;
  register_price: MoneyString;
  renew_price: MoneyString;
  transfer_price: MoneyString;
  is_auto_register: boolean;
  is_active: boolean;
}

export interface ServiceListQuery extends ListQuery {
  is_active?: boolean;
  server_category?: number | string;
}

export type UserServiceType = "hosting" | "domain" | "vps";
export type UserServiceStatus =
  | "pending"
  | "active"
  | "suspended"
  | "expired"
  | "failed"
  | "terminated";

export interface UserServiceActions {
  can_renew: boolean;
  can_change_password: boolean;
  can_view_credentials: boolean;
  can_manage_vps?: boolean;
}

export type VpsBillingCycle = string;

export interface VpsLocation {
  id: number;
  slug: string;
  code: string;
  name: string;
  surcharge: MoneyString;
}

export interface VpsPlan {
  id: number;
  slug: string;
  name: string;
  group_name: string;
  cpu: number;
  ram_mb: number;
  disk_gb: number;
  bandwidth: string;
  ip_description: string;
  pricing: Record<string, { amount: MoneyString }>;
  locations: VpsLocation[];
}

export interface VpsOsImage {
  id: number;
  name: string;
  icon_url: string | null;
}

export interface VpsInstance {
  instance_id: number;
  hostname: string;
  ip_address: string | null;
  provisioning_status: string;
  power_status: string | null;
  os_name: string | null;
  location?: { id: number; name: string; code: string } | null;
  last_synced_at: string | null;
}

export interface PendingRenewal {
  id: number;
  status: string;
  years?: number;
  order_id?: number;
}

export interface UserService {
  id: number;
  service_type: UserServiceType;
  status: UserServiceStatus;
  domain_name: string | null;
  starts_at?: string | null;
  expires_at: string | null;
  provisioning_mode?: "automatic" | "manual" | null;
  provisioned_at?: string | null;
  created_at: string;
  updated_at?: string;
  actions: UserServiceActions;
  pending_renewal?: PendingRenewal | null;
  hosting_plan?: Pick<HostingPlan, "id" | "name" | "price_per_month"> | null;
  plan?: Pick<HostingPlan, "id" | "name" | "price_per_month"> | null;
  tld_pricing?: Pick<TldPricing, "id" | "tld" | "renew_price"> | null;
  order?: { id: number; status: string } | null;
  vps?: VpsInstance | null;
  service?: { id: number; name: string; cpu?: number; ram_mb?: number; disk_gb?: number } | null;
  vps_plan?: Pick<VpsPlan, "id" | "name" | "pricing"> | null;
}

export interface AdminUserServiceActions extends UserServiceActions {
  can_approve_domain: boolean;
  can_activate_hosting: boolean;
}

export interface AdminUserService extends Omit<UserService, "actions"> {
  username?: string | null;
  user: { id: number; name: string; email: string; is_active: boolean } | null;
  registration?: Record<string, unknown> | null;
  hosting_provisioning?: {
    mode: "automatic" | "manual" | null;
    login_url: string | null;
    provisioned_at: string | null;
    provisioned_by: number | null;
  } | null;
  actions: AdminUserServiceActions;
}

export interface AdminUserServiceQuery extends ListQuery {
  user_id?: number;
  service_type?: UserServiceType | "";
  status?: UserServiceStatus | "";
  expiring_before?: string;
}

export interface ActivateManualHostingPayload {
  username: string;
  password: string;
  login_url: string;
}

export interface AdminServiceCommandResult {
  service_id: number;
  order_id: number;
  domain: string;
  status?: string;
  operation?: "registration" | "renewal";
  renewal_id?: number | null;
  expires_at: string | null;
  idempotent: boolean;
}

export interface UserServiceQuery extends ListQuery {
  service_type?: UserServiceType;
  status?: UserServiceStatus | "";
  expiring_before?: string;
}

export interface HostingServiceCredentials {
  service_id: number;
  domain: string;
  login_url: string;
  username: string;
  password: string;
}

export interface VpsServiceCredentials {
  service_id: number;
  service_type: "vps";
  ip_address: string | null;
  login_url: null;
  username: string;
  password: string;
}

export interface AdminVpsProviderConfig {
  provider: "xvps";
  configured: boolean;
  environment: "sandbox" | "production";
  base_url: string;
  api_username_masked?: string | null;
  api_app_masked?: string | null;
  has_api_secret: boolean;
  max_retries: number;
  timeout_seconds: number;
  is_active: boolean;
  updated_by?: number | null;
  updated_at?: string | null;
}

export interface AdminVpsProviderPayload {
  environment: "sandbox" | "production";
  base_url: string;
  api_username?: string;
  api_app?: string;
  api_secret?: string;
  max_retries: number;
  timeout_seconds: number;
  is_active: boolean;
}

export interface AdminVpsLocation {
  id: number;
  provider: string;
  provider_location_id: string;
  slug: string;
  code: string;
  name: string;
  provider_surcharge: MoneyString | null;
  sale_surcharge: MoneyString | null;
  is_active: boolean;
  last_synced_at: string | null;
}

export interface AdminVpsPlan extends Omit<VpsPlan, "pricing" | "locations"> {
  provider: string;
  provider_product_id: string;
  provider_pricing: Record<string, { amount: MoneyString; billing_cycle?: string | null }>;
  sale_pricing: Record<string, { amount: MoneyString; billing_cycle?: string | null }>;
  is_active: boolean;
  last_synced_at: string | null;
  locations: AdminVpsLocation[];
}

export interface AdminVpsOperation {
  id: number;
  type: string;
  status: string;
  order_id: number | null;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface AdminVpsInstance {
  id: number;
  user_service_id: number;
  user_id: number;
  plan: { id: number; name: string } | null;
  os_image: { id: number; name: string } | null;
  location: { id: number; name: string; code: string } | null;
  provider: string;
  provider_instance_id: string | null;
  provider_order_code: string | null;
  hostname: string;
  billing_cycle: string;
  provisioning_status: string;
  power_status: string | null;
  ip_address: string | null;
  os_name: string | null;
  provider_expires_at: string | null;
  last_synced_at: string | null;
  provider_last_error: string | null;
  operations?: AdminVpsOperation[];
  created_at: string;
}

export interface AdminVpsInstanceQuery extends ListQuery {
  status?: string;
  user_id?: number;
}

export type AdminVpsHealth = Record<string, unknown>;

export type ServiceCredentials = HostingServiceCredentials | VpsServiceCredentials;

export interface HostingLoginSession {
  url: string;
  expires_in: number;
}
