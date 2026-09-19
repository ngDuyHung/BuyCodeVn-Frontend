import Cookies from "js-cookie";

const AUTH_COOKIE = "auth_token";

export const setAuthTokenCookie = (token: string, expiresInSeconds = 604800) => {
  Cookies.set(AUTH_COOKIE, token, {
    expires: Math.max(expiresInSeconds, 1) / 86400,
    path: "/",
    sameSite: "lax",
    secure:
      typeof window !== "undefined" && window.location.protocol === "https:",
  });
};

export const clearAuthTokenCookie = () => {
  Cookies.remove(AUTH_COOKIE, { path: "/" });
};
