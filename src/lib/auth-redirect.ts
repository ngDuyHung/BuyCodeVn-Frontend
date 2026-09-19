const DEFAULT_AUTH_REDIRECT = "/user";

export const getSafeReturnUrl = (search: string) => {
  const returnUrl = new URLSearchParams(search).get("returnUrl");

  if (!returnUrl || !returnUrl.startsWith("/") || returnUrl.startsWith("//")) {
    return DEFAULT_AUTH_REDIRECT;
  }

  return returnUrl;
};
