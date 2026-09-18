import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { financeService } from "@/services/client/financeService";

export const useFinanceLogic = () => {
  const [banks, setBanks] = useState<any[]>([]);
  const [isLoadingBanks, setIsLoadingBanks] = useState(true);
  const [isDepositing, setIsDepositing] = useState(false);

  // Lưu kết quả trả về từ API (Mã QR, số tài khoản...)
  const [depositResult, setDepositResult] = useState<any>(null);

  // Tự động lấy danh sách ngân hàng khi component mount
  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const res = await financeService.getBanks();
        setBanks(res.data || res);
      } catch (error) {
        // Lỗi đã được axios interceptor bắt
      } finally {
        setIsLoadingBanks(false);
      }
    };
    fetchBanks();
  }, []);

  const handleDeposit = async (payload: {
    bank_account_id: number;
    amount: number;
  }) => {
    setIsDepositing(true);
    try {
      const res = await financeService.createDeposit(payload);
      toast.success(res.message || "Tạo lệnh nạp tiền thành công!");
      // res.data chứa thông tin QR và giao dịch từ API[cite: 5]
      setDepositResult(res.data);
    } catch (error) {
      // Lỗi do interceptor xử lý
    } finally {
      setIsDepositing(false);
    }
  };

  const resetDeposit = () => {
    setDepositResult(null);
  };

  return {
    banks,
    isLoadingBanks,
    isDepositing,
    depositResult,
    handleDeposit,
    resetDeposit,
  };
};
