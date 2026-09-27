"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import ErrorState from "@/components/shared/ErrorState";
import LoadingState from "@/components/shared/LoadingState";
import Pagination from "@/components/shared/Pagination";
import { useAdminQueryState } from "@/hooks/admin/useAdminQueryState";
import { useDialogAccessibility } from "@/hooks/useDialogAccessibility";
import { can } from "@/lib/admin-permissions";
import { normalizeApiError } from "@/lib/api-error";
import { formatCurrency, formatDate } from "@/lib/format";
import { adminCatalogService } from "@/services/admin/adminCatalogService";
import { useAuthStore } from "@/stores/authStore";
import type { PaginatedResponse, ValidationErrors } from "@/types/api";
import { PRODUCT_TYPES, type Category, type Product, type ProductType, type ProductWritePayload } from "@/types/catalog";
import AdminConfirmDialog from "./AdminConfirmDialog";
import AdminDataTable from "./AdminDataTable";
import AdminFilterBar from "./AdminFilterBar";
import AdminFormField from "./AdminFormField";

const typeLabels: Record<ProductType, string> = { source_code: "Mã nguồn", template: "Template", script: "Script", plugin: "Plugin", other: "Khác" };
const flattenCategories = (items: Category[], depth = 0): Array<Category & { depth: number }> => items.flatMap((item) => [{ ...item, depth }, ...flattenCategories(item.children ?? [], depth + 1)]);

function ProductDialog({ product, categories, busy, fieldErrors, onClose, onSubmit }: {
  product: Product | null; categories: Category[]; busy: boolean; fieldErrors: ValidationErrors;
  onClose: () => void; onSubmit: (payload: ProductWritePayload) => void;
}) {
  const dialogRef = useDialogAccessibility(true, onClose, !busy);
  const [categoryId, setCategoryId] = useState(String(product?.category_id ?? categories[0]?.id ?? ""));
  const [type, setType] = useState<ProductType>(product?.type ?? "source_code");
  const [title, setTitle] = useState(product?.title ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [price, setPrice] = useState(product?.price ?? "0");
  const [thumbnailUrl, setThumbnailUrl] = useState(product?.thumbnail_url ?? "");
  const [demoUrl, setDemoUrl] = useState(product?.demo_url ?? "");
  const [fileUrl, setFileUrl] = useState("");
  const [active, setActive] = useState(product?.is_active ?? true);
  const categoryOptions = flattenCategories(categories);
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const payload: ProductWritePayload = {
      category_id: Number(categoryId), type, title: title.trim(), description: description.trim() || null,
      thumbnail_url: thumbnailUrl.trim() || null, demo_url: demoUrl.trim() || null,
      price: price.trim(), is_active: active,
      ...(!product || fileUrl.trim() ? { file_url: fileUrl.trim() || null } : {}),
    };
    onSubmit(payload);
  };
  const errorFor = (field: string) => fieldErrors[field]?.map((message) => <span key={message} className="mt-1 block text-xs text-red-600">{message}</span>);
  return <div ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="product-dialog-title" className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) onClose(); }}>
    <form onSubmit={submit} className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-md bg-white p-5 shadow-xl">
      <div className="flex items-start justify-between"><div><h2 id="product-dialog-title" className="text-lg font-bold">{product ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm"}</h2><p className="mt-1 text-sm text-[#60727a]">Slug do backend tạo. Đường dẫn file hiện tại không được API trả lại.</p></div><button type="button" aria-label="Đóng" onClick={onClose} disabled={busy} className="size-8"><i className="fas fa-xmark" aria-hidden="true" /></button></div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-semibold">Danh mục<select required value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="mt-1 h-10 w-full rounded border border-[#cbd6d8] bg-white px-3 font-normal"><option value="">Chọn danh mục</option>{categoryOptions.map((category) => <option key={category.id} value={category.id}>{"— ".repeat(category.depth)}{category.name}{category.is_active ? "" : " (đã ẩn)"}</option>)}</select>{errorFor("category_id")}</label>
        <label className="text-sm font-semibold">Loại<select value={type} onChange={(e) => setType(e.target.value as ProductType)} className="mt-1 h-10 w-full rounded border border-[#cbd6d8] bg-white px-3 font-normal">{PRODUCT_TYPES.map((value) => <option key={value} value={value}>{typeLabels[value]}</option>)}</select>{errorFor("type")}</label>
        <label className="text-sm font-semibold sm:col-span-2">Tiêu đề<input autoFocus required maxLength={255} value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 h-10 w-full rounded border border-[#cbd6d8] px-3 font-normal" />{errorFor("title")}</label>
        <label className="text-sm font-semibold sm:col-span-2">Mô tả<textarea rows={5} value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 w-full rounded border border-[#cbd6d8] px-3 py-2 font-normal" />{errorFor("description")}</label>
        <label className="text-sm font-semibold">Giá bán<input required type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} className="mt-1 h-10 w-full rounded border border-[#cbd6d8] px-3 font-normal" />{errorFor("price")}</label>
        <label className="flex items-end gap-2 pb-2 text-sm font-semibold"><input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} /> Hoạt động</label>
        <label className="text-sm font-semibold sm:col-span-2">URL ảnh đại diện<input type="url" maxLength={2048} value={thumbnailUrl} onChange={(e) => setThumbnailUrl(e.target.value)} className="mt-1 h-10 w-full rounded border border-[#cbd6d8] px-3 font-normal" />{errorFor("thumbnail_url")}</label>
        <label className="text-sm font-semibold sm:col-span-2">URL demo<input type="url" maxLength={2048} value={demoUrl} onChange={(e) => setDemoUrl(e.target.value)} className="mt-1 h-10 w-full rounded border border-[#cbd6d8] px-3 font-normal" />{errorFor("demo_url")}</label>
        <label className="text-sm font-semibold sm:col-span-2">Đường dẫn file nội bộ<input maxLength={255} value={fileUrl} onChange={(e) => setFileUrl(e.target.value)} placeholder={product?.has_download_file ? "Đã có file; để trống để giữ nguyên" : "products/example.zip"} className="mt-1 h-10 w-full rounded border border-[#cbd6d8] px-3 font-normal" />{errorFor("file_url")}</label>
      </div>
      <div className="mt-6 flex justify-end gap-2"><button type="button" disabled={busy} onClick={onClose} className="rounded border border-[#cbd6d8] px-4 py-2 text-sm font-semibold">Hủy</button><button type="submit" disabled={busy || !title.trim() || !categoryId} className="rounded bg-[#116966] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{busy ? "Đang lưu..." : "Lưu sản phẩm"}</button></div>
    </form>
  </div>;
}

export default function AdminProductDirectory() {
  const user = useAuthStore((state) => state.user);
  const manageable = can(user, "catalog.manage");
  const { searchParams, update } = useAdminQueryState();
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const search = searchParams.get("search") ?? "";
  const category = searchParams.get("category_id") ?? "";
  const type = searchParams.get("type") ?? "";
  const active = searchParams.get("is_active") ?? "";
  const [draftSearch, setDraftSearch] = useState(search);
  const [response, setResponse] = useState<PaginatedResponse<Product> | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Product | null | undefined>(undefined);
  const [deleting, setDeleting] = useState<Product | null>(null);
  const [saved, setSaved] = useState<Product | null>(null);
  const [busy, setBusy] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<ValidationErrors>({});
  const [reload, setReload] = useState(0);
  const categoryOptions = useMemo(() => flattenCategories(categories), [categories]);
  const query = useMemo(() => ({ page, per_page: 15, ...(search ? { search } : {}), ...(category ? { category_id: Number(category) } : {}), ...(type ? { type: type as ProductType } : {}), ...(active ? { is_active: active === "1" ? 1 as const : 0 as const } : {}) }), [page, search, category, type, active]);
  const load = useCallback(async (signal?: AbortSignal) => {
    const [products, categoryTree] = await Promise.all([adminCatalogService.getProducts(query, signal), adminCatalogService.getCategories(signal)]);
    setResponse(products); setCategories(categoryTree);
  }, [query]);
  useEffect(() => { const controller = new AbortController(); Promise.resolve().then(() => { setLoading(true); setError(null); return load(controller.signal); }).catch((requestError) => { if (!axios.isCancel(requestError)) setError(normalizeApiError(requestError).message); }).finally(() => setLoading(false)); return () => controller.abort(); }, [load, reload]);

  const save = async (payload: ProductWritePayload) => {
    setBusy(true); setFieldErrors({});
    try {
      const product = editing ? await adminCatalogService.updateProduct(editing.id, payload) : await adminCatalogService.createProduct(payload);
      toast.success(editing ? "Đã cập nhật sản phẩm." : "Đã tạo sản phẩm."); setEditing(undefined); setSaved(product); await load();
    } catch (requestError) { const apiError = normalizeApiError(requestError); setFieldErrors(apiError.fieldErrors); toast.error(apiError.message); }
    finally { setBusy(false); }
  };
  const remove = async () => { if (!deleting) return; setBusy(true); try { await adminCatalogService.deleteProduct(deleting.id); toast.success("Đã xóa sản phẩm."); setDeleting(null); await load(); } catch (requestError) { toast.error(normalizeApiError(requestError).message); } finally { setBusy(false); } };

  return <section><header className="mb-5 flex flex-wrap items-end justify-between gap-3"><div><h1 className="text-xl font-bold">Sản phẩm số</h1><p className="mt-1 text-sm text-[#60727a]">Quản lý nội dung, giá bán và file tải xuống.</p></div>{manageable && <button type="button" onClick={() => { setFieldErrors({}); setSaved(null); setEditing(null); }} className="h-9 rounded bg-[#116966] px-4 text-sm font-semibold text-white"><i className="fas fa-plus mr-2" aria-hidden="true" />Thêm sản phẩm</button>}</header>
    {saved && <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-l-4 border-emerald-600 bg-emerald-50 px-4 py-3 text-sm"><span>Đã lưu <strong>{saved.title}</strong> với slug <code>{saved.slug}</code>.</span><Link href={`/source-code/${saved.slug}`} target="_blank" className="font-semibold text-[#116966]">Xem storefront <i className="fas fa-arrow-up-right-from-square ml-1" aria-hidden="true" /></Link></div>}
    <AdminFilterBar onSubmit={(event) => { event.preventDefault(); update({ search: draftSearch.trim(), page: 1 }); }}><AdminFormField id="product-search" label="Tìm kiếm" value={draftSearch} onChange={(e) => setDraftSearch(e.target.value)} placeholder="Tiêu đề" /><label className="text-xs font-semibold text-[#52636c]">Danh mục<select value={category} onChange={(e) => update({ category_id: e.target.value, page: 1 })} className="mt-1 h-9 w-full min-w-40 rounded border border-[#cbd6d8] bg-white px-3 text-sm font-normal"><option value="">Tất cả</option>{categoryOptions.map((item) => <option key={item.id} value={item.id}>{"— ".repeat(item.depth)}{item.name}</option>)}</select></label><label className="text-xs font-semibold text-[#52636c]">Loại<select value={type} onChange={(e) => update({ type: e.target.value, page: 1 })} className="mt-1 h-9 min-w-36 rounded border border-[#cbd6d8] bg-white px-3 text-sm font-normal"><option value="">Tất cả</option>{PRODUCT_TYPES.map((value) => <option key={value} value={value}>{typeLabels[value]}</option>)}</select></label><label className="text-xs font-semibold text-[#52636c]">Trạng thái<select value={active} onChange={(e) => update({ is_active: e.target.value, page: 1 })} className="mt-1 h-9 min-w-32 rounded border border-[#cbd6d8] bg-white px-3 text-sm font-normal"><option value="">Tất cả</option><option value="1">Hoạt động</option><option value="0">Đã ẩn</option></select></label><button type="submit" className="h-9 rounded bg-[#116966] px-4 text-sm font-semibold text-white">Lọc</button></AdminFilterBar>
    {loading ? <LoadingState label="Đang tải sản phẩm..." /> : error ? <ErrorState message={error} onRetry={() => setReload((value) => value + 1)} /> : <><div className="mb-2 text-right text-xs text-[#60727a]">{response?.meta.total ?? 0} sản phẩm</div><AdminDataTable rows={response?.data ?? []} rowKey={(product) => product.id} columns={[
      { key: "product", header: "Sản phẩm", render: (product) => <div><strong>{product.title}</strong><span className="block text-xs text-[#60727a]">/{product.slug}</span></div> },
      { key: "category", header: "Danh mục", render: (product) => product.category?.name ?? product.category_id },
      { key: "type", header: "Loại", render: (product) => typeLabels[product.type] },
      { key: "price", header: "Giá", render: (product) => <strong>{formatCurrency(product.price)}</strong> },
      { key: "status", header: "Trạng thái", render: (product) => <span className={product.is_active ? "font-semibold text-emerald-700" : "font-semibold text-red-700"}>{product.is_active ? "Hoạt động" : "Đã ẩn"}</span> },
      { key: "updated", header: "Cập nhật", render: (product) => formatDate(product.updated_at) },
      { key: "actions", header: "Thao tác", render: (product) => <div className="flex gap-1"><Link href={`/source-code/${product.slug}`} target="_blank" title="Xem storefront" aria-label={`Xem ${product.title}`} className="flex size-8 items-center justify-center text-[#116966]"><i className="fas fa-eye" aria-hidden="true" /></Link>{manageable && <><button type="button" title="Chỉnh sửa" aria-label={`Chỉnh sửa ${product.title}`} onClick={() => { setFieldErrors({}); setSaved(null); setEditing(product); }} className="size-8 text-[#116966]"><i className="fas fa-pen" aria-hidden="true" /></button><button type="button" title="Xóa" aria-label={`Xóa ${product.title}`} onClick={() => setDeleting(product)} className="size-8 text-red-700"><i className="fas fa-trash" aria-hidden="true" /></button></>}</div> },
    ]} emptyMessage="Không tìm thấy sản phẩm phù hợp." /><div className="mt-4"><Pagination currentPage={response?.meta.current_page ?? 1} lastPage={response?.meta.last_page ?? 1} onPageChange={(next) => update({ page: next })} /></div></>}
    {editing !== undefined && <ProductDialog product={editing} categories={categories} busy={busy} fieldErrors={fieldErrors} onClose={() => setEditing(undefined)} onSubmit={save} />}
    {deleting && <AdminConfirmDialog title="Xóa sản phẩm" message={`Soft delete “${deleting.title}”? Sản phẩm sẽ không còn xuất hiện trên storefront.`} confirmLabel="Xóa sản phẩm" destructive busy={busy} onClose={() => setDeleting(null)} onConfirm={remove} />}
  </section>;
}
