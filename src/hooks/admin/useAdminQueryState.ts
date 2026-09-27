"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export const updateAdminQuery = (search: string, updates: Record<string, string | number | null>) => {
  const params = new URLSearchParams(search);
  Object.entries(updates).forEach(([key, value]) => {
    if (value === null || value === "") params.delete(key);
    else params.set(key, String(value));
  });
  return params.toString();
};

export function useAdminQueryState() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const update = (updates: Record<string, string | number | null>) => {
    const query = updateAdminQuery(searchParams.toString(), updates);
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  return { searchParams, update };
}
