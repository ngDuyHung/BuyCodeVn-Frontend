import api from "./api";
import type { ApiEnvelope } from "@/types/api";
import type {
  ChangePasswordPayload,
  LoginPayload,
  LoginData,
  RegisterPayload,
  User,
} from "@/types/identity";

export const authService = {
  login: async (payload: LoginPayload) => {
    const response = await api.post<ApiEnvelope<LoginData>>(
      "/v1/auth/login",
      payload,
      {
        skipAuthRedirect: true,
        suppressErrorToast: true,
      },
    );
    return response.data.data;
  },

  register: async (payload: RegisterPayload) => {
    const response = await api.post<ApiEnvelope<User>>(
      "/v1/auth/register",
      payload,
      { suppressErrorToast: true },
    );
    return response.data.data;
  },

  getMe: async () => {
    const response = await api.get<ApiEnvelope<User>>("/v1/auth/me");
    return response.data.data;
  },

  changePassword: async (payload: ChangePasswordPayload) => {
    const response = await api.post<ApiEnvelope<null>>(
      "/v1/auth/change-password",
      payload,
      { suppressErrorToast: true },
    );
    return response.data;
  },

  logout: async () => {
    const response = await api.post<ApiEnvelope<null>>("/v1/auth/logout");
    return response.data;
  },
};
