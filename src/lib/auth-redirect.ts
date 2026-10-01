export const DEFAULT_AUTH_REDIRECT = "/";

const guestOnlyRoutes = ["/login", "/register"];

export const getSafeReturnUrl = (search: string) => {
  const returnUrl = new URLSearchParams(search).get("returnUrl");

  if (!returnUrl || !returnUrl.startsWith("/") || returnUrl.startsWith("//")) {
    return DEFAULT_AUTH_REDIRECT;
  }

  const pathname = returnUrl.split(/[?#]/, 1)[0].replace(/\/$/, "") || "/";
  if (guestOnlyRoutes.includes(pathname)) return DEFAULT_AUTH_REDIRECT;

  return returnUrl;
};
