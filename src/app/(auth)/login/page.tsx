"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuthLogic } from "@/hooks/useAuthLogic";

export default function LoginPage() {
  const { login, isLoading } = useAuthLogic();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(formData);
  };

  return (
    <div className="min-h-[70vh] bg-gray-light flex items-center justify-center py-10 px-4">
      <div className="bg-white p-8 rounded-xl shadow-[0_4px_24px_rgba(13,33,55,.07)] w-full max-w-md border border-[#e8edf5]">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-extrabold text-blue-nav mb-2">
            Đăng Nhập
          </h1>
          <p className="text-[14px] text-text-muted">
            Chào mừng bạn quay trở lại với BUYCODE.VN
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-[#475569]">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="Nhập email của bạn"
              className="h-[40px] px-3 border border-[#e2e8f0] rounded-lg text-[13.5px] outline-none transition-all focus:border-blue-primary focus:shadow-[0_0_0_3px_rgba(26,92,184,.1)]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[13px] font-semibold text-[#475569]">
                Mật khẩu <span className="text-red-500">*</span>
              </label>
              <Link
                href="#"
                className="text-[12px] font-semibold text-blue-primary hover:text-orange-main transition-colors"
              >
                Quên mật khẩu?
              </Link>
            </div>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="Nhập mật khẩu"
              className="h-[40px] px-3 border border-[#e2e8f0] rounded-lg text-[13.5px] outline-none transition-all focus:border-blue-primary focus:shadow-[0_0_0_3px_rgba(26,92,184,.1)]"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 w-full bg-blue-primary hover:bg-[#154ea0] text-white font-bold h-[42px] rounded-lg text-[14px] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <i className="fas fa-spinner fa-spin"></i>
            ) : (
              "Đăng Nhập"
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-[13.5px] text-[#475569]">
          Chưa có tài khoản?{" "}
          <Link
            href="/register"
            className="font-bold text-blue-primary hover:text-orange-main transition-colors"
          >
            Đăng ký ngay
          </Link>
        </div>
      </div>
    </div>
  );
}
