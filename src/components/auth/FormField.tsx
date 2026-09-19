"use client";

import { useState } from "react";

interface FormFieldProps {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  type?: "text" | "email" | "password";
  placeholder?: string;
  autoComplete?: string;
  error?: string;
  required?: boolean;
  minLength?: number;
}

export default function FormField({
  id,
  name,
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  autoComplete,
  error,
  required = false,
  minLength,
}: FormFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;
  const errorId = `${id}-error`;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[13px] font-semibold text-[#475569]">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <input
          id={id}
          type={inputType}
          name={name}
          required={required}
          minLength={minLength}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className={`h-10 w-full rounded-lg border px-3 text-[13.5px] outline-none transition-all focus:shadow-[0_0_0_3px_rgba(26,92,184,.1)] ${
            isPassword ? "pr-10" : ""
          } ${
            error
              ? "border-red-400 focus:border-red-500"
              : "border-[#e2e8f0] focus:border-blue-primary"
          }`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((visible) => !visible)}
            className="absolute right-0 top-0 flex h-10 w-10 items-center justify-center text-gray-400 hover:text-blue-primary"
            aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          >
            <i
              className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}
              aria-hidden="true"
            />
          </button>
        )}
      </div>
      {error && (
        <p id={errorId} className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
