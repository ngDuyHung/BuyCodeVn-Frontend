import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { normalizeApiError } from "@/lib/api-error";
import { userService } from "@/services/client/userService";
import type { PaginatedResponse } from "@/types/api";
import type {
  UserService,
  UserServiceQuery,
  UserServiceStatus,
  UserServiceType,
} from "@/types/services";

export const useUserServices = (serviceType: UserServiceType) => {
  const [query, setQuery] = useState<UserServiceQuery>({
    service_type: serviceType,
    page: 1,
    per_page: 10,
  });
  const [response, setResponse] = useState<PaginatedResponse<UserService> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    Promise.resolve()
      .then(() => {
        setIsLoading(true);
        setError(null);
        return userService.getServices(query, controller.signal);
      })
      .then(setResponse)
      .catch((requestError) => {
        if (!axios.isCancel(requestError)) {
          setError(normalizeApiError(requestError).message);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    return () => controller.abort();
  }, [query, reloadKey]);

  const setStatus = useCallback((status: UserServiceStatus | "") => {
    setQuery((current) => ({ ...current, status, page: 1 }));
  }, []);

  const setPage = useCallback((page: number) => {
    setQuery((current) => ({ ...current, page }));
  }, []);

  const retry = useCallback(() => setReloadKey((key) => key + 1), []);

  return { response, query, isLoading, error, setStatus, setPage, retry };
};
