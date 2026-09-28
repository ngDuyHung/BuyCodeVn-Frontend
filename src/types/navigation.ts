export type NavigationPlacement = "header" | "footer";
export type NavigationTarget = "_self" | "_blank";

export interface NavigationItem {
  id: number;
  label: string;
  url: string | null;
  icon: string | null;
  target: NavigationTarget;
  children: NavigationItem[];
}

export interface AdminNavigationItem extends NavigationItem {
  placement: NavigationPlacement;
  parent_id: number | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface NavigationMenus {
  header: NavigationItem[];
  footer: NavigationItem[];
}

export interface NavigationItemPayload {
  placement: NavigationPlacement;
  parent_id: number | null;
  label: string;
  url: string;
  icon: string;
  target: NavigationTarget;
  sort_order: number;
  is_active: boolean;
}
