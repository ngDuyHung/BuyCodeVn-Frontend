const DEFAULT_API_URL = "http://localhost:8000/api";

const normalizeUrl = (value: string) => value.replace(/\/+$/, "");

export const getApiBaseUrl = () => {
  const configuredUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
  const apiUrl = normalizeUrl(configuredUrl || DEFAULT_API_URL);

  try {
    new URL(apiUrl);
  } catch {
    throw new Error(
      "NEXT_PUBLIC_API_URL must be an absolute URL, for example http://localhost:8000/api.",
    );
  }

  return apiUrl;
};
