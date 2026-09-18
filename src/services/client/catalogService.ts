import api from "../api";

export const catalogService = {
  // Lấy danh sách cây danh mục[cite: 7]
  getCategories: async () => {
    const response = await api.get("/v1/catalog/categories");
    return response.data;
  },

  // Lấy danh sách sản phẩm (có hỗ trợ phân trang, lọc)[cite: 7]
  getProducts: async (params: any = {}) => {
    const response = await api.get("/v1/catalog/products", { params });
    return response.data;
  },
};
