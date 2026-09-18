import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Cookies from "js-cookie"; // <-- THÊM DÒNG NÀY
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/stores/authStore";

export const useAuthLogic = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const logoutAction = useAuthStore((state) => state.logout);

  const login = async (payload: any) => {
    setIsLoading(true);
    try {
      const res = await authService.login(payload);
      if (res.token) {
        setAuth(res.token, res.data);

        //  Lưu token vào Cookie để Middleware đọc được (Hết hạn sau 7 ngày)
        Cookies.set("auth_token", res.token, { expires: 7 });

        toast.success("Đăng nhập thành công!");
        router.push("/");
      }
    } catch (error) {
      // Bắt lỗi tự động qua interceptor
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: any) => {
    setIsLoading(true);
    try {
      await authService.register(payload);
      toast.success("Đăng ký thành công! Vui lòng đăng nhập.");
      router.push("/login");
    } catch (error) {
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
      logoutAction();

      //  Xóa cookie khi đăng xuất
      Cookies.remove("auth_token");

      router.push("/login");
    }
  };

  return { login, register, logout, isLoading };
};
