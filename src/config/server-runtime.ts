import { getApiBaseUrl } from "@/config/env";

const boundedInteger = (value: string | undefined, fallback: number, min: number, max: number) => {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) ? Math.min(max, Math.max(min, parsed)) : fallback;
};

const normalizeUrl = (value: string) => value.replace(/\/+$/, "");

export const SERVER_API_TIMEOUT_MS = boundedInteger(
  process.env.SERVER_API_TIMEOUT_MS,
  3500,
  1000,
  10000,
);

export const PUBLIC_DATA_REVALIDATE_SECONDS = boundedInteger(
  process.env.PUBLIC_DATA_REVALIDATE_SECONDS,
  60,
  10,
  3600,
);

export const getServerApiBaseUrl = () => {
  const configuredUrl = process.env.API_INTERNAL_URL?.trim();
  if (!configuredUrl) return getApiBaseUrl();

  const apiUrl = normalizeUrl(configuredUrl);
  try {
    new URL(apiUrl);
  } catch {
    throw new Error("API_INTERNAL_URL must be an absolute URL, for example http://127.0.0.1:8000/api.");
  }
  return apiUrl;
};
