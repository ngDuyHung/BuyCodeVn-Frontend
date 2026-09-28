export type PresentationPlacement = "home_hero";
export type PresentationLayout = "split" | "cover";
export type PresentationAlignment = "left" | "center" | "right";
export type PresentationTheme = "light" | "dark";

export interface PresentationCta {
  label: string;
  url: string;
}

export interface PresentationHighlight {
  icon: string;
  label: string;
}

export interface PresentationSlide {
  id: number;
  placement: PresentationPlacement;
  eyebrow: string | null;
  title: string;
  description: string | null;
  desktop_image_url: string;
  mobile_image_url: string | null;
  image_alt: string;
  primary_cta: PresentationCta | null;
  secondary_cta: PresentationCta | null;
  highlights: PresentationHighlight[];
  layout: PresentationLayout;
  content_alignment: PresentationAlignment;
  theme: PresentationTheme;
  overlay_opacity: number;
}

export interface AdminPresentationSlide extends PresentationSlide {
  internal_name: string;
  sort_order: number;
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PresentationSlidePayload {
  placement: PresentationPlacement;
  internal_name: string;
  eyebrow?: string;
  title: string;
  description?: string;
  desktop_image?: File;
  desktop_image_url?: string;
  mobile_image?: File;
  mobile_image_url?: string;
  remove_mobile_image?: boolean;
  image_alt?: string;
  primary_cta_label?: string;
  primary_cta_url?: string;
  secondary_cta_label?: string;
  secondary_cta_url?: string;
  highlights?: PresentationHighlight[];
  layout: PresentationLayout;
  content_alignment: PresentationAlignment;
  theme: PresentationTheme;
  overlay_opacity: number;
  sort_order: number;
  is_active: boolean;
  starts_at?: string;
  ends_at?: string;
}

export interface AdminPresentationSlideQuery {
  search?: string;
  placement?: PresentationPlacement;
  is_active?: 0 | 1;
  per_page?: number;
}
