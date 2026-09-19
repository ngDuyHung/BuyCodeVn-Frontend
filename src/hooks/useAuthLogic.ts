import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/stores/authStore";
import type { ValidationErrors } from "@/types/api";
import type {
  ChangePasswordPayload,
  LoginPayload,
  RegisterPayload,
} from "@/types/identity";
import {
  clearAuthTokenCookie,
  setAuthTokenCookie,
} from "@/lib/auth-cookie";
import { getSafeReturnUrl } from "@/lib/auth-redirect";
import { normalizeApiError } from "@/lib/api-error";

export const useAuthLogic = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<ValidationErrors>({});
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const resetErrors = () => {
    setFormError(null);
    setFieldErrors({});
  };

  const captureError = (error: unknown) => {
    const apiError = normalizeApiError(error);
    setFormError(apiError.message);
    setFieldErrors(apiError.fieldErrors);
  };

  const login = async (payload: LoginPayload) => {
    resetErrors();
    setIsLoading(true);
    try {
      const response = await authService.login(payload);
      setAuth(response.token, response.user, response.expires_in);
      setAuthTokenCookie(response.token, response.expires_in);

      toast.success("Đăng nhập thành công!");
      const search = typeof window === "undefined" ? "" : window.location.search;
      router.replace(getSafeReturnUrl(search));
      return true;
    } catch (error) {
      captureError(error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: RegisterPayload) => {
    resetErrors();
    setIsLoading(true);
    try {
      await authService.register(payload);
      toast.success("Đăng ký thành công! Vui lòng đăng nhập.");
      router.replace("/login");
      return true;
    } catch (error) {
      captureError(error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async (payload: ChangePasswordPayload) => {
    resetErrors();
    setIsLoading(true);
    try {
      const response = await authService.changePassword(payload);
      toast.success(response.message || "Đổi mật khẩu thành công.");
      return true;
    } catch (error) {
      captureError(error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      toast.success("Đăng xuất thành công.");
    } catch (error) {
      console.error(error);
    } finally {
      clearAuth();
      clearAuthTokenCookie();
      router.replace("/login");
    }
  };

  return {
    login,
    register,
    changePassword,
    logout,
    isLoading,
    formError,
    fieldErrors,
    resetErrors,
  };
};
