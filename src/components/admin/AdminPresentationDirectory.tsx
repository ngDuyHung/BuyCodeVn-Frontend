"use client";
/* eslint-disable @next/next/no-img-element */

import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import ErrorState from "@/components/shared/ErrorState";
import LoadingState from "@/components/shared/LoadingState";
import HeroSection from "@/components/client/features/HeroSection";
import { useDialogAccessibility } from "@/hooks/useDialogAccessibility";
import { can } from "@/lib/admin-permissions";
import { normalizeApiError } from "@/lib/api-error";
import { formatDate } from "@/lib/format";
import { adminPresentationService } from "@/services/admin/adminPresentationService";
import { useAuthStore } from "@/stores/authStore";
import type { ValidationErrors } from "@/types/api";
import type { AdminPresentationSlide, PresentationAlignment, PresentationHighlight, PresentationLayout, PresentationSlide, PresentationSlidePayload, PresentationTheme } from "@/types/presentation";
import AdminConfirmDialog from "./AdminConfirmDialog";
import AdminDataTable from "./AdminDataTable";
import AdminFilterBar from "./AdminFilterBar";
import AdminFormField from "./AdminFormField";

const inputClass = "mt-1 h-10 w-full rounded border border-[#cbd6d8] bg-white px-3 font-normal text-[#172b35]";
const textareaClass = "mt-1 w-full rounded border border-[#cbd6d8] bg-white px-3 py-2 font-normal text-[#172b35]";
const defaultHighlights: PresentationHighlight[] = [
  { icon: "fa-award", label: "Chất lượng đảm bảo" },
  { icon: "fa-tachometer-alt", label: "Tốc độ vượt trội" },
  { icon: "fa-shield-alt", label: "Bảo mật an toàn" },
  { icon: "fa-headset", label: "Hỗ trợ 24/7" },
];
const highlightIcons = [
  ["fa-award", "Huy hiệu"], ["fa-tachometer-alt", "Tốc độ"], ["fa-shield-alt", "Bảo mật"],
  ["fa-headset", "Hỗ trợ"], ["fa-server", "Máy chủ"], ["fa-cloud", "Đám mây"],
  ["fa-code", "Mã nguồn"], ["fa-bolt", "Hiệu năng"], ["fa-check-circle", "Đã xác thực"],
] as const;

function useFilePreview(file: File | undefined, fallback: string) {
  const objectUrl = useMemo(() => file ? URL.createObjectURL(file) : "", [file]);
  useEffect(() => () => { if (objectUrl) URL.revokeObjectURL(objectUrl); }, [objectUrl]);
  return objectUrl || fallback;
}

const toLocalDateTime = (value: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
};

function SlideDialog({ slide, busy, errors, onClose, onSubmit }: {
  slide: AdminPresentationSlide | null;
  busy: boolean;
  errors: ValidationErrors;
  onClose: () => void;
  onSubmit: (payload: PresentationSlidePayload) => void;
}) {
  const dialogRef = useDialogAccessibility(true, onClose, !busy);
  const [internalName, setInternalName] = useState(slide?.internal_name ?? "");
  const [eyebrow, setEyebrow] = useState(slide?.eyebrow ?? "");
  const [title, setTitle] = useState(slide?.title ?? "");
  const [description, setDescription] = useState(slide?.description ?? "");
  const [desktopUrl, setDesktopUrl] = useState(slide?.desktop_image_url ?? "");
  const [mobileUrl, setMobileUrl] = useState(slide?.mobile_image_url ?? "");
  const [desktopFile, setDesktopFile] = useState<File>();
  const [mobileFile, setMobileFile] = useState<File>();
  const [removeMobile, setRemoveMobile] = useState(false);
  const [imageAlt, setImageAlt] = useState(slide?.image_alt ?? "");
  const [primaryLabel, setPrimaryLabel] = useState(slide?.primary_cta?.label ?? "");
  const [primaryUrl, setPrimaryUrl] = useState(slide?.primary_cta?.url ?? "");
  const [secondaryLabel, setSecondaryLabel] = useState(slide?.secondary_cta?.label ?? "");
  const [secondaryUrl, setSecondaryUrl] = useState(slide?.secondary_cta?.url ?? "");
  const [highlights, setHighlights] = useState<PresentationHighlight[]>(slide?.highlights ?? defaultHighlights);
  const [layout, setLayout] = useState<PresentationLayout>(slide?.layout ?? "split");
  const [alignment, setAlignment] = useState<PresentationAlignment>(slide?.content_alignment ?? "left");
  const [theme, setTheme] = useState<PresentationTheme>(slide?.theme ?? "light");
  const [overlay, setOverlay] = useState(slide?.overlay_opacity ?? 25);
  const [sortOrder, setSortOrder] = useState(slide?.sort_order ?? 0);
  const [active, setActive] = useState(slide?.is_active ?? true);
  const [startsAt, setStartsAt] = useState(toLocalDateTime(slide?.starts_at ?? null));
  const [endsAt, setEndsAt] = useState(toLocalDateTime(slide?.ends_at ?? null));
  const [localError, setLocalError] = useState("");
  const errorFor = (field: string) => errors[field]?.map((message) => <span key={message} className="mt-1 block text-xs text-red-600">{message}</span>);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!slide && !desktopFile && !desktopUrl.trim()) {
      setLocalError("Hãy chọn ảnh desktop hoặc nhập URL ảnh.");
      return;
    }
    if (startsAt && endsAt && new Date(endsAt) <= new Date(startsAt)) {
      setLocalError("Thời gian kết thúc phải sau thời gian bắt đầu.");
      return;
    }
    setLocalError("");
    const payload: PresentationSlidePayload = {
      placement: "home_hero", internal_name: internalName.trim(), eyebrow: eyebrow.trim(), title: title.trim(),
      description: description.trim(), image_alt: imageAlt.trim(), layout, content_alignment: alignment,
      theme, overlay_opacity: overlay, sort_order: sortOrder, is_active: active,
      primary_cta_label: primaryLabel.trim(), primary_cta_url: primaryUrl.trim(),
      secondary_cta_label: secondaryLabel.trim(), secondary_cta_url: secondaryUrl.trim(),
      highlights: highlights.map((highlight) => ({ icon: highlight.icon, label: highlight.label.trim() })).filter((highlight) => highlight.label),
      starts_at: startsAt ? new Date(startsAt).toISOString() : "", ends_at: endsAt ? new Date(endsAt).toISOString() : "",
    };
    if (desktopFile) payload.desktop_image = desktopFile;
    else if (!slide || desktopUrl !== slide.desktop_image_url) payload.desktop_image_url = desktopUrl.trim();
    if (mobileFile) payload.mobile_image = mobileFile;
    else if (!slide || mobileUrl !== (slide.mobile_image_url ?? "")) payload.mobile_image_url = mobileUrl.trim();
    if (removeMobile) payload.remove_mobile_image = true;
    onSubmit(payload);
  };

  const previewImage = useFilePreview(desktopFile, desktopUrl);
  const previewMobileImage = useFilePreview(mobileFile, mobileUrl);
  const liveSlide: PresentationSlide = {
    id: slide?.id ?? 0, placement: "home_hero", eyebrow: eyebrow || null, title: title || "Tiêu đề slide",
    description: description || null, desktop_image_url: previewImage || "/images/banner_hero.webp",
    mobile_image_url: removeMobile ? null : previewMobileImage || null, image_alt: imageAlt || title || "Xem trước slide",
    primary_cta: primaryLabel && primaryUrl ? { label: primaryLabel, url: primaryUrl } : null,
    secondary_cta: secondaryLabel && secondaryUrl ? { label: secondaryLabel, url: secondaryUrl } : null,
    highlights: highlights.filter((highlight) => highlight.label.trim()),
    layout, content_alignment: alignment, theme, overlay_opacity: overlay,
  };
  return <div ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="slide-dialog-title" className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-3 md:p-5" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) onClose(); }}>
    <form onSubmit={submit} className="max-h-[94vh] w-full max-w-5xl overflow-y-auto rounded-md bg-white shadow-xl">
      <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-[#dce3e5] bg-white px-5 py-4">
        <div><h2 id="slide-dialog-title" className="text-lg font-bold">{slide ? "Chỉnh sửa slide" : "Thêm slide trình diễn"}</h2><p className="mt-1 text-sm text-[#60727a]">Cấu hình nội dung hero trang chủ cho desktop và thiết bị di động.</p></div>
        <button type="button" aria-label="Đóng" disabled={busy} onClick={onClose} className="size-8 text-[#52636c]"><i className="fas fa-xmark" aria-hidden="true" /></button>
      </header>
      <div className="grid gap-6 p-5 xl:grid-cols-[minmax(420px,0.9fr)_minmax(520px,1.1fr)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-semibold sm:col-span-2">Tên quản trị<input autoFocus required maxLength={255} value={internalName} onChange={(event) => setInternalName(event.target.value)} className={inputClass} />{errorFor("internal_name")}</label>
          <label className="text-sm font-semibold">Nhãn nhỏ<input maxLength={120} value={eyebrow} onChange={(event) => setEyebrow(event.target.value)} placeholder="Nền tảng uy tín" className={inputClass} />{errorFor("eyebrow")}</label>
          <label className="text-sm font-semibold">Tiêu đề<input required maxLength={255} value={title} onChange={(event) => setTitle(event.target.value)} className={inputClass} />{errorFor("title")}</label>
          <label className="text-sm font-semibold sm:col-span-2">Mô tả<textarea rows={3} maxLength={1000} value={description} onChange={(event) => setDescription(event.target.value)} className={textareaClass} />{errorFor("description")}</label>

          <div className="border-t border-[#dce3e5] pt-4 sm:col-span-2"><h3 className="font-bold">Hình ảnh</h3><p className="mt-1 text-xs text-[#60727a]">Dùng file hoặc URL cho mỗi kích thước. Desktop tối thiểu 800×300; mobile tối thiểu 360×360.</p></div>
          <label className="text-sm font-semibold">Ảnh desktop<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => { setDesktopFile(event.target.files?.[0]); if (event.target.files?.[0]) setDesktopUrl(""); }} className="mt-1 block w-full text-xs file:mr-3 file:rounded file:border-0 file:bg-[#e5f2f0] file:px-3 file:py-2 file:font-semibold file:text-[#0d6260]" />{errorFor("desktop_image")}</label>
          <label className="text-sm font-semibold">URL ảnh desktop<input type="url" disabled={Boolean(desktopFile)} value={desktopUrl} onChange={(event) => setDesktopUrl(event.target.value)} placeholder="https://..." className={`${inputClass} disabled:bg-[#f1f5f9]`} />{errorFor("desktop_image_url")}</label>
          <label className="text-sm font-semibold">Ảnh mobile<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => { setMobileFile(event.target.files?.[0]); if (event.target.files?.[0]) { setMobileUrl(""); setRemoveMobile(false); } }} className="mt-1 block w-full text-xs file:mr-3 file:rounded file:border-0 file:bg-[#e5f2f0] file:px-3 file:py-2 file:font-semibold file:text-[#0d6260]" />{errorFor("mobile_image")}</label>
          <label className="text-sm font-semibold">URL ảnh mobile<input type="url" disabled={Boolean(mobileFile) || removeMobile} value={mobileUrl} onChange={(event) => { setMobileUrl(event.target.value); setRemoveMobile(false); }} placeholder="Tùy chọn" className={`${inputClass} disabled:bg-[#f1f5f9]`} />{errorFor("mobile_image_url")}</label>
          {slide?.mobile_image_url && <label className="flex items-center gap-2 text-sm sm:col-span-2"><input type="checkbox" checked={removeMobile} onChange={(event) => { setRemoveMobile(event.target.checked); if (event.target.checked) { setMobileFile(undefined); setMobileUrl(""); } }} className="size-4 accent-[#116966]" />Xóa ảnh mobile hiện tại và dùng ảnh desktop</label>}
          <label className="text-sm font-semibold sm:col-span-2">Mô tả ảnh<input maxLength={255} value={imageAlt} onChange={(event) => setImageAlt(event.target.value)} placeholder="Mô tả ngắn cho trình đọc màn hình" className={inputClass} />{errorFor("image_alt")}</label>

          <div className="border-t border-[#dce3e5] pt-4 sm:col-span-2"><h3 className="font-bold">Nút hành động</h3></div>
          <label className="text-sm font-semibold">Nút chính<input maxLength={80} value={primaryLabel} onChange={(event) => setPrimaryLabel(event.target.value)} placeholder="Khám phá ngay" className={inputClass} />{errorFor("primary_cta_label")}</label>
          <label className="text-sm font-semibold">Liên kết nút chính<input value={primaryUrl} onChange={(event) => setPrimaryUrl(event.target.value)} placeholder="/source-code" className={inputClass} />{errorFor("primary_cta_url")}</label>
          <label className="text-sm font-semibold">Nút phụ<input maxLength={80} value={secondaryLabel} onChange={(event) => setSecondaryLabel(event.target.value)} placeholder="Xem hosting" className={inputClass} />{errorFor("secondary_cta_label")}</label>
          <label className="text-sm font-semibold">Liên kết nút phụ<input value={secondaryUrl} onChange={(event) => setSecondaryUrl(event.target.value)} placeholder="/hosting" className={inputClass} />{errorFor("secondary_cta_url")}</label>

          <div className="border-t border-[#dce3e5] pt-4 sm:col-span-2">
            <div className="flex items-center justify-between gap-3"><div><h3 className="font-bold">Điểm nổi bật dưới nút</h3><p className="mt-1 text-xs text-[#60727a]">Tối đa 4 icon. Thay đổi được phản ánh ngay ở bản xem trước.</p></div><button type="button" title="Thêm điểm nổi bật" aria-label="Thêm điểm nổi bật" disabled={highlights.length >= 4} onClick={() => setHighlights((current) => [...current, { icon: "fa-check-circle", label: "" }])} className="size-9 shrink-0 rounded border border-[#b8c8cc] text-[#116966] disabled:opacity-35"><i className="fas fa-plus" aria-hidden="true" /></button></div>
            <div className="mt-3 grid gap-2">
              {highlights.map((highlight, index) => <div key={index} className="grid grid-cols-[minmax(120px,0.8fr)_minmax(150px,1.2fr)_36px] items-center gap-2">
                <label className="sr-only" htmlFor={`highlight-icon-${index}`}>Icon điểm nổi bật {index + 1}</label>
                <div className="relative"><i className={`fas ${highlight.icon} pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#116966]`} aria-hidden="true" /><select id={`highlight-icon-${index}`} value={highlight.icon} onChange={(event) => setHighlights((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, icon: event.target.value } : item))} className="h-10 w-full rounded border border-[#cbd6d8] bg-white pl-9 pr-2 text-sm font-normal">{highlightIcons.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
                <label className="sr-only" htmlFor={`highlight-label-${index}`}>Nhãn điểm nổi bật {index + 1}</label>
                <input id={`highlight-label-${index}`} required maxLength={80} value={highlight.label} onChange={(event) => setHighlights((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, label: event.target.value } : item))} placeholder="Nội dung điểm nổi bật" className="h-10 min-w-0 rounded border border-[#cbd6d8] px-3 text-sm font-normal" />
                <button type="button" title="Xóa điểm nổi bật" aria-label={`Xóa điểm nổi bật ${index + 1}`} onClick={() => setHighlights((current) => current.filter((_, itemIndex) => itemIndex !== index))} className="size-9 text-red-700"><i className="fas fa-trash" aria-hidden="true" /></button>
                {errorFor(`highlights.${index}.icon`)}{errorFor(`highlights.${index}.label`)}
              </div>)}
              {highlights.length === 0 && <p className="py-2 text-sm text-[#60727a]">Slide này không hiển thị điểm nổi bật.</p>}
            </div>
          </div>

          <div className="border-t border-[#dce3e5] pt-4 sm:col-span-2"><h3 className="font-bold">Giao diện và lịch</h3></div>
          <label className="text-sm font-semibold">Bố cục<select value={layout} onChange={(event) => setLayout(event.target.value as PresentationLayout)} className={inputClass}><option value="split">Ảnh và nội dung tách cột</option><option value="cover">Ảnh phủ toàn chiều ngang</option></select></label>
          <label className="text-sm font-semibold">Căn nội dung<select value={alignment} onChange={(event) => setAlignment(event.target.value as PresentationAlignment)} className={inputClass}><option value="left">Bên trái</option><option value="center">Chính giữa</option><option value="right">Bên phải</option></select></label>
          <label className="text-sm font-semibold">Màu chữ<select value={theme} onChange={(event) => setTheme(event.target.value as PresentationTheme)} className={inputClass}><option value="light">Tối trên nền sáng</option><option value="dark">Sáng trên nền tối</option></select></label>
          <label className="text-sm font-semibold">Độ phủ nền: {overlay}%<input aria-label="Độ phủ nền" type="range" min="0" max="90" value={overlay} onChange={(event) => setOverlay(Number(event.target.value))} className="mt-3 w-full accent-[#116966]" /></label>
          <label className="text-sm font-semibold">Bắt đầu<input type="datetime-local" value={startsAt} onChange={(event) => setStartsAt(event.target.value)} className={inputClass} />{errorFor("starts_at")}</label>
          <label className="text-sm font-semibold">Kết thúc<input type="datetime-local" value={endsAt} onChange={(event) => setEndsAt(event.target.value)} className={inputClass} />{errorFor("ends_at")}</label>
          <label className="text-sm font-semibold">Thứ tự<input type="number" min="0" max="100000" value={sortOrder} onChange={(event) => setSortOrder(Number(event.target.value))} className={inputClass} />{errorFor("sort_order")}</label>
          <label className="flex items-center gap-2 self-end pb-2 text-sm font-semibold"><input type="checkbox" checked={active} onChange={(event) => setActive(event.target.checked)} className="size-4 accent-[#116966]" />Đang hiển thị</label>
          {localError && <p role="alert" className="rounded bg-red-50 px-3 py-2 text-sm text-red-700 sm:col-span-2">{localError}</p>}
        </div>
        <aside className="min-w-0 xl:sticky xl:top-24 xl:self-start"><div className="mb-2 flex items-center justify-between"><p className="text-xs font-bold uppercase text-[#60727a]">Xem trước hero trực tiếp</p><span className="rounded bg-[#e5f2f0] px-2 py-1 text-[11px] font-semibold text-[#0d6260]">Desktop</span></div><div className="overflow-hidden rounded border border-[#cbd6d8] bg-white shadow-sm"><HeroSection slides={[liveSlide]} preview /></div><p className="mt-2 text-xs leading-5 text-[#60727a]">Nội dung, màu chữ, bố cục, độ phủ và nút bấm cập nhật ngay khi chỉnh cấu hình.</p></aside>
      </div>
      <footer className="sticky bottom-0 flex justify-end gap-2 border-t border-[#dce3e5] bg-white px-5 py-4"><button type="button" disabled={busy} onClick={onClose} className="rounded border border-[#cbd6d8] px-4 py-2 text-sm font-semibold">Hủy</button><button type="submit" disabled={busy || !internalName.trim() || !title.trim()} className="rounded bg-[#116966] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{busy ? "Đang lưu..." : "Lưu slide"}</button></footer>
    </form>
  </div>;
}

const scheduleLabel = (slide: AdminPresentationSlide) => {
  const now = Date.now();
  if (!slide.is_active) return "Đã tắt";
  if (slide.starts_at && new Date(slide.starts_at).getTime() > now) return "Đã lên lịch";
  if (slide.ends_at && new Date(slide.ends_at).getTime() <= now) return "Đã hết hạn";
  return "Đang hiển thị";
};

export default function AdminPresentationDirectory() {
  const user = useAuthStore((state) => state.user);
  const manageable = can(user, "settings.manage");
  const [slides, setSlides] = useState<AdminPresentationSlide[]>([]);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<AdminPresentationSlide | null | undefined>(undefined);
  const [deleting, setDeleting] = useState<AdminPresentationSlide | null>(null);
  const [busy, setBusy] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<ValidationErrors>({});
  const [reload, setReload] = useState(0);
  const query = useMemo(() => ({ placement: "home_hero" as const, per_page: 100, ...(search ? { search } : {}), ...(activeFilter ? { is_active: activeFilter === "1" ? 1 as const : 0 as const } : {}) }), [activeFilter, search]);
  const load = useCallback(async (signal?: AbortSignal) => setSlides((await adminPresentationService.getSlides(query, signal)).data), [query]);

  useEffect(() => {
    const controller = new AbortController();
    Promise.resolve().then(() => { setLoading(true); setError(null); return load(controller.signal); })
      .catch((requestError) => { if (!axios.isCancel(requestError)) setError(normalizeApiError(requestError).message); })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [load, reload]);

  const save = async (payload: PresentationSlidePayload) => {
    setBusy(true); setFieldErrors({});
    try {
      if (editing) await adminPresentationService.updateSlide(editing.id, payload);
      else await adminPresentationService.createSlide(payload);
      toast.success(editing ? "Đã cập nhật slide." : "Đã tạo slide.");
      setEditing(undefined); await load();
    } catch (requestError) {
      const apiError = normalizeApiError(requestError); setFieldErrors(apiError.fieldErrors); toast.error(apiError.message);
    } finally { setBusy(false); }
  };

  const remove = async () => {
    if (!deleting) return;
    setBusy(true);
    try { await adminPresentationService.deleteSlide(deleting.id); toast.success("Đã xóa slide."); setDeleting(null); await load(); }
    catch (requestError) { toast.error(normalizeApiError(requestError).message); }
    finally { setBusy(false); }
  };

  const move = async (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= slides.length) return;
    const reordered = [...slides];
    [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];
    const normalized = reordered.map((slide, position) => ({ ...slide, sort_order: (position + 1) * 10 }));
    setSlides(normalized); setBusy(true);
    try { await adminPresentationService.reorderSlides(normalized.map(({ id, sort_order }) => ({ id, sort_order }))); toast.success("Đã cập nhật thứ tự."); }
    catch (requestError) { toast.error(normalizeApiError(requestError).message); await load(); }
    finally { setBusy(false); }
  };

  return <section>
    <header className="mb-5 flex flex-wrap items-end justify-between gap-3"><div><h1 className="text-xl font-bold">Trình diễn ảnh</h1><p className="mt-1 text-sm text-[#60727a]">Quản lý nội dung, hình ảnh và lịch hiển thị hero trang chủ.</p></div>{manageable && <button type="button" onClick={() => { setFieldErrors({}); setEditing(null); }} className="h-9 rounded bg-[#116966] px-4 text-sm font-semibold text-white"><i className="fas fa-plus mr-2" aria-hidden="true" />Thêm slide</button>}</header>
    <AdminFilterBar onSubmit={(event) => event.preventDefault()}><AdminFormField id="slide-search" label="Tìm kiếm" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tên quản trị hoặc tiêu đề" /><label className="text-xs font-semibold text-[#52636c]">Trạng thái<select value={activeFilter} onChange={(event) => setActiveFilter(event.target.value)} className="mt-1 h-9 rounded border border-[#cbd6d8] bg-white px-3 text-sm font-normal"><option value="">Tất cả</option><option value="1">Đang bật</option><option value="0">Đã tắt</option></select></label><span className="self-end pb-2 text-xs text-[#60727a]">{slides.length} slide</span></AdminFilterBar>
    {loading ? <LoadingState label="Đang tải slide..." /> : error ? <ErrorState message={error} onRetry={() => setReload((value) => value + 1)} /> : <AdminDataTable rows={slides} rowKey={(slide) => slide.id} emptyMessage="Chưa có slide trình diễn." columns={[
      { key: "preview", header: "Ảnh", render: (slide) => <div className="h-16 w-28 overflow-hidden rounded border border-[#dce3e5] bg-[#eef2f3]"><img src={slide.desktop_image_url} alt={slide.image_alt} className="h-full w-full object-cover" /></div> },
      { key: "content", header: "Nội dung", render: (slide) => <div className="min-w-52"><strong>{slide.internal_name}</strong><span className="mt-1 block text-xs text-[#60727a]">{slide.title}</span><span className="mt-1 block text-xs">{slide.layout === "split" ? "Tách cột" : "Ảnh phủ"} · thứ tự {slide.sort_order}</span></div> },
      { key: "status", header: "Hiển thị", render: (slide) => <div><span className={`font-semibold ${scheduleLabel(slide) === "Đang hiển thị" ? "text-emerald-700" : "text-[#60727a]"}`}>{scheduleLabel(slide)}</span><span className="mt-1 block whitespace-nowrap text-xs text-[#60727a]">{slide.starts_at ? formatDate(slide.starts_at) : "Không giới hạn bắt đầu"}</span></div> },
      { key: "actions", header: "Thao tác", render: (slide) => <div className="flex items-center whitespace-nowrap">{manageable && <><button type="button" title="Đưa lên" aria-label={`Đưa ${slide.internal_name} lên`} disabled={busy || slides[0]?.id === slide.id || Boolean(search || activeFilter)} onClick={() => void move(slides.indexOf(slide), -1)} className="size-8 text-[#52636c] disabled:opacity-25"><i className="fas fa-arrow-up" aria-hidden="true" /></button><button type="button" title="Đưa xuống" aria-label={`Đưa ${slide.internal_name} xuống`} disabled={busy || slides.at(-1)?.id === slide.id || Boolean(search || activeFilter)} onClick={() => void move(slides.indexOf(slide), 1)} className="size-8 text-[#52636c] disabled:opacity-25"><i className="fas fa-arrow-down" aria-hidden="true" /></button><button type="button" title="Chỉnh sửa" aria-label={`Chỉnh sửa ${slide.internal_name}`} onClick={() => { setFieldErrors({}); setEditing(slide); }} className="size-8 text-[#116966]"><i className="fas fa-pen" aria-hidden="true" /></button><button type="button" title="Xóa" aria-label={`Xóa ${slide.internal_name}`} onClick={() => setDeleting(slide)} className="size-8 text-red-700"><i className="fas fa-trash" aria-hidden="true" /></button></>}</div> },
    ]} />}
    {editing !== undefined && <SlideDialog slide={editing} busy={busy} errors={fieldErrors} onClose={() => setEditing(undefined)} onSubmit={save} />}
    {deleting && <AdminConfirmDialog title="Xóa slide trình diễn" message={`Slide “${deleting.internal_name}” và các ảnh đã upload sẽ bị xóa vĩnh viễn.`} confirmLabel="Xóa slide" destructive busy={busy} onClose={() => setDeleting(null)} onConfirm={() => void remove()} />}
  </section>;
}
