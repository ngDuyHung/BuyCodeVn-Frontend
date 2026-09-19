"use client";

import { useState } from "react";
import FormAlert from "@/components/auth/FormAlert";
import FormField from "@/components/auth/FormField";
import { useAuthLogic } from "@/hooks/useAuthLogic";
import type { ChangePasswordPayload } from "@/types/identity";

const initialForm: ChangePasswordPayload = {
  current_password: "",
  new_password: "",
  new_password_confirmation: "",
};

export default function ChangePasswordPage() {
  const { changePassword, isLoading, formError, fieldErrors, resetErrors } =
    useAuthLogic();
  const [formData, setFormData] = useState(initialForm);
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});

  const getError = (field: keyof ChangePasswordPayload) =>
    clientErrors[field] || fieldErrors[field]?.[0];

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const field = event.target.name as keyof ChangePasswordPayload;
    setFormData((current) => ({ ...current, [field]: event.target.value }));
    setClientErrors((current) => ({ ...current, [field]: "" }));
    resetErrors();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const errors: Record<string, string> = {};

    if (!formData.current_password) {
      errors.current_password = "Vui lòng nhập mật khẩu hiện tại.";
    }
    if (formData.new_password.length < 8) {
      errors.new_password = "Mật khẩu mới phải có ít nhất 8 ký tự.";
    } else if (formData.new_password === formData.current_password) {
      errors.new_password = "Mật khẩu mới phải khác mật khẩu hiện tại.";
    }
    if (!formData.new_password_confirmation) {
      errors.new_password_confirmation = "Vui lòng xác nhận mật khẩu mới.";
    } else if (
      formData.new_password_confirmation !== formData.new_password
    ) {
      errors.new_password_confirmation = "Mật khẩu xác nhận không khớp.";
    }

    setClientErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const succeeded = await changePassword(formData);
    if (succeeded) setFormData(initialForm);
  };

  return (
    <section className="mx-auto max-w-2xl rounded-xl border border-gray-border bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,.04)] md:p-8">
      <div className="mb-6 border-b border-gray-border pb-4">
        <h1 className="mb-1 text-xl font-extrabold text-blue-nav">
          Đổi mật khẩu
        </h1>
        <p className="text-sm text-text-muted">
          Cập nhật mật khẩu đăng nhập cho tài khoản của bạn.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        <FormAlert message={formError} />
        <FormField
          id="current-password"
          name="current_password"
          label="Mật khẩu hiện tại"
          type="password"
          value={formData.current_password}
          onChange={handleChange}
          autoComplete="current-password"
          error={getError("current_password")}
          required
        />
        <FormField
          id="new-password"
          name="new_password"
          label="Mật khẩu mới"
          type="password"
          value={formData.new_password}
          onChange={handleChange}
          placeholder="Tối thiểu 8 ký tự"
          autoComplete="new-password"
          error={getError("new_password")}
          minLength={8}
          required
        />
        <FormField
          id="new-password-confirmation"
          name="new_password_confirmation"
          label="Xác nhận mật khẩu mới"
          type="password"
          value={formData.new_password_confirmation}
          onChange={handleChange}
          autoComplete="new-password"
          error={getError("new_password_confirmation")}
          minLength={8}
          required
        />

        <button
          type="submit"
          disabled={isLoading}
          className="mt-2 flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-primary px-5 text-sm font-bold text-white transition-colors hover:bg-[#154ea0] disabled:cursor-not-allowed disabled:opacity-70 sm:self-start"
        >
          {isLoading ? (
            <>
              <i className="fas fa-spinner fa-spin" aria-hidden="true" />
              Đang cập nhật
            </>
          ) : (
            "Cập nhật mật khẩu"
          )}
        </button>
      </form>
    </section>
  );
}
