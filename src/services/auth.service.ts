import api from "./api";

export const authService = {
  // [POST] /api/v1/auth/login[cite: 5]
  login: async (payload: any) => {
    const response = await api.post("/v1/auth/login", payload);
    return response.data;
  },

  // [POST] /api/v1/auth/register[cite: 5]
  register: async (payload: any) => {
    const response = await api.post("/v1/auth/register", payload);
    return response.data;
  },

  // [GET] /api/v1/auth/me[cite: 5]
  getMe: async () => {
    const response = await api.get("/v1/auth/me");
    return response.data;
  },

  // [POST] /api/v1/auth/logout[cite: 5]
  logout: async () => {
    const response = await api.post("/v1/auth/logout");
    return response.data;
  },
};
