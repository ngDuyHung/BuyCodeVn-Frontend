import type { ValidationErrors } from "@/types/api";

export const firstFieldError = (
  errors: ValidationErrors,
  field: string,
): string | undefined => errors[field]?.[0];

export const isValidEmail = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export const normalizeDomain = (value: string) =>
  value.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "");

export const isValidDomain = (value: string) =>
  /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i.test(
    normalizeDomain(value),
  );
