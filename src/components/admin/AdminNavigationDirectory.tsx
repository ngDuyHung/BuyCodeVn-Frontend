"use client";

import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import ErrorState from "@/components/shared/ErrorState";
import LoadingState from "@/components/shared/LoadingState";
import { useDialogAccessibility } from "@/hooks/useDialogAccessibility";
import { can } from "@/lib/admin-permissions";
import { normalizeApiError } from "@/lib/api-error";
import { adminNavigationService } from "@/services/admin/adminNavigationService";
import { useAuthStore } from "@/stores/authStore";
import type { ValidationErrors } from "@/types/api";
import type { AdminNavigationItem, NavigationItemPayload, NavigationPlacement, NavigationTarget } from "@/types/navigation";
import AdminConfirmDialog from "./AdminConfirmDialog";
import AdminDataTable from "./AdminDataTable";

const inputClass = "mt-1 h-10 w-full rounded border border-[#cbd6d8] bg-white px-3 font-normal";

function NavigationDialog({ item, roots, busy, errors, placement, onClose, onSubmit }: {
  item: AdminNavigationItem | null; roots: AdminNavigationItem[]; busy: boolean; errors: ValidationErrors;
  placement: NavigationPlacement; onClose: () => void; onSubmit: (payload: NavigationItemPayload) => void;
}) {
  const ref = useDialogAccessibility(true, onClose, !busy);
  const [form, setForm] = useState<NavigationItemPayload>({
    placement: item?.placement ?? placement, parent_id: item?.parent_id ?? null, label: item?.label ?? "",
    url: item?.url ?? "", icon: item?.icon ?? "", target: item?.target ?? "_self",
    sort_order: item?.sort_order ?? 0, is_active: item?.is_active ?? true,
  });
  const set = <K extends keyof NavigationItemPayload>(key: K, value: NavigationItemPayload[K]) => setForm((current) => ({ ...current, [key]: value }));
  const availableRoots = roots.filter((root) => root.parent_id === null && root.id !== item?.id && root.placement === form.placement);
  const hasChildren = Boolean(item && roots.some((candidate) => candidate.parent_id === item.id));
  const errorFor = (field: string) => errors[field]?.map((message) => <span key={message} className="mt-1 block text-xs text-red-600">{message}</span>);
  return <div ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="navigation-dialog-title" className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) onClose(); }}><form onSubmit={(event) => { event.preventDefault(); onSubmit({ ...form, label: form.label.trim(), url: form.url.trim(), icon: form.icon.trim() }); }} className="w-full max-w-2xl rounded-md bg-white p-5 shadow-xl"><div className="flex items-start justify-between gap-4"><div><h2 id="navigation-dialog-title" className="text-lg font-bold">{item ? "Chỉnh sửa mục menu" : "Thêm mục menu"}</h2><p className="mt-1 text-sm text-[#60727a]">Nhóm cha có thể để trống URL; menu hỗ trợ tối đa hai cấp.</p></div><button type="button" aria-label="Đóng" onClick={onClose} disabled={busy} className="size-8"><i className="fas fa-xmark" aria-hidden="true" /></button></div><div className="mt-5 grid gap-4 sm:grid-cols-2">
    <label className="text-sm font-semibold">Vị trí<select value={form.placement} disabled={hasChildren} onChange={(event) => set("placement", event.target.value as NavigationPlacement)} className={`${inputClass} disabled:bg-[#f1f5f9]`}><option value="header">Header</option><option value="footer">Footer</option></select>{errorFor("placement")}</label>
    <label className="text-sm font-semibold">Nhóm cha<select value={form.parent_id ?? ""} disabled={hasChildren} onChange={(event) => set("parent_id", event.target.value ? Number(event.target.value) : null)} className={`${inputClass} disabled:bg-[#f1f5f9]`}><option value="">Không có - mục cấp một</option>{availableRoots.map((root) => <option key={root.id} value={root.id}>{root.label}</option>)}</select>{errorFor("parent_id")}</label>
    <label className="text-sm font-semibold">Tên hiển thị<input autoFocus required maxLength={120} value={form.label} onChange={(event) => set("label", event.target.value)} className={inputClass} />{errorFor("label")}</label>
    <label className="text-sm font-semibold">URL<input value={form.url} onChange={(event) => set("url", event.target.value)} placeholder="/hosting hoặc https://..." className={inputClass} />{errorFor("url")}</label>
    <label className="text-sm font-semibold">Icon Font Awesome<input value={form.icon} onChange={(event) => set("icon", event.target.value)} placeholder="fa-server" pattern="fa-[a-z0-9-]+" className={inputClass} />{errorFor("icon")}</label>
    <label className="text-sm font-semibold">Cách mở<select value={form.target} onChange={(event) => set("target", event.target.value as NavigationTarget)} className={inputClass}><option value="_self">Cùng cửa sổ</option><option value="_blank">Cửa sổ mới</option></select></label>
    <label className="text-sm font-semibold">Thứ tự<input type="number" min="0" max="100000" value={form.sort_order} onChange={(event) => set("sort_order", Number(event.target.value))} className={inputClass} />{errorFor("sort_order")}</label>
    <label className="flex items-center gap-2 self-end pb-2 text-sm font-semibold"><input type="checkbox" checked={form.is_active} onChange={(event) => set("is_active", event.target.checked)} className="size-4 accent-[#116966]" />Đang hiển thị</label>
  </div><div className="mt-6 flex justify-end gap-2"><button type="button" disabled={busy} onClick={onClose} className="rounded border border-[#cbd6d8] px-4 py-2 text-sm font-semibold">Hủy</button><button type="submit" disabled={busy || !form.label.trim()} className="rounded bg-[#116966] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{busy ? "Đang lưu..." : "Lưu mục menu"}</button></div></form></div>;
}

export default function AdminNavigationDirectory() {
  const user = useAuthStore((state) => state.user);
  const manageable = can(user, "settings.manage");
  const [placement, setPlacement] = useState<NavigationPlacement>("header");
  const [items, setItems] = useState<AdminNavigationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<AdminNavigationItem | null | undefined>(undefined);
  const [deleting, setDeleting] = useState<AdminNavigationItem | null>(null);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [reload, setReload] = useState(0);
  const load = useCallback(async (signal?: AbortSignal) => setItems(await adminNavigationService.getItems({}, signal)), []);
  useEffect(() => { const controller = new AbortController(); Promise.resolve().then(() => { setLoading(true); setError(null); return load(controller.signal); }).catch((requestError) => { if (!axios.isCancel(requestError)) setError(normalizeApiError(requestError).message); }).finally(() => setLoading(false)); return () => controller.abort(); }, [load, reload]);
  const roots = useMemo(() => items.filter((item) => item.parent_id === null), [items]);
  const displayed = useMemo(() => {
    const currentRoots = roots.filter((item) => item.placement === placement).sort((a, b) => a.sort_order - b.sort_order);
    return currentRoots.flatMap((root) => [root, ...items.filter((item) => item.parent_id === root.id).sort((a, b) => a.sort_order - b.sort_order)]);
  }, [items, placement, roots]);

  const save = async (payload: NavigationItemPayload) => { setBusy(true); setErrors({}); try { if (editing) await adminNavigationService.updateItem(editing.id, payload); else await adminNavigationService.createItem(payload); toast.success(editing ? "Đã cập nhật mục menu." : "Đã tạo mục menu."); setEditing(undefined); await load(); } catch (requestError) { const apiError = normalizeApiError(requestError); setErrors(apiError.fieldErrors); toast.error(apiError.message); } finally { setBusy(false); } };
  const remove = async () => { if (!deleting) return; setBusy(true); try { await adminNavigationService.deleteItem(deleting.id); toast.success("Đã xóa mục menu."); setDeleting(null); await load(); } catch (requestError) { toast.error(normalizeApiError(requestError).message); } finally { setBusy(false); } };
  const move = async (item: AdminNavigationItem, direction: -1 | 1) => {
    const siblings = items.filter((candidate) => candidate.placement === item.placement && candidate.parent_id === item.parent_id).sort((a, b) => a.sort_order - b.sort_order);
    const index = siblings.findIndex((candidate) => candidate.id === item.id), target = index + direction;
    if (target < 0 || target >= siblings.length) return;
    [siblings[index], siblings[target]] = [siblings[target], siblings[index]];
    const order = siblings.map((candidate, position) => ({ id: candidate.id, sort_order: (position + 1) * 10 }));
    setBusy(true); try { await adminNavigationService.reorderItems(order); await load(); } catch (requestError) { toast.error(normalizeApiError(requestError).message); } finally { setBusy(false); }
  };

  const activeRoots = displayed.filter((item) => item.parent_id === null && item.is_active);
  return <section><header className="mb-5 flex flex-wrap items-end justify-between gap-3"><div><h1 className="text-xl font-bold">Danh mục menu</h1><p className="mt-1 text-sm text-[#60727a]">Quản lý điều hướng động cho header và các cột liên kết footer.</p></div>{manageable && <button type="button" onClick={() => { setErrors({}); setEditing(null); }} className="h-9 rounded bg-[#116966] px-4 text-sm font-semibold text-white"><i className="fas fa-plus mr-2" aria-hidden="true" />Thêm mục menu</button>}</header>
    <div className="mb-4 flex w-fit border border-[#cbd6d8] bg-white p-1"><button type="button" onClick={() => setPlacement("header")} className={`h-8 px-4 text-sm font-semibold ${placement === "header" ? "bg-[#116966] text-white" : "text-[#52636c]"}`}>Header</button><button type="button" onClick={() => setPlacement("footer")} className={`h-8 px-4 text-sm font-semibold ${placement === "footer" ? "bg-[#116966] text-white" : "text-[#52636c]"}`}>Footer</button></div>
    <div className={`mb-5 border border-[#dce3e5] p-4 ${placement === "header" ? "bg-white" : "bg-[#102c35]"}`}><p className={`mb-3 text-xs font-bold uppercase ${placement === "header" ? "text-[#60727a]" : "text-white/60"}`}>Xem nhanh cấu trúc {placement}</p><div className="flex flex-wrap gap-2">{activeRoots.map((root) => <div key={root.id} className={`px-3 py-2 text-sm font-semibold ${placement === "header" ? "border border-[#cbd6d8] text-[#174452]" : "bg-white/10 text-white"}`}>{root.icon && <i className={`fas ${root.icon} mr-2`} aria-hidden="true" />}{root.label}{items.some((child) => child.parent_id === root.id && child.is_active) && <span className="ml-2 text-xs opacity-60">({items.filter((child) => child.parent_id === root.id && child.is_active).length})</span>}</div>)}</div></div>
    {loading ? <LoadingState label="Đang tải menu..." /> : error ? <ErrorState message={error} onRetry={() => setReload((value) => value + 1)} /> : <AdminDataTable rows={displayed} rowKey={(item) => item.id} emptyMessage={`Chưa có menu ${placement}.`} columns={[
      { key: "label", header: "Tên menu", render: (item) => <div className={item.parent_id ? "pl-6" : "font-bold"}>{item.parent_id && <i className="fas fa-turn-up mr-2 rotate-90 text-[#9aabad]" aria-hidden="true" />}{item.icon && <i className={`fas ${item.icon} mr-2 text-[#116966]`} aria-hidden="true" />}{item.label}</div> },
      { key: "url", header: "Liên kết", render: (item) => <span className="max-w-72 break-all font-mono text-xs text-[#52636c]">{item.url || "Nhóm menu"}</span> },
      { key: "status", header: "Trạng thái", render: (item) => <span className={item.is_active ? "font-semibold text-emerald-700" : "text-[#60727a]"}>{item.is_active ? "Đang hiện" : "Đã ẩn"}</span> },
      { key: "actions", header: "Thao tác", render: (item) => manageable ? <div className="flex whitespace-nowrap"><button type="button" aria-label={`Đưa ${item.label} lên`} disabled={busy} onClick={() => void move(item, -1)} className="size-8 text-[#52636c] disabled:opacity-30"><i className="fas fa-arrow-up" /></button><button type="button" aria-label={`Đưa ${item.label} xuống`} disabled={busy} onClick={() => void move(item, 1)} className="size-8 text-[#52636c] disabled:opacity-30"><i className="fas fa-arrow-down" /></button><button type="button" aria-label={`Chỉnh sửa ${item.label}`} onClick={() => { setErrors({}); setEditing(item); }} className="size-8 text-[#116966]"><i className="fas fa-pen" /></button><button type="button" aria-label={`Xóa ${item.label}`} onClick={() => setDeleting(item)} className="size-8 text-red-700"><i className="fas fa-trash" /></button></div> : null },
    ]} />}
    {editing !== undefined && <NavigationDialog item={editing} roots={items} placement={placement} busy={busy} errors={errors} onClose={() => setEditing(undefined)} onSubmit={save} />}
    {deleting && <AdminConfirmDialog title="Xóa mục menu" message={`Xóa “${deleting.label}”? Nhóm còn mục con phải được dọn trước.`} confirmLabel="Xóa mục menu" destructive busy={busy} onClose={() => setDeleting(null)} onConfirm={() => void remove()} />}
  </section>;
}
