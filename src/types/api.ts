export interface ApiEnvelope<T> {
  success: true;
  message: string | null;
  data: T;
  request_id?: string;
}

export type MoneyString = string;

export type ApiResource<T> = ApiEnvelope<T>;

export interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

export interface PaginationMeta {
  current_page: number;
  from: number | null;
  last_page: number;
  links?: PaginationLink[];
  path: string;
  per_page: number;
  to: number | null;
  total: number;
}

export interface PaginationLinks {
  first: string | null;
  last: string | null;
  prev: string | null;
  next: string | null;
}

export interface PaginatedResponse<T> extends ApiEnvelope<T[]> {
  data: T[];
  links: PaginationLinks;
  meta: PaginationMeta;
}

export interface BusinessResponse<T> extends ApiEnvelope<T> {
  success: true;
  message: string;
}

export type ValidationErrors = Record<string, string[]>;

export interface ApiErrorPayload {
  success?: false;
  message?: string;
  errors?: ValidationErrors;
  error?: {
    code?: string;
    message?: string;
    details?: unknown;
  };
  request_id?: string;
}

export interface ListQuery {
  page?: number;
  per_page?: number;
  search?: string;
}
