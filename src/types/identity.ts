export interface User {
  id: number;
  name: string;
  email: string;
  is_active: boolean;
  roles: string[];
  permissions: string[];
  created_at?: string;
  wallet?: {
    balance: string;
    currency: "VND" | string;
    is_active: boolean;
    updated_at: string;
  } | null;
}

export interface AdminRole {
  id: number;
  name: string;
  permissions: string[];
  users_count: number;
  created_at: string;
  updated_at: string;
}

export interface AdminUserCreatePayload {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  is_active: boolean;
}

export interface AdminUserUpdatePayload {
  name: string;
  email: string;
}

export interface AdminRolePayload {
  name: string;
  permissions: string[];
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface LoginData {
  user: User;
  token: string;
  token_type: "Bearer" | string;
  expires_in: number;
}

export interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}
