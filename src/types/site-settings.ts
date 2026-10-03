export interface SiteSettings {
  site_name: string;
  site_short_name: string;
  site_keywords: string;
  site_description: string;
  site_address: string;
  site_hotline: string;
  site_facebook_url: string;
  site_email: string;
  site_telegram: string;
  site_copyright: string;
  site_primary_color: string;
  site_secondary_color: string;
  site_accent_color: string;
  site_header_html: string;
  site_footer_html: string;
  favicon_url: string | null;
  logo_url: string | null;
  footer_logo_url: string | null;
  admin_logo_url: string | null;
}

export interface SiteSettingPayload extends Omit<SiteSettings, "favicon_url" | "logo_url" | "footer_logo_url" | "admin_logo_url"> {
  favicon?: File;
  logo?: File;
  footer_logo?: File;
  admin_logo?: File;
  remove_favicon?: boolean;
  remove_logo?: boolean;
  remove_footer_logo?: boolean;
  remove_admin_logo?: boolean;
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  site_name: "BUYCODE.VN",
  site_short_name: "BUYCODE",
  site_keywords: "mã nguồn, hosting, VPS, tên miền",
  site_description: "Cung cấp mã nguồn chất lượng, hosting, VPS và tên miền.",
  site_address: "",
  site_hotline: "",
  site_facebook_url: "",
  site_email: "support@buycode.vn",
  site_telegram: "",
  site_copyright: "© {year} BUYCODE.VN. All rights reserved.",
  site_primary_color: "#1a5cb8",
  site_secondary_color: "#0f2b47",
  site_accent_color: "#f97316",
  site_header_html: "",
  site_footer_html: "",
  favicon_url: null,
  logo_url: null,
  footer_logo_url: null,
  admin_logo_url: null,
};
