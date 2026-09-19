import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { normalizeApiError } from "@/lib/api-error";
import { hostingService } from "@/services/client/hostingService";
import type { ServerCategory } from "@/types/services";

export const useServerCategories = () => {
  const [categories, setCategories] = useState<ServerCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestKey, setRequestKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    const loadCategories = async () => {
      setIsLoading(true);
      setError(null);
      try {
        setCategories(await hostingService.getServerCategories(controller.signal));
      } catch (requestError) {
        if (!axios.isCancel(requestError)) {
          setError(normalizeApiError(requestError).message);
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };

    void loadCategories();
    return () => controller.abort();
  }, [requestKey]);

  const retry = useCallback(() => setRequestKey((key) => key + 1), []);

  return { categories, isLoading, error, retry };
};
