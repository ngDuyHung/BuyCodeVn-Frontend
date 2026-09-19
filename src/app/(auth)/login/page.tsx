"use client";

import { useState } from "react";
import Link from "next/link";
import FormAlert from "@/components/auth/FormAlert";
import FormField from "@/components/auth/FormField";
import { useAuthLogic } from "@/hooks/useAuthLogic";
import { isValidEmail } from "@/lib/validation";
import type { LoginPayload } from "@/types/identity";

export default function LoginPage() {
  const { login, isLoading, formError, fieldErrors, resetErrors } =
    useAuthLogic();
  const [formData, setFormData] = useState<LoginPayload>({
    email: "",
    password: "",
  });
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});

  const getError = (field: keyof LoginPayload) =>
    clientErrors[field] || fieldErrors[field]?.[0];

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const field = event.target.name as keyof LoginPayload;
    setFormData((current) => ({ ...current, [field]: event.target.value }));
    setClientErrors((current) => ({ ...current, [field]: "" }));
    resetErrors();
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const errors: Record<string, string> = {};
    if (!formData.email.trim()) errors.email = "Vui lòng nhập email.";
    else if (!isValidEmail(formData.email)) errors.email = "Email không hợp lệ.";
    if (!formData.password) errors.password = "Vui lòng nhập mật khẩu.";

    setClientErrors(errors);
    if (Object.keys(errors).length > 0) return;
    void login({ ...formData, email: formData.email.trim() });
  };

  return (
    <div className="flex w-full items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-xl border border-[#e8edf5] bg-white p-8 shadow-[0_4px_24px_rgba(13,33,55,.07)]">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-2xl font-extrabold text-blue-nav">Đăng Nhập</h1>
          <p className="text-sm text-text-muted">
            Chào mừng bạn quay trở lại với BUYCODE.VN
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <FormAlert message={formError} />
          <FormField
            id="login-email"
            name="email"
            label="Email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Nhập email của bạn"
            autoComplete="email"
            error={getError("email")}
            required
          />
          <FormField
            id="login-password"
            name="password"
            label="Mật khẩu"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Nhập mật khẩu"
            autoComplete="current-password"
            error={getError("password")}
            required
          />

          <p className="text-right text-xs text-text-muted">
            Quên mật khẩu hiện chưa được hỗ trợ.
          </p>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 flex h-[42px] w-full items-center justify-center gap-2 rounded-lg bg-blue-primary text-sm font-bold text-white transition-colors hover:bg-[#154ea0] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? (
              <>
                <i className="fas fa-spinner fa-spin" aria-hidden="true" />
                Đang đăng nhập
              </>
            ) : (
              "Đăng Nhập"
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-[13.5px] text-[#475569]">
          Chưa có tài khoản?{" "}
          <Link
            href="/register"
            className="font-bold text-blue-primary transition-colors hover:text-orange-main"
          >
            Đăng ký ngay
          </Link>
        </div>
      </div>
    </div>
  );
}
