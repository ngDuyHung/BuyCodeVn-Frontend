import { useCallback, useEffect, useState } from "react";
import axios from "axios";
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
  const [requestKey, setRequestKey] = useState(0);

  const [depositResult, setDepositResult] = useState<DepositResult | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const fetchBanks = async () => {
      setIsLoadingBanks(true);
      setError(null);
      try {
        const res = await financeService.getBanks(controller.signal);
        setBanks(res);
      } catch (requestError) {
        if (!axios.isCancel(requestError)) {
          setError(normalizeApiError(requestError).message);
        }
      } finally {
        if (!controller.signal.aborted) setIsLoadingBanks(false);
      }
    };
    void fetchBanks();
    return () => controller.abort();
  }, [requestKey]);

  const handleDeposit = async (payload: DepositPayload) => {
    setIsDepositing(true);
    setError(null);
    try {
      const res = await financeService.createDeposit(payload);
      toast.success(res.message || "Tạo lệnh nạp tiền thành công!");
      setDepositResult(res.data);
    } catch (requestError) {
      setError(normalizeApiError(requestError).message);
    } finally {
      setIsDepositing(false);
    }
  };

  const resetDeposit = () => {
    setDepositResult(null);
    setError(null);
  };

  const retryBanks = useCallback(() => setRequestKey((key) => key + 1), []);

  return {
    banks,
    isLoadingBanks,
    isDepositing,
    depositResult,
    error,
    setError,
    retryBanks,
    handleDeposit,
    resetDeposit,
  };
};
