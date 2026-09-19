import { beforeEach, describe, expect, it, vi } from "vitest";
import api from "./api";
import { authService } from "./auth.service";

vi.mock("./api", () => ({
  default: { get: vi.fn(), post: vi.fn() },
}));

const user = {
  id: 1,
  name: "Nguyen Van A",
  email: "user@example.com",
  is_active: true,
  roles: ["customer"],
  permissions: [],
};

const envelope = <T,>(data: T, message: string | null = null) => ({
  success: true as const,
  message,
  data,
  request_id: "request-123",
});

describe("authService", () => {
  beforeEach(() => vi.clearAllMocks());

  it("maps the login envelope and opts out of session-expired redirects", async () => {
    const loginData = {
      user,
      token: "token-123",
      token_type: "Bearer",
      expires_in: 604800,
    };
    vi.mocked(api.post).mockResolvedValue({ data: envelope(loginData) });

    await expect(
      authService.login({ email: user.email, password: "password123" }),
    ).resolves.toEqual(loginData);
    expect(api.post).toHaveBeenCalledWith(
      "/v1/auth/login",
      { email: user.email, password: "password123" },
      { skipAuthRedirect: true, suppressErrorToast: true },
    );
  });

  it("unwraps a user returned by register", async () => {
    vi.mocked(api.post).mockResolvedValue({ data: envelope(user) });

    await expect(
      authService.register({
        name: user.name,
        email: user.email,
        password: "password123",
        password_confirmation: "password123",
      }),
    ).resolves.toEqual(user);
  });

  it("keeps the change-password success envelope", async () => {
    const response = envelope(null, "Doi mat khau thanh cong.");
    vi.mocked(api.post).mockResolvedValue({ data: response });
    const payload = {
      current_password: "password123",
      new_password: "newpassword123",
      new_password_confirmation: "newpassword123",
    };

    await expect(authService.changePassword(payload)).resolves.toEqual(response);
    expect(api.post).toHaveBeenCalledWith("/v1/auth/change-password", payload, {
      suppressErrorToast: true,
    });
  });
});
