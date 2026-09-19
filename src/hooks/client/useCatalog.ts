import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { catalogService } from "@/services/client/catalogService";
import { normalizeApiError } from "@/lib/api-error";
import type { PaginationMeta } from "@/types/api";
import type { CatalogQuery, Category, Product } from "@/types/catalog";

export const useCatalog = (initialParams: CatalogQuery = {}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [params, setParams] = useState<CatalogQuery>(initialParams);
  const [requestKey, setRequestKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    const fetchCategories = async () => {
      try {
        setCategories(await catalogService.getCategories(controller.signal));
      } catch (requestError) {
        if (!axios.isCancel(requestError)) {
          setError(normalizeApiError(requestError).message);
        }
      }
    };

    void fetchCategories();
    return () => controller.abort();
  }, [requestKey]);

  useEffect(() => {
    const controller = new AbortController();

    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await catalogService.getProducts(
          params,
          controller.signal,
        );
        setProducts(response.data);
        setMeta(response.meta);
      } catch (requestError) {
        if (!axios.isCancel(requestError)) {
          setError(normalizeApiError(requestError).message);
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };

    void fetchProducts();
    return () => controller.abort();
  }, [params, requestKey]);

  const updateParams = useCallback((newParams: Partial<CatalogQuery>) => {
    setParams((currentParams) => ({ ...currentParams, ...newParams }));
  }, []);

  const retry = useCallback(() => setRequestKey((key) => key + 1), []);

  return {
    categories,
    products,
    meta,
    isLoading,
    error,
    retry,
    updateParams,
    params,
  };
};
