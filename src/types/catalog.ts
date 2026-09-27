import type { ListQuery } from "./api";

export interface Category {
  id: number;
  parent_id: number | null;
  name: string;
  slug: string;
  is_active: boolean;
  children: Category[];
  created_at: string;
  updated_at: string;
}

export const PRODUCT_TYPES = [
  "source_code",
  "template",
  "script",
  "plugin",
  "other",
] as const;

export type ProductType = (typeof PRODUCT_TYPES)[number];

export interface Product {
  id: number;
  category_id: number;
  type: ProductType;
  title: string;
  slug: string;
  description: string | null;
  thumbnail_url: string | null;
  demo_url: string | null;
  price: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  category?: Category;
  has_download_file?: boolean;
}

export interface CategoryWritePayload {
  name: string;
  slug?: string | null;
  parent_id?: number | null;
  is_active: boolean;
}

export interface ProductWritePayload {
  category_id: number;
  type: ProductType;
  title: string;
  description?: string | null;
  thumbnail_url?: string | null;
  demo_url?: string | null;
  price: string;
  file_url?: string | null;
  is_active: boolean;
}

export interface CatalogQuery extends ListQuery {
  category_id?: number | "";
  type?: ProductType | "";
  is_active?: boolean;
}

export type CatalogSearchParams = Record<
  string,
  string | string[] | undefined
>;
