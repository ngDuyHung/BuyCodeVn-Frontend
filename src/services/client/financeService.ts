import api from "../api";

export const financeService = {
  // Lấy danh sách ngân hàng đang hoạt động
  getBanks: async () => {
    const response = await api.get("/v1/finance/banks");
    return response.data;
  },

  // Tạo lệnh nạp tiền
  createDeposit: async (payload: {
    bank_account_id: number;
    amount: number;
  }) => {
    const response = await api.post("/v1/finance/deposit", payload);
    return response.data;
  },
};
