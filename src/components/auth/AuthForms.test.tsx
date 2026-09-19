import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LoginPage from "@/app/(auth)/login/page";
import RegisterPage from "@/app/(auth)/register/page";
import ChangePasswordPage from "@/app/(client)/user/change-password/page";
import { useAuthLogic } from "@/hooks/useAuthLogic";

vi.mock("@/hooks/useAuthLogic", () => ({
  useAuthLogic: vi.fn(),
}));

const login = vi.fn();
const register = vi.fn();
const changePassword = vi.fn();
const resetErrors = vi.fn();

const mockAuthLogic = (overrides: Record<string, unknown> = {}) => {
  vi.mocked(useAuthLogic).mockReturnValue({
    login,
    register,
    changePassword,
    logout: vi.fn(),
    isLoading: false,
    formError: null,
    fieldErrors: {},
    resetErrors,
    ...overrides,
  });
};

describe("auth forms", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthLogic();
  });

  it("validates login fields before calling the API", () => {
    render(<LoginPage />);
    fireEvent.change(screen.getByLabelText("Email *"), {
      target: { value: "not-an-email" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Đăng Nhập" }));

    expect(screen.getByText("Email không hợp lệ.")).toBeInTheDocument();
    expect(screen.getByText("Vui lòng nhập mật khẩu.")).toBeInTheDocument();
    expect(login).not.toHaveBeenCalled();
  });

  it("submits normalized login credentials", () => {
    render(<LoginPage />);
    fireEvent.change(screen.getByLabelText("Email *"), {
      target: { value: " user@example.com " },
    });
    fireEvent.change(screen.getByLabelText("Mật khẩu *"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Đăng Nhập" }));

    expect(login).toHaveBeenCalledWith({
      email: "user@example.com",
      password: "password123",
    });
  });

  it("shows API field errors on login", () => {
    mockAuthLogic({
      formError: "Dữ liệu không hợp lệ.",
      fieldErrors: { email: ["Email không tồn tại."] },
    });
    render(<LoginPage />);

    expect(screen.getByRole("alert")).toHaveTextContent("Dữ liệu không hợp lệ.");
    expect(screen.getByText("Email không tồn tại.")).toBeInTheDocument();
  });

  it("rejects mismatched registration passwords", () => {
    render(<RegisterPage />);
    fireEvent.change(screen.getByLabelText("Họ và tên *"), {
      target: { value: "Nguyen Van A" },
    });
    fireEvent.change(screen.getByLabelText("Email *"), {
      target: { value: "user@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Mật khẩu *"), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText("Xác nhận mật khẩu *"), {
      target: { value: "password456" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Đăng Ký Tài Khoản" }),
    );

    expect(screen.getByText("Mật khẩu xác nhận không khớp.")).toBeInTheDocument();
    expect(register).not.toHaveBeenCalled();
  });

  it("rejects a reused current password", () => {
    render(<ChangePasswordPage />);
    fireEvent.change(screen.getByLabelText("Mật khẩu hiện tại *"), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText("Mật khẩu mới *"), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText("Xác nhận mật khẩu mới *"), {
      target: { value: "password123" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Cập nhật mật khẩu" }),
    );

    expect(
      screen.getByText("Mật khẩu mới phải khác mật khẩu hiện tại."),
    ).toBeInTheDocument();
    expect(changePassword).not.toHaveBeenCalled();
  });
});
