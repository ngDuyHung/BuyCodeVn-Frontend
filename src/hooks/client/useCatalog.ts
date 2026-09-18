import { useState, useEffect } from "react";
import { catalogService } from "@/services/client/catalogService";

export const useCatalog = (initialParams: any = {}) => {
  const [categories, setCategories] = useState<any[]>([]);
  // Dữ liệu sản phẩm trả về dạng Pagination của Laravel (data, meta, links)[cite: 7]
  const [productsData, setProductsData] = useState<any>({
    data: [],
    meta: {},
    links: {},
  });
  const [isLoading, setIsLoading] = useState(true);
  const [params, setParams] = useState(initialParams);

  useEffect(() => {
    const fetchCatalog = async () => {
      setIsLoading(true);
      try {
        // Chạy song song 2 API để tăng tốc độ load trang
        const [catsRes, prodsRes] = await Promise.all([
          catalogService.getCategories(),
          catalogService.getProducts(params),
        ]);

        setCategories(catsRes.data || catsRes);
        setProductsData(prodsRes);
      } catch (error) {
        // Lỗi đã được axios interceptor bắt và hiển thị
        console.error("Lỗi tải dữ liệu catalog:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCatalog();
  }, [params]);

  // Hàm dùng để cập nhật bộ lọc (ví dụ: khi user bấm tìm kiếm hoặc chuyển trang)
  const updateParams = (newParams: any) => {
    setParams({ ...params, ...newParams });
  };

  return {
    categories,
    products: productsData.data || [],
    meta: productsData.meta || {},
    isLoading,
    updateParams,
    params,
  };
};
