"use client";
/* eslint-disable @next/next/no-img-element */

import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import ErrorState from "@/components/shared/ErrorState";
import LoadingState from "@/components/shared/LoadingState";
import { can } from "@/lib/admin-permissions";
import { normalizeApiError } from "@/lib/api-error";
import { adminSiteSettingService } from "@/services/admin/adminSiteSettingService";
import { useAuthStore } from "@/stores/authStore";
import type { ValidationErrors } from "@/types/api";
import { DEFAULT_SITE_SETTINGS, type SiteSettingPayload, type SiteSettings } from "@/types/site-settings";

const inputClass = "mt-1 h-10 w-full rounded border border-[#cbd6d8] bg-white px-3 font-normal disabled:bg-[#f1f5f9]";
const textareaClass = "mt-1 w-full rounded border border-[#cbd6d8] bg-white px-3 py-2 font-normal disabled:bg-[#f1f5f9]";

const editableSettings = (settings: SiteSettings): SiteSettingPayload => ({
  site_name: settings.site_name, site_short_name: settings.site_short_name,
  site_keywords: settings.site_keywords, site_description: settings.site_description,
  site_address: settings.site_address, site_hotline: settings.site_hotline,
  site_facebook_url: settings.site_facebook_url, site_email: settings.site_email,
  site_telegram: settings.site_telegram, site_copyright: settings.site_copyright,
  site_primary_color: settings.site_primary_color, site_secondary_color: settings.site_secondary_color,
  site_accent_color: settings.site_accent_color,
  site_header_html: settings.site_header_html, site_footer_html: settings.site_footer_html,
});

function ThemeColorInput({ label, description, value, disabled, error, onChange }: {
  label: string; description: string; value: string; disabled: boolean;
  error?: React.ReactNode; onChange: (value: string) => void;
}) {
  return <label className="flex items-center gap-3 border-b border-[#e6ebec] py-3 last:border-0"><input aria-label={`${label} - bảng chọn màu`} type="color" disabled={disabled} value={value} onChange={(event) => onChange(event.target.value)} className="size-11 shrink-0 cursor-pointer rounded border border-[#cbd6d8] bg-white p-1 disabled:cursor-not-allowed" /><span className="min-w-0 flex-1"><span className="block text-sm font-semibold">{label}</span><span className="mt-0.5 block text-xs font-normal leading-5 text-[#60727a]">{description}</span></span><span className="w-28 shrink-0"><input aria-label={label} disabled={disabled} value={value} maxLength={7} pattern="#[0-9a-fA-F]{6}" onChange={(event) => onChange(event.target.value)} className="h-10 w-full rounded border border-[#cbd6d8] bg-white px-2 font-mono text-sm uppercase disabled:bg-[#f1f5f9]" />{error}</span></label>;
}

function useFilePreview(file: File | undefined, currentUrl: string | null, removed: boolean) {
  const objectUrl = useMemo(() => file ? URL.createObjectURL(file) : "", [file]);
  useEffect(() => () => { if (objectUrl) URL.revokeObjectURL(objectUrl); }, [objectUrl]);
  return removed ? null : objectUrl || currentUrl;
}

function ImageSetting({ label, hint, preview, file, removed, hasStoredImage, accept, disabled, error, onFile, onRemove }: {
  label: string; hint: string; preview: string | null; file?: File; removed: boolean; hasStoredImage: boolean; accept: string; disabled: boolean;
  error?: React.ReactNode; onFile: (file?: File) => void; onRemove: (removed: boolean) => void;
}) {
  return <div className="border border-[#dce3e5] bg-white p-4"><div className="flex min-h-20 items-center gap-4"><div className="flex h-16 w-28 shrink-0 items-center justify-center overflow-hidden border border-[#dce3e5] bg-[#f2f5f5]">{preview ? <img src={preview} alt={`Xem trước ${label}`} className="max-h-full max-w-full object-contain" /> : <i className="fas fa-image text-xl text-[#9aabad]" aria-hidden="true" />}</div><div className="min-w-0"><h3 className="text-sm font-bold">{label}</h3><p className="mt-1 text-xs leading-5 text-[#60727a]">{hint}</p>{file && <p className="mt-1 truncate text-xs font-semibold text-[#116966]">{file.name}</p>}</div></div><div className="mt-3 flex flex-wrap items-center gap-3"><label className={`inline-flex cursor-pointer items-center gap-2 rounded border border-[#9fb6b8] px-3 py-2 text-xs font-semibold text-[#116966] ${disabled ? "pointer-events-none opacity-50" : ""}`}><i className="fas fa-upload" aria-hidden="true" />Chọn ảnh<input type="file" accept={accept} disabled={disabled} onChange={(event) => { onFile(event.target.files?.[0]); if (event.target.files?.[0]) onRemove(false); }} className="sr-only" /></label>{hasStoredImage && <label className="flex items-center gap-2 text-xs font-semibold text-red-700"><input type="checkbox" disabled={disabled || Boolean(file)} checked={removed} onChange={(event) => onRemove(event.target.checked)} className="size-4" />Xóa ảnh hiện tại</label>}</div>{error}</div>;
}

export default function AdminSiteSettingForm() {
  const user = useAuthStore((state) => state.user);
  const manageable = can(user, "settings.manage");
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [form, setForm] = useState<SiteSettingPayload>(editableSettings(DEFAULT_SITE_SETTINGS));
  const [files, setFiles] = useState<Record<"favicon" | "logo" | "footer_logo" | "admin_logo", File | undefined>>({ favicon: undefined, logo: undefined, footer_logo: undefined, admin_logo: undefined });
  const [removed, setRemoved] = useState<Record<"favicon" | "logo" | "footer_logo" | "admin_logo", boolean>>({ favicon: false, logo: false, footer_logo: false, admin_logo: false });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<ValidationErrors>({});
  const [reload, setReload] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    Promise.resolve().then(() => { setLoading(true); setError(null); return adminSiteSettingService.getSettings(controller.signal); })
      .then((data) => { setSettings(data); setForm(editableSettings(data)); })
      .catch((requestError) => { if (!axios.isCancel(requestError)) setError(normalizeApiError(requestError).message); })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [reload]);

  const set = (key: keyof SiteSettingPayload, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const setFile = (key: keyof typeof files, file?: File) => setFiles((current) => ({ ...current, [key]: file }));
  const setRemove = (key: keyof typeof removed, value: boolean) => setRemoved((current) => ({ ...current, [key]: value }));
  const errorFor = (field: string) => fieldErrors[field]?.map((message) => <span key={message} className="mt-1 block text-xs text-red-600">{message}</span>);
  const previews = {
    favicon: useFilePreview(files.favicon, settings?.favicon_url ?? null, removed.favicon),
    logo: useFilePreview(files.logo, settings?.logo_url ?? null, removed.logo),
    footer_logo: useFilePreview(files.footer_logo, settings?.footer_logo_url ?? null, removed.footer_logo),
    admin_logo: useFilePreview(files.admin_logo, settings?.admin_logo_url ?? null, removed.admin_logo),
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault(); setSaving(true); setFieldErrors({});
    try {
      const updated = await adminSiteSettingService.updateSettings({ ...form, ...files,
        remove_favicon: removed.favicon, remove_logo: removed.logo,
        remove_footer_logo: removed.footer_logo, remove_admin_logo: removed.admin_logo,
      });
      setSettings(updated); setForm(editableSettings(updated));
      setFiles({ favicon: undefined, logo: undefined, footer_logo: undefined, admin_logo: undefined });
      setRemoved({ favicon: false, logo: false, footer_logo: false, admin_logo: false });
      toast.success("Đã cập nhật cài đặt website.");
    } catch (requestError) {
      const apiError = normalizeApiError(requestError); setFieldErrors(apiError.fieldErrors); toast.error(apiError.message);
    } finally { setSaving(false); }
  };

  if (loading) return <LoadingState label="Đang tải cài đặt website..." />;
  if (error || !settings) return <ErrorState message={error ?? "Không thể tải cài đặt website."} onRetry={() => setReload((value) => value + 1)} />;
  return <section><header className="mb-5"><h1 className="text-xl font-bold">Cài đặt website</h1><p className="mt-1 text-sm text-[#60727a]">Thương hiệu, SEO mặc định và thông tin liên hệ dùng trên giao diện khách hàng.</p></header><form onSubmit={save} className="space-y-6">
    <section><div className="mb-3"><h2 className="font-bold">Màu thương hiệu</h2><p className="mt-1 text-xs text-[#60727a]">Bộ màu được áp dụng cho header, footer, tiêu đề, nút và các điểm nhấn trên giao diện khách hàng.</p></div><div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]"><div className="border-y border-[#dce3e5]"><ThemeColorInput label="Màu chủ đạo" description="Nút chính, liên kết và trạng thái đang chọn." value={form.site_primary_color} disabled={!manageable || saving} error={errorFor("site_primary_color")} onChange={(value) => set("site_primary_color", value)} /><ThemeColorInput label="Màu nền đậm" description="Footer, tiêu đề đậm và các mảng nội dung tối." value={form.site_secondary_color} disabled={!manageable || saving} error={errorFor("site_secondary_color")} onChange={(value) => set("site_secondary_color", value)} /><ThemeColorInput label="Màu nhấn" description="Icon, số dư và chi tiết cần thu hút chú ý." value={form.site_accent_color} disabled={!manageable || saving} error={errorFor("site_accent_color")} onChange={(value) => set("site_accent_color", value)} /></div><div className="overflow-hidden border border-[#dce3e5] bg-white" style={{ "--preview-primary": form.site_primary_color, "--preview-secondary": form.site_secondary_color, "--preview-accent": form.site_accent_color } as React.CSSProperties}><div className="flex items-center justify-between bg-[var(--preview-secondary)] px-4 py-3 text-white"><strong>{form.site_short_name || "WEBSITE"}</strong><span className="text-xs text-white/75">Xem trước bộ màu</span></div><div className="p-4"><p className="text-xs font-bold uppercase text-[var(--preview-primary)]">Dịch vụ nổi bật</p><h3 className="mt-1 text-lg font-bold text-[var(--preview-secondary)]">Giao diện đồng bộ thương hiệu</h3><p className="mt-2 text-sm text-[#60727a]">Màu được xem trực tiếp trước khi lưu.</p><div className="mt-4 flex items-center gap-3"><span className="inline-flex h-9 items-center bg-[var(--preview-primary)] px-3 text-xs font-bold text-white">Nút chính</span><i className="fas fa-star text-[var(--preview-accent)]" aria-hidden="true" /></div></div></div></div></section>
    <section><div className="mb-3"><h2 className="font-bold">Hình ảnh thương hiệu</h2><p className="mt-1 text-xs text-[#60727a]">Logo nhận JPG, PNG hoặc WebP tối đa 3 MB. Favicon nhận PNG hoặc ICO tối đa 1 MB.</p></div><div className="grid gap-3 md:grid-cols-2"><ImageSetting label="Favicon Icon" hint="Biểu tượng tab trình duyệt." preview={previews.favicon} file={files.favicon} removed={removed.favicon} hasStoredImage={Boolean(settings.favicon_url)} accept="image/png,image/x-icon,.ico" disabled={!manageable || saving} error={errorFor("favicon")} onFile={(file) => setFile("favicon", file)} onRemove={(value) => setRemove("favicon", value)} /><ImageSetting label="Logo Icon" hint="Logo chính trên header khách hàng." preview={previews.logo ?? "/images/logoweb.png"} file={files.logo} removed={removed.logo} hasStoredImage={Boolean(settings.logo_url)} accept="image/jpeg,image/png,image/webp" disabled={!manageable || saving} error={errorFor("logo")} onFile={(file) => setFile("logo", file)} onRemove={(value) => setRemove("logo", value)} /><ImageSetting label="Logo Footer" hint="Logo hiển thị trên nền footer tối." preview={previews.footer_logo ?? previews.logo ?? "/images/logoweb.png"} file={files.footer_logo} removed={removed.footer_logo} hasStoredImage={Boolean(settings.footer_logo_url)} accept="image/jpeg,image/png,image/webp" disabled={!manageable || saving} error={errorFor("footer_logo")} onFile={(file) => setFile("footer_logo", file)} onRemove={(value) => setRemove("footer_logo", value)} /><ImageSetting label="Logo Admin" hint="Logo riêng cho sidebar quản trị." preview={previews.admin_logo ?? previews.logo ?? "/images/logoweb.png"} file={files.admin_logo} removed={removed.admin_logo} hasStoredImage={Boolean(settings.admin_logo_url)} accept="image/jpeg,image/png,image/webp" disabled={!manageable || saving} error={errorFor("admin_logo")} onFile={(file) => setFile("admin_logo", file)} onRemove={(value) => setRemove("admin_logo", value)} /></div></section>
    <section className="border-t border-[#dce3e5] pt-5"><h2 className="mb-4 font-bold">Tên và SEO mặc định</h2><div className="grid gap-4 md:grid-cols-2"><label className="text-sm font-semibold">Tên website mặc định<input required disabled={!manageable} maxLength={120} value={form.site_name} onChange={(event) => set("site_name", event.target.value)} className={inputClass} />{errorFor("site_name")}</label><label className="text-sm font-semibold">Tên website rút gọn<input required disabled={!manageable} maxLength={40} value={form.site_short_name} onChange={(event) => set("site_short_name", event.target.value)} className={inputClass} />{errorFor("site_short_name")}</label><label className="text-sm font-semibold md:col-span-2">Từ khóa website mặc định<input disabled={!manageable} maxLength={500} value={form.site_keywords} onChange={(event) => set("site_keywords", event.target.value)} placeholder="mã nguồn, hosting, VPS" className={inputClass} />{errorFor("site_keywords")}</label><label className="text-sm font-semibold md:col-span-2">Mô tả website mặc định<textarea disabled={!manageable} rows={3} maxLength={1000} value={form.site_description} onChange={(event) => set("site_description", event.target.value)} className={textareaClass} />{errorFor("site_description")}</label></div></section>
    <section className="border-t border-[#dce3e5] pt-5"><h2 className="mb-4 font-bold">Liên hệ và pháp lý</h2><div className="grid gap-4 md:grid-cols-2"><label className="text-sm font-semibold md:col-span-2">Địa chỉ<input disabled={!manageable} maxLength={500} value={form.site_address} onChange={(event) => set("site_address", event.target.value)} className={inputClass} />{errorFor("site_address")}</label><label className="text-sm font-semibold">Hotline website<input disabled={!manageable} maxLength={50} value={form.site_hotline} onChange={(event) => set("site_hotline", event.target.value)} placeholder="0900 000 000" className={inputClass} />{errorFor("site_hotline")}</label><label className="text-sm font-semibold">Email website mặc định<input disabled={!manageable} type="email" maxLength={255} value={form.site_email} onChange={(event) => set("site_email", event.target.value)} className={inputClass} />{errorFor("site_email")}</label><label className="text-sm font-semibold">Facebook website<input disabled={!manageable} type="url" value={form.site_facebook_url} onChange={(event) => set("site_facebook_url", event.target.value)} placeholder="https://facebook.com/..." className={inputClass} />{errorFor("site_facebook_url")}</label><label className="text-sm font-semibold">Telegram liên hệ<input disabled={!manageable} value={form.site_telegram} onChange={(event) => set("site_telegram", event.target.value)} placeholder="@buycode hoặc https://t.me/buycode" className={inputClass} />{errorFor("site_telegram")}</label><label className="text-sm font-semibold md:col-span-2">Copyright website<input disabled={!manageable} maxLength={500} value={form.site_copyright} onChange={(event) => set("site_copyright", event.target.value)} className={inputClass} />{errorFor("site_copyright")}<span className="mt-1 block text-xs font-normal text-[#60727a]">Dùng <code>{"{year}"}</code> để tự động hiển thị năm hiện tại.</span></label></div></section>
    <section className="border-t border-[#dce3e5] pt-5"><div className="mb-4"><h2 className="flex items-center gap-2 font-bold"><i className="fas fa-code text-[#116966]" aria-hidden="true" />Mã tùy chỉnh website</h2><p className="mt-1 max-w-3xl text-xs leading-5 text-[#60727a]">Dùng cho CSS, JavaScript, mã theo dõi hoặc livechat. Nội dung được thực thi trên toàn bộ website, chỉ chèn mã từ nhà cung cấp đáng tin cậy.</p></div><div className="grid gap-4 xl:grid-cols-2"><div className="text-sm font-semibold"><label htmlFor="site-header-html" className="flex items-center gap-2"><i className="fas fa-arrow-up-from-bracket text-[#14827d]" aria-hidden="true" />Chèn Script/HTML trong thẻ Header</label><textarea id="site-header-html" aria-describedby="site-header-html-hint" disabled={!manageable} rows={12} maxLength={15000} spellCheck={false} value={form.site_header_html} onChange={(event) => set("site_header_html", event.target.value)} placeholder={'<style>...</style>\n<script src="https://..."></script>'} className={`${textareaClass} resize-y font-mono text-xs leading-5`} />{errorFor("site_header_html")}<p id="site-header-html-hint" className="mt-1 text-xs font-normal text-[#60727a]">Phù hợp cho CSS, thẻ xác minh, analytics hoặc script cần nạp sớm.</p></div><div className="text-sm font-semibold"><label htmlFor="site-footer-html" className="flex items-center gap-2"><i className="fas fa-arrow-down text-[#14827d]" aria-hidden="true" />Chèn Script/HTML ở chân web</label><textarea id="site-footer-html" aria-describedby="site-footer-html-hint" disabled={!manageable} rows={12} maxLength={15000} spellCheck={false} value={form.site_footer_html} onChange={(event) => set("site_footer_html", event.target.value)} placeholder={'<script>...</script>\n<!-- Livechat -->'} className={`${textareaClass} resize-y font-mono text-xs leading-5`} />{errorFor("site_footer_html")}<p id="site-footer-html-hint" className="mt-1 text-xs font-normal text-[#60727a]">Ưu tiên livechat và script không cần chặn quá trình hiển thị trang.</p></div></div><div className="mt-3 flex gap-2 border-l-4 border-[#e0a23a] bg-[#fff8e8] px-3 py-2.5 text-xs leading-5 text-[#72531a]"><i className="fas fa-triangle-exclamation mt-0.5" aria-hidden="true" /><p>Mã sai có thể làm hỏng giao diện hoặc ảnh hưởng bảo mật. Form quản trị không chạy thử đoạn mã này; hãy kiểm tra website sau khi lưu.</p></div></section>
    {manageable && <div className="sticky bottom-0 flex justify-end border-t border-[#dce3e5] bg-[#f6f8f9]/95 py-4 backdrop-blur"><button type="submit" disabled={saving || !form.site_name.trim() || !form.site_short_name.trim()} className="rounded bg-[#116966] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"><i className="fas fa-floppy-disk mr-2" aria-hidden="true" />{saving ? "Đang lưu..." : "Lưu cài đặt"}</button></div>}
  </form></section>;
}
