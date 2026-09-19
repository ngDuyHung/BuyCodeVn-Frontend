"use client";

import { useState } from "react";
import Link from "next/link";
import FormAlert from "@/components/auth/FormAlert";
import FormField from "@/components/auth/FormField";
import { useAuthLogic } from "@/hooks/useAuthLogic";
import { isValidEmail } from "@/lib/validation";
import type { RegisterPayload } from "@/types/identity";

export default function RegisterPage() {
  const { register, isLoading, formError, fieldErrors, resetErrors } =
    useAuthLogic();
  const [formData, setFormData] = useState<RegisterPayload>({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});

  const getError = (field: keyof RegisterPayload) =>
    clientErrors[field] || fieldErrors[field]?.[0];

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const field = event.target.name as keyof RegisterPayload;
    setFormData((current) => ({ ...current, [field]: event.target.value }));
    setClientErrors((current) => ({ ...current, [field]: "" }));
    resetErrors();
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) errors.name = "Vui lòng nhập họ và tên.";
    if (!formData.email.trim()) errors.email = "Vui lòng nhập email.";
    else if (!isValidEmail(formData.email)) errors.email = "Email không hợp lệ.";
    if (formData.password.length < 8) {
      errors.password = "Mật khẩu phải có ít nhất 8 ký tự.";
    }
    if (!formData.password_confirmation) {
      errors.password_confirmation = "Vui lòng xác nhận mật khẩu.";
    } else if (formData.password_confirmation !== formData.password) {
      errors.password_confirmation = "Mật khẩu xác nhận không khớp.";
    }

    setClientErrors(errors);
    if (Object.keys(errors).length > 0) return;
    void register({
      ...formData,
      name: formData.name.trim(),
      email: formData.email.trim(),
    });
  };

  return (
    <div className="flex w-full items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-xl border border-[#e8edf5] bg-white p-8 shadow-[0_4px_24px_rgba(13,33,55,.07)]">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-2xl font-extrabold text-blue-nav">Đăng Ký</h1>
          <p className="text-sm text-text-muted">Tạo tài khoản BUYCODE.VN mới</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <FormAlert message={formError} />
          <FormField
            id="register-name"
            name="name"
            label="Họ và tên"
            value={formData.name}
            onChange={handleChange}
            placeholder="Ví dụ: Nguyễn Văn A"
            autoComplete="name"
            error={getError("name")}
            required
          />
          <FormField
            id="register-email"
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
            id="register-password"
            name="password"
            label="Mật khẩu"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Tối thiểu 8 ký tự"
            autoComplete="new-password"
            error={getError("password")}
            minLength={8}
            required
          />
          <FormField
            id="register-password-confirmation"
            name="password_confirmation"
            label="Xác nhận mật khẩu"
            type="password"
            value={formData.password_confirmation}
            onChange={handleChange}
            placeholder="Nhập lại mật khẩu"
            autoComplete="new-password"
            error={getError("password_confirmation")}
            minLength={8}
            required
          />

          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 flex h-[42px] w-full items-center justify-center gap-2 rounded-lg bg-blue-primary text-sm font-bold text-white transition-colors hover:bg-[#154ea0] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? (
              <>
                <i className="fas fa-spinner fa-spin" aria-hidden="true" />
                Đang đăng ký
              </>
            ) : (
              "Đăng Ký Tài Khoản"
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-[13.5px] text-[#475569]">
          Đã có tài khoản?{" "}
          <Link
            href="/login"
            className="font-bold text-blue-primary transition-colors hover:text-orange-main"
          >
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    </div>
  );
}
