import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'react-toastify';

const api = axios.create({
  // Tạm thời để localhost, sau này có thể đổi qua process.env.NEXT_PUBLIC_API_URL
  baseURL: 'http://localhost:8000/api', 
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
    return config;
  },
  (error) => Promise.reject(error)
);

// Bắt lỗi response global
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.';

      if (status === 401) {
        toast.error('Phiên đăng nhập đã hết hạn.');
        useAuthStore.getState().logout();
        if (typeof window !== 'undefined') window.location.href = '/login';
      } else if (status === 403) {
        toast.error('Bạn không có quyền thực hiện thao tác này.');
      } else if (status === 422) {
        // Lỗi validation (form) có thể xử lý hiển thị riêng, tạm thời vẫn log toast
        toast.error(message);
      } else if (status >= 500) {
        toast.error('Lỗi máy chủ, vui lòng thử lại sau.');
      } else {
        toast.error(message);
      }
    } else {
      toast.error('Không thể kết nối đến máy chủ.');
    }
    return Promise.reject(error);
  }
);

export default api;