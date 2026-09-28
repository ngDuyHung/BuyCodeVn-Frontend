import type { SiteSettings } from "@/types/site-settings";

export default function TopBar({ settings }: { settings: SiteSettings }) {
  return (
    <div className="bg-orange-main py-2 text-[13px] text-white">
      <div className="mx-auto flex max-w-[1350px] flex-wrap items-center justify-center gap-3 px-5 text-center md:justify-between md:text-left">
        <span className="font-medium"><i className="fas fa-shield-halved mr-1.5 text-[#fde68a]" aria-hidden="true" />Thanh toán bằng ví, quản lý dịch vụ tập trung</span>
        {settings.site_hotline ? <a href={`tel:${settings.site_hotline.replace(/\s+/g, "")}`} className="hidden items-center gap-1.5 text-xs text-white opacity-90 hover:opacity-100 md:flex"><i className="fas fa-phone" aria-hidden="true" /> Hotline: {settings.site_hotline}</a> : settings.site_email && <a href={`mailto:${settings.site_email}`} className="hidden items-center gap-1.5 text-xs text-white opacity-90 hover:opacity-100 md:flex"><i className="fas fa-headset" aria-hidden="true" /> Hỗ trợ: {settings.site_email}</a>}
      </div>
    </div>
  );
}
