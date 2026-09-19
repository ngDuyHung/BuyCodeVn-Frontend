import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { financeService } from "@/services/client/financeService";
import { normalizeApiError } from "@/lib/api-error";
import type {
  ActiveBankAccount,
  DepositPayload,
  DepositResult,
} from "@/types/finance";

export const useFinanceLogic = () => {
  const [banks, setBanks] = useState<ActiveBankAccount[]>([]);
  const [isLoadingBanks, setIsLoadingBanks] = useState(true);
  const [isDepositing, setIsDepositing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [depositResult, setDepositResult] = useState<DepositResult | null>(null);

  // Tự động lấy danh sách ngân hàng khi component mount
  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const res = await financeService.getBanks();
        setBanks(res);
      } catch (requestError) {
        setError(normalizeApiError(requestError).message);
      } finally {
        setIsLoadingBanks(false);
      }
    };
    fetchBanks();
  }, []);

  const handleDeposit = async (payload: DepositPayload) => {
    setIsDepositing(true);
    setError(null);
    try {
      const res = await financeService.createDeposit(payload);
      toast.success(res.message || "Tạo lệnh nạp tiền thành công!");
      // res.data chứa thông tin QR và giao dịch từ API[cite: 5]
      setDepositResult(res.data);
    } catch (requestError) {
      setError(normalizeApiError(requestError).message);
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
    error,
    handleDeposit,
    resetDeposit,
  };
};
