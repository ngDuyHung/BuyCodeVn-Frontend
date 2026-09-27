import type { User } from "@/types/identity";

export const ADMIN_PERMISSIONS = [
  "users.view", "users.create", "users.update", "users.delete", "roles.manage",
  "catalog.view", "catalog.manage", "orders.view", "orders.manage",
  "services.view", "services.manage", "domains.approve", "finance.view", "wallets.manage",
  "deposits.manage", "withdrawals.manage", "bank_accounts.manage",
  "tickets.view", "tickets.reply", "tickets.manage", "settings.view", "settings.manage",
] as const;

export type AdminPermission = (typeof ADMIN_PERMISSIONS)[number];

const adminPermissionSet = new Set<string>(ADMIN_PERMISSIONS);

export const can = (user: Pick<User, "roles" | "permissions"> | null | undefined, permission: AdminPermission) =>
  Boolean(user?.roles.includes("admin") || user?.permissions.includes(permission));

export const hasAdminAccess = (user: Pick<User, "roles" | "permissions"> | null | undefined) =>
  Boolean(user?.roles.includes("admin") || user?.permissions.some((permission) => adminPermissionSet.has(permission)));
