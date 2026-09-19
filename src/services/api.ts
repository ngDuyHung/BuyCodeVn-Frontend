import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'react-toastify';
import { getApiBaseUrl } from '@/config/env';
import { normalizeApiError } from '@/lib/api-error';
import { clearAuthTokenCookie } from '@/lib/auth-cookie';

export const AUTH_UNAUTHORIZED_EVENT = "auth:unauthorized";

const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Gắn token vào mọi request
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (!config.headers["X-Request-ID"] && globalThis.crypto?.randomUUID) {
      config.headers["X-Request-ID"] = globalThis.crypto.randomUUID();
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Bắt lỗi response global
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isCancel(error)) return Promise.reject(error);

    const apiError = normalizeApiError(error);
    const skipAuthRedirect = error.config?.skipAuthRedirect === true;
    const suppressErrorToast = error.config?.suppressErrorToast === true;

    if (error.response) {
      const status = error.response.status;

      if (status === 401 && !skipAuthRedirect) {
        toast.error('Phiên đăng nhập đã hết hạn.');
        useAuthStore.getState().clearAuth();
        clearAuthTokenCookie();
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event(AUTH_UNAUTHORIZED_EVENT));
        }
      } else if (suppressErrorToast) {
        // Form hoặc caller sẽ hiển thị lỗi theo field/context riêng.
      } else if (status === 403) {
        toast.error('Bạn không có quyền thực hiện thao tác này.');
      } else if (status === 422) {
        toast.error(apiError.message);
      } else if (status === 429) {
        toast.error(
          apiError.retryAfter
            ? `Bạn thao tác quá nhanh. Vui lòng thử lại sau ${apiError.retryAfter} giây.`
            : apiError.message,
        );
      } else if (status >= 500) {
        toast.error('Lỗi máy chủ, vui lòng thử lại sau.');
      } else {
        toast.error(apiError.message);
      }
    } else if (!suppressErrorToast) {
      toast.error('Không thể kết nối đến máy chủ.');
    }
    return Promise.reject(apiError);
  }
);

export default api;
