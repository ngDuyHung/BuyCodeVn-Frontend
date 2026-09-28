import Link from "next/link";
import type { NavigationItem } from "@/types/navigation";
import { DEFAULT_SITE_SETTINGS, type SiteSettings } from "@/types/site-settings";

const defaultItems: NavigationItem[] = [
  { id: -1, label: "Dịch vụ", url: null, icon: null, target: "_self", children: [
    { id: -2, label: "Mã nguồn", url: "/source-code", icon: null, target: "_self", children: [] },
    { id: -3, label: "Hosting", url: "/hosting", icon: null, target: "_self", children: [] },
    { id: -4, label: "VPS", url: "/vps", icon: null, target: "_self", children: [] },
    { id: -5, label: "Tên miền", url: "/domains", icon: null, target: "_self", children: [] },
  ] },
  { id: -6, label: "Tài khoản", url: null, icon: null, target: "_self", children: [
    { id: -7, label: "Tổng quan tài khoản", url: "/user", icon: null, target: "_self", children: [] },
    { id: -8, label: "Lịch sử đơn hàng", url: "/user/orders", icon: null, target: "_self", children: [] },
    { id: -9, label: "Nạp tiền", url: "/user/deposit", icon: null, target: "_self", children: [] },
    { id: -10, label: "Lịch sử rút tiền", url: "/user/withdrawals", icon: null, target: "_self", children: [] },
  ] },
];

const telegramUrl = (value: string) => value.startsWith("http") ? value : `https://t.me/${value.replace(/^@/, "")}`;

export default function Footer({ items = defaultItems, settings = DEFAULT_SITE_SETTINGS }: { items?: NavigationItem[]; settings?: SiteSettings }) {
  return (
    <footer className="bg-blue-dark text-[#cbd5e1]">
      <div className="mx-auto grid max-w-[1350px] grid-cols-1 gap-8 px-4 py-9 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1.4fr] lg:px-5 lg:py-12">
        <div>
          {/* Runtime branding URLs cannot be statically allowlisted for next/image. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={settings.footer_logo_url ?? settings.logo_url ?? "/images/logoweb.png"} alt={settings.site_name} className="h-10 w-auto max-w-[180px] object-contain brightness-150" />
          <p className="mt-4 max-w-sm text-[13.5px] leading-7 text-[#94a3b8]">
            {settings.site_description}
          </p>
        </div>
        {items.map((item) => <FooterLinks key={item.id} item={item} />)}
        <div>
          <h2 className="mb-4 text-sm font-bold uppercase text-[#e2e8f0]">Liên hệ</h2>
          <div className="space-y-3">{settings.site_email && <a href={`mailto:${settings.site_email}`} className="flex items-center gap-2 text-sm text-[#94a3b8] hover:text-orange-main"><i className="fas fa-envelope text-orange-main" aria-hidden="true" />{settings.site_email}</a>}{settings.site_hotline && <a href={`tel:${settings.site_hotline.replace(/\s+/g, "")}`} className="flex items-center gap-2 text-sm text-[#94a3b8] hover:text-orange-main"><i className="fas fa-phone text-orange-main" aria-hidden="true" />{settings.site_hotline}</a>}{settings.site_address && <p className="flex items-start gap-2 text-sm leading-6 text-[#94a3b8]"><i className="fas fa-location-dot mt-1 text-orange-main" aria-hidden="true" />{settings.site_address}</p>}<div className="flex gap-3">{settings.site_facebook_url && <a href={settings.site_facebook_url} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-[#94a3b8] hover:text-orange-main"><i className="fab fa-facebook text-lg" /></a>}{settings.site_telegram && <a href={telegramUrl(settings.site_telegram)} target="_blank" rel="noopener noreferrer" aria-label="Telegram" className="text-[#94a3b8] hover:text-orange-main"><i className="fab fa-telegram text-lg" /></a>}</div></div>
        </div>
      </div>
      <div className="border-t border-white/10 py-5">
        <div className="mx-auto flex max-w-[1350px] flex-col gap-2 px-4 text-xs text-[#94a3b8] sm:flex-row sm:items-center sm:justify-between lg:px-5">
          <span>{settings.site_copyright.replaceAll("{year}", String(new Date().getFullYear()))}</span>
          <span>Thanh toán qua số dư ví {settings.site_short_name}</span>
        </div>
      </div>
    </footer>
  );
}

function FooterLinks({ item }: { item: NavigationItem }) {
  const links = item.children.length ? item.children : item.url ? [item] : [];
  return (
    <div>
      <h2 className="mb-4 text-sm font-bold uppercase text-[#e2e8f0]">{item.label}</h2>
      <ul className="space-y-2.5">
        {links.map((link) => (
          <li key={link.id}>{link.url && <Link href={link.url} target={link.target} rel={link.target === "_blank" ? "noopener noreferrer" : undefined} className="inline-flex items-center gap-2 text-[13.5px] text-[#94a3b8] hover:text-orange-main">{link.icon && <i className={`fas ${link.icon}`} aria-hidden="true" />}{link.label}</Link>}</li>
        ))}
      </ul>
    </div>
  );
}
