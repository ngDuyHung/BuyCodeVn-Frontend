"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import ErrorState from "@/components/shared/ErrorState";
import LoadingState from "@/components/shared/LoadingState";
import { useDialogAccessibility } from "@/hooks/useDialogAccessibility";
import { can } from "@/lib/admin-permissions";
import { normalizeApiError } from "@/lib/api-error";
import { adminCatalogService } from "@/services/admin/adminCatalogService";
import { useAuthStore } from "@/stores/authStore";
import type { ValidationErrors } from "@/types/api";
import type { Category, CategoryWritePayload } from "@/types/catalog";
import AdminConfirmDialog from "./AdminConfirmDialog";

type FlatCategory = Category & { depth: number };
const flatten = (items: Category[], depth = 0): FlatCategory[] => items.flatMap((item) => [
  { ...item, depth }, ...flatten(item.children ?? [], depth + 1),
]);
const descendantIds = (category: Category): number[] => [category.id, ...(category.children ?? []).flatMap(descendantIds)];

function CategoryDialog({ category, categories, busy, fieldErrors, onClose, onSubmit }: {
  category: Category | null; categories: Category[]; busy: boolean; fieldErrors: ValidationErrors;
  onClose: () => void; onSubmit: (payload: CategoryWritePayload) => void;
}) {
  const dialogRef = useDialogAccessibility(true, onClose, !busy);
  const [name, setName] = useState(category?.name ?? "");
  const [slug, setSlug] = useState(category?.slug ?? "");
  const [parentId, setParentId] = useState(category?.parent_id ? String(category.parent_id) : "");
  const [active, setActive] = useState(category?.is_active ?? true);
  const blocked = new Set(category ? descendantIds(category) : []);
  const parents = flatten(categories).filter((item) => !blocked.has(item.id));
  return <div ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="category-dialog-title" className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) onClose(); }}>
    <form className="w-full max-w-lg rounded-md bg-white p-5 shadow-xl" onSubmit={(event) => { event.preventDefault(); onSubmit({ name: name.trim(), ...(slug.trim() ? { slug: slug.trim() } : {}), parent_id: parentId ? Number(parentId) : null, is_active: active }); }}>
      <div className="flex items-start justify-between"><div><h2 id="category-dialog-title" className="text-lg font-bold">{category ? "Chỉnh sửa danh mục" : "Thêm danh mục"}</h2><p className="mt-1 text-sm text-[#60727a]">Slug để trống sẽ do backend tạo.</p></div><button type="button" aria-label="Đóng" disabled={busy} onClick={onClose} className="size-8"><i className="fas fa-xmark" aria-hidden="true" /></button></div>
      <div className="mt-5 grid gap-4">
        <label className="text-sm font-semibold">Tên danh mục<input autoFocus required maxLength={255} value={name} onChange={(e) => setName(e.target.value)} className="mt-1 h-10 w-full rounded border border-[#cbd6d8] px-3 font-normal" />{fieldErrors.name?.map((message) => <span key={message} className="mt-1 block text-xs text-red-600">{message}</span>)}</label>
        <label className="text-sm font-semibold">Slug<input maxLength={255} value={slug} onChange={(e) => setSlug(e.target.value)} className="mt-1 h-10 w-full rounded border border-[#cbd6d8] px-3 font-normal" />{fieldErrors.slug?.map((message) => <span key={message} className="mt-1 block text-xs text-red-600">{message}</span>)}</label>
        <label className="text-sm font-semibold">Danh mục cha<select value={parentId} onChange={(e) => setParentId(e.target.value)} className="mt-1 h-10 w-full rounded border border-[#cbd6d8] bg-white px-3 font-normal"><option value="">Danh mục gốc</option>{parents.map((item) => <option key={item.id} value={item.id}>{"— ".repeat(item.depth)}{item.name}</option>)}</select>{fieldErrors.parent_id?.map((message) => <span key={message} className="mt-1 block text-xs text-red-600">{message}</span>)}</label>
        <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} /> Hoạt động</label>
      </div>
      <div className="mt-6 flex justify-end gap-2"><button type="button" disabled={busy} onClick={onClose} className="rounded border border-[#cbd6d8] px-4 py-2 text-sm font-semibold">Hủy</button><button type="submit" disabled={busy || !name.trim()} className="rounded bg-[#116966] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{busy ? "Đang lưu..." : "Lưu danh mục"}</button></div>
    </form>
  </div>;
}

export default function AdminCategoryDirectory() {
  const user = useAuthStore((state) => state.user);
  const manageable = can(user, "catalog.manage");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Category | null | undefined>(undefined);
  const [deleting, setDeleting] = useState<Category | null>(null);
  const [busy, setBusy] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<ValidationErrors>({});
  const [reload, setReload] = useState(0);
  const rows = useMemo(() => flatten(categories), [categories]);
  const load = useCallback((signal?: AbortSignal) => adminCatalogService.getCategories(signal).then(setCategories), []);

  useEffect(() => {
    const controller = new AbortController();
    Promise.resolve().then(() => { setLoading(true); setError(null); return load(controller.signal); })
      .catch((requestError) => { if (!axios.isCancel(requestError)) setError(normalizeApiError(requestError).message); })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [load, reload]);

  const save = async (payload: CategoryWritePayload) => {
    setBusy(true); setFieldErrors({});
    try {
      if (editing) await adminCatalogService.updateCategory(editing.id, payload);
      else await adminCatalogService.createCategory(payload);
      toast.success(editing ? "Đã cập nhật danh mục." : "Đã tạo danh mục.");
      setEditing(undefined); await load();
    } catch (requestError) {
      const apiError = normalizeApiError(requestError); setFieldErrors(apiError.fieldErrors); toast.error(apiError.message);
    } finally { setBusy(false); }
  };
  const remove = async () => {
    if (!deleting) return; setBusy(true);
    try { await adminCatalogService.deleteCategory(deleting.id); toast.success("Đã xóa danh mục."); setDeleting(null); await load(); }
    catch (requestError) { toast.error(normalizeApiError(requestError).message); }
    finally { setBusy(false); }
  };

  return <section><header className="mb-5 flex flex-wrap items-end justify-between gap-3"><div><h1 className="text-xl font-bold">Danh mục sản phẩm</h1><p className="mt-1 text-sm text-[#60727a]">Quản lý cấu trúc cây dùng trên storefront.</p></div>{manageable && <button type="button" onClick={() => { setFieldErrors({}); setEditing(null); }} className="h-9 rounded bg-[#116966] px-4 text-sm font-semibold text-white"><i className="fas fa-plus mr-2" aria-hidden="true" />Thêm danh mục</button>}</header>
    {loading ? <LoadingState label="Đang tải danh mục..." /> : error ? <ErrorState message={error} onRetry={() => setReload((value) => value + 1)} /> : <div className="border border-[#dce3e5] bg-white"><div className="grid grid-cols-[minmax(0,1fr)_120px_150px] border-b border-[#dce3e5] bg-[#f1f5f5] px-4 py-3 text-xs font-bold uppercase text-[#52636c]"><span>Danh mục</span><span>Trạng thái</span><span className="text-right">Thao tác</span></div>{rows.map((category) => <div key={category.id} className="grid grid-cols-[minmax(0,1fr)_120px_150px] items-center border-b border-[#e7ebec] px-4 py-3 text-sm last:border-0"><div style={{ paddingLeft: `${category.depth * 20}px` }}><strong>{category.name}</strong><span className="ml-2 text-xs text-[#60727a]">/{category.slug}</span></div><span className={category.is_active ? "font-semibold text-emerald-700" : "font-semibold text-red-700"}>{category.is_active ? "Hoạt động" : "Đã ẩn"}</span><div className="flex justify-end gap-1">{manageable && <><button type="button" title="Chỉnh sửa" aria-label={`Chỉnh sửa ${category.name}`} onClick={() => { setFieldErrors({}); setEditing(category); }} className="size-8 text-[#116966]"><i className="fas fa-pen" aria-hidden="true" /></button><button type="button" title="Xóa" aria-label={`Xóa ${category.name}`} onClick={() => setDeleting(category)} className="size-8 text-red-700"><i className="fas fa-trash" aria-hidden="true" /></button></>}</div></div>)}{rows.length === 0 && <p className="p-10 text-center text-sm text-[#60727a]">Chưa có danh mục.</p>}</div>}
    {editing !== undefined && <CategoryDialog category={editing} categories={categories} busy={busy} fieldErrors={fieldErrors} onClose={() => setEditing(undefined)} onSubmit={save} />}
    {deleting && <AdminConfirmDialog title="Xóa danh mục" message={`Xóa “${deleting.name}”? Backend sẽ từ chối nếu danh mục còn danh mục con hoặc sản phẩm.`} confirmLabel="Xóa danh mục" destructive busy={busy} onClose={() => setDeleting(null)} onConfirm={remove} />}
  </section>;
}
