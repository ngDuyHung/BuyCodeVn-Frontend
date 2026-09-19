import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { normalizeApiError } from "@/lib/api-error";
import { hostingService } from "@/services/client/hostingService";
import type { PaginationMeta } from "@/types/api";
import type { HostingPlan, ServiceListQuery } from "@/types/services";

export const useHostingPlans = (initialParams: ServiceListQuery = {}) => {
  const perPage = initialParams.per_page;
  const search = initialParams.search;
  const page = initialParams.page;
  const serverCategory = initialParams.server_category;
  const [plans, setPlans] = useState<HostingPlan[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestKey, setRequestKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    const loadPlans = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await hostingService.getPlans(
          {
            per_page: perPage,
            search,
            page,
            server_category: serverCategory,
          },
          controller.signal,
        );
        setPlans(response.data);
        setMeta(response.meta);
      } catch (requestError) {
        if (!axios.isCancel(requestError)) {
          setError(normalizeApiError(requestError).message);
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };

    void loadPlans();
    return () => controller.abort();
  }, [page, perPage, requestKey, search, serverCategory]);

  const retry = useCallback(() => {
    setIsLoading(true);
    setError(null);
    setRequestKey((key) => key + 1);
  }, []);

  return { plans, meta, isLoading, error, retry };
};
