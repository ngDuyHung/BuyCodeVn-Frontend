"use client";

import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import ErrorState from "@/components/shared/ErrorState";
import LoadingState from "@/components/shared/LoadingState";
import Pagination from "@/components/shared/Pagination";
import { useAdminQueryState } from "@/hooks/admin/useAdminQueryState";
import { useDialogAccessibility } from "@/hooks/useDialogAccessibility";
import { normalizeApiError } from "@/lib/api-error";
import { formatCurrency, formatDate } from "@/lib/format";
import { toMoneyString } from "@/lib/money";
import { adminOperationsService } from "@/services/admin/adminOperationsService";
import type { PaginatedResponse, ValidationErrors } from "@/types/api";
import type { Coupon, CouponWritePayload } from "@/types/orders";
import AdminConfirmDialog from "./AdminConfirmDialog";
import AdminDataTable from "./AdminDataTable";
import AdminFilterBar from "./AdminFilterBar";
import AdminFormField from "./AdminFormField";

type DiscountType = "percent" | "amount";

function couponStatus(coupon: Coupon) {
  if (!coupon.is_active) return { label: "Đã tắt", className: "text-[#60727a]" };
  if (coupon.expires_at && new Date(coupon.expires_at).getTime() < Date.now()) return { label: "Hết hạn", className: "text-red-700" };
  if (coupon.usage_limit !== null && coupon.used_count >= coupon.usage_limit) return { label: "Hết lượt", className: "text-amber-700" };
  return { label: "Khả dụng", className: "text-emerald-700" };
}

function CouponDialog({ coupon, busy, fieldErrors, onClose, onSubmit }: {
  coupon: Coupon | null;
  busy: boolean;
  fieldErrors: ValidationErrors;
  onClose: () => void;
  onSubmit: (payload: CouponWritePayload) => void;
}) {
  const dialogRef = useDialogAccessibility(true, onClose, !busy);
  const [code, setCode] = useState(coupon?.code ?? "");
  const [type, setType] = useState<DiscountType>(coupon?.discount_amount && Number(coupon.discount_amount) > 0 ? "amount" : "percent");
  const [discount, setDiscount] = useState(coupon?.discount_amount && Number(coupon.discount_amount) > 0 ? coupon.discount_amount : coupon?.discount_percent ?? "");
  const [usageLimit, setUsageLimit] = useState(coupon?.usage_limit == null ? "" : String(coupon.usage_limit));
  const [expiresAt, setExpiresAt] = useState(coupon?.expires_at?.slice(0, 10) ?? "");
  const [active, setActive] = useState(coupon?.is_active ?? true);
  const [localError, setLocalError] = useState("");
  const errorFor = (field: string) => fieldErrors[field]?.map((message) => <span key={message} className="mt-1 block text-xs text-red-600">{message}</span>);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const amount = Number(discount);
    if (!Number.isFinite(amount) || amount <= 0 || (type === "percent" && amount > 100)) {
      setLocalError(type === "percent" ? "Phần trăm giảm phải lớn hơn 0 và không vượt quá 100." : "Số tiền giảm phải lớn hơn 0.");
      return;
    }
    setLocalError("");
    onSubmit({
      code: code.replace(/\s+/g, "").toUpperCase(),
      discount_percent: type === "percent" ? toMoneyString(discount) : null,
      discount_amount: type === "amount" ? toMoneyString(discount) : null,
      usage_limit: usageLimit === "" ? null : Number(usageLimit),
      expires_at: expiresAt || null,
      is_active: active,
    });
  };

  return <div ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="coupon-dialog-title" className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) onClose(); }}>
    <form onSubmit={submit} noValidate className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-md bg-white p-5 shadow-xl">
      <div className="flex items-start justify-between gap-4"><div><h2 id="coupon-dialog-title" className="text-lg font-bold">{coupon ? "Chỉnh sửa mã giảm giá" : "Tạo mã giảm giá"}</h2><p className="mt-1 text-sm text-[#60727a]">Mỗi mã chỉ áp dụng một hình thức giảm.</p></div><button type="button" aria-label="Đóng" disabled={busy} onClick={onClose} className="size-8"><i className="fas fa-xmark" aria-hidden="true" /></button></div>
      {localError && <p role="alert" className="mt-4 border-l-4 border-red-600 bg-red-50 px-3 py-2 text-sm text-red-700">{localError}</p>}
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-semibold sm:col-span-2">Mã giảm giá<input autoFocus required maxLength={50} value={code} onChange={(event) => setCode(event.target.value.replace(/\s+/g, "").toUpperCase())} className="mt-1 h-10 w-full rounded border border-[#cbd6d8] px-3 font-mono font-normal uppercase" />{errorFor("code")}</label>
        <fieldset className="sm:col-span-2"><legend className="text-sm font-semibold">Hình thức giảm</legend><div className="mt-1 grid grid-cols-2 border border-[#cbd6d8] p-1"><button type="button" aria-pressed={type === "percent"} onClick={() => { setType("percent"); setDiscount(""); }} className={`h-9 text-sm font-semibold ${type === "percent" ? "bg-[#116966] text-white" : "text-[#52636c]"}`}>Theo phần trăm</button><button type="button" aria-pressed={type === "amount"} onClick={() => { setType("amount"); setDiscount(""); }} className={`h-9 text-sm font-semibold ${type === "amount" ? "bg-[#116966] text-white" : "text-[#52636c]"}`}>Số tiền cố định</button></div></fieldset>
        <label className="text-sm font-semibold sm:col-span-2">{type === "percent" ? "Phần trăm giảm (%)" : "Số tiền giảm (VND)"}<input required type="number" min="0.01" max={type === "percent" ? 100 : undefined} step="0.01" value={discount} onChange={(event) => setDiscount(event.target.value)} className="mt-1 h-10 w-full rounded border border-[#cbd6d8] px-3 font-normal" />{errorFor(type === "percent" ? "discount_percent" : "discount_amount")}</label>
        <label className="text-sm font-semibold">Giới hạn lượt dùng<input type="number" min="1" step="1" value={usageLimit} onChange={(event) => setUsageLimit(event.target.value)} placeholder="Không giới hạn" className="mt-1 h-10 w-full rounded border border-[#cbd6d8] px-3 font-normal" />{errorFor("usage_limit")}</label>
        <label className="text-sm font-semibold">Ngày hết hạn<input type="date" value={expiresAt} onChange={(event) => setExpiresAt(event.target.value)} className="mt-1 h-10 w-full rounded border border-[#cbd6d8] px-3 font-normal" />{errorFor("expires_at")}</label>
        <label className="flex items-center gap-2 text-sm font-semibold sm:col-span-2"><input type="checkbox" checked={active} onChange={(event) => setActive(event.target.checked)} className="size-4 accent-[#116966]" />Đang hoạt động</label>
      </div>
      <div className="mt-6 flex justify-end gap-2"><button type="button" disabled={busy} onClick={onClose} className="rounded border border-[#cbd6d8] px-4 py-2 text-sm font-semibold">Hủy</button><button type="submit" disabled={busy || !code} className="rounded bg-[#116966] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{busy ? "Đang lưu..." : "Lưu mã giảm giá"}</button></div>
    </form>
  </div>;
}

export default function AdminCouponDirectory() {
  const { searchParams, update } = useAdminQueryState();
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const search = searchParams.get("search") ?? "";
  const activeFilter = searchParams.get("is_active") ?? "";
  const [draftSearch, setDraftSearch] = useState(search);
  const [response, setResponse] = useState<PaginatedResponse<Coupon> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Coupon | null | undefined>(undefined);
  const [deleting, setDeleting] = useState<Coupon | null>(null);
  const [busy, setBusy] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<ValidationErrors>({});
  const [reload, setReload] = useState(0);
  const query = useMemo(() => ({ page, per_page: 15, ...(search ? { search } : {}), ...(activeFilter ? { is_active: activeFilter === "1" ? 1 as const : 0 as const } : {}) }), [page, search, activeFilter]);
  const load = useCallback(async (signal?: AbortSignal) => setResponse(await adminOperationsService.getCoupons(query, signal)), [query]);

  useEffect(() => {
    const controller = new AbortController();
    Promise.resolve().then(() => { setLoading(true); setError(null); return load(controller.signal); })
      .catch((requestError) => { if (!axios.isCancel(requestError)) setError(normalizeApiError(requestError).message); })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [load, reload]);

  const save = async (payload: CouponWritePayload) => {
    setBusy(true); setFieldErrors({});
    try { if (editing) await adminOperationsService.updateCoupon(editing.id, payload); else await adminOperationsService.createCoupon(payload); toast.success(editing ? "Đã cập nhật mã giảm giá." : "Đã tạo mã giảm giá."); setEditing(undefined); await load(); }
    catch (requestError) { const apiError = normalizeApiError(requestError); setFieldErrors(apiError.fieldErrors); toast.error(apiError.message); }
    finally { setBusy(false); }
  };

  const remove = async () => {
    if (!deleting) return; setBusy(true);
    try { await adminOperationsService.deleteCoupon(deleting.id); toast.success("Đã xóa mã giảm giá."); setDeleting(null); await load(); }
    catch (requestError) { toast.error(normalizeApiError(requestError).message); }
    finally { setBusy(false); }
  };

  return <section><header className="mb-5 flex flex-wrap items-end justify-between gap-3"><div><h1 className="text-xl font-bold">Mã giảm giá</h1><p className="mt-1 text-sm text-[#60727a]">Quản lý chương trình khuyến mãi và giới hạn sử dụng.</p></div><button type="button" onClick={() => { setFieldErrors({}); setEditing(null); }} className="h-9 rounded bg-[#116966] px-4 text-sm font-semibold text-white"><i className="fas fa-plus mr-2" aria-hidden="true" />Tạo mã</button></header>
    <AdminFilterBar onSubmit={(event) => { event.preventDefault(); update({ search: draftSearch.trim(), page: 1 }); }}><AdminFormField id="coupon-search" label="Tìm kiếm" value={draftSearch} onChange={(event) => setDraftSearch(event.target.value)} placeholder="Mã giảm giá" /><label className="text-xs font-semibold text-[#52636c]">Trạng thái<select value={activeFilter} onChange={(event) => update({ is_active: event.target.value, page: 1 })} className="mt-1 h-9 min-w-36 rounded border border-[#cbd6d8] bg-white px-3 text-sm font-normal"><option value="">Tất cả</option><option value="1">Đang bật</option><option value="0">Đã tắt</option></select></label><button type="submit" className="h-9 rounded bg-[#116966] px-4 text-sm font-semibold text-white">Lọc</button></AdminFilterBar>
    {loading ? <LoadingState label="Đang tải mã giảm giá..." /> : error ? <ErrorState message={error} onRetry={() => setReload((value) => value + 1)} /> : <><div className="mb-2 text-right text-xs text-[#60727a]">{response?.meta.total ?? 0} mã giảm giá</div><AdminDataTable rows={response?.data ?? []} rowKey={(coupon) => coupon.id} columns={[
      { key: "code", header: "Mã", render: (coupon) => <strong className="font-mono">{coupon.code}</strong> },
      { key: "discount", header: "Mức giảm", render: (coupon) => coupon.discount_percent && Number(coupon.discount_percent) > 0 ? <strong>{Number(coupon.discount_percent)}%</strong> : <strong>{formatCurrency(coupon.discount_amount ?? "0")}</strong> },
      { key: "usage", header: "Lượt dùng", render: (coupon) => <span>{coupon.used_count} / {coupon.usage_limit ?? "Không giới hạn"}</span> },
      { key: "expiry", header: "Hết hạn", render: (coupon) => formatDate(coupon.expires_at) },
      { key: "status", header: "Trạng thái", render: (coupon) => { const status = couponStatus(coupon); return <span className={`font-semibold ${status.className}`}>{status.label}</span>; } },
      { key: "actions", header: "Thao tác", render: (coupon) => <div className="flex gap-1"><button type="button" aria-label={`Chỉnh sửa ${coupon.code}`} title="Chỉnh sửa" onClick={() => { setFieldErrors({}); setEditing(coupon); }} className="size-8 text-[#116966]"><i className="fas fa-pen" aria-hidden="true" /></button><button type="button" aria-label={`Xóa ${coupon.code}`} title="Xóa" onClick={() => setDeleting(coupon)} className="size-8 text-red-700"><i className="fas fa-trash" aria-hidden="true" /></button></div> },
    ]} emptyMessage="Chưa có mã giảm giá." /><div className="mt-4"><Pagination currentPage={response?.meta.current_page ?? 1} lastPage={response?.meta.last_page ?? 1} onPageChange={(next) => update({ page: next })} /></div></>}
    {editing !== undefined && <CouponDialog coupon={editing} busy={busy} fieldErrors={fieldErrors} onClose={() => setEditing(undefined)} onSubmit={save} />}
    {deleting && <AdminConfirmDialog title="Xóa mã giảm giá" message={`Xóa mã “${deleting.code}”? Mã sẽ không thể dùng cho đơn hàng mới.`} confirmLabel="Xóa mã" destructive busy={busy} onClose={() => setDeleting(null)} onConfirm={remove} />}
  </section>;
}
