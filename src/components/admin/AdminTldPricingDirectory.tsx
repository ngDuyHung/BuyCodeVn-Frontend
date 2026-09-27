"use client";

import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import ErrorState from "@/components/shared/ErrorState";
import LoadingState from "@/components/shared/LoadingState";
import Pagination from "@/components/shared/Pagination";
import { useAdminQueryState } from "@/hooks/admin/useAdminQueryState";
import { useDialogAccessibility } from "@/hooks/useDialogAccessibility";
import { can } from "@/lib/admin-permissions";
import { normalizeApiError } from "@/lib/api-error";
import { formatCurrency, formatDate } from "@/lib/format";
import { toMoneyString } from "@/lib/money";
import { normalizeTld } from "@/lib/tld";
import { adminServicesService } from "@/services/admin/adminServicesService";
import { useAuthStore } from "@/stores/authStore";
import type { PaginatedResponse, ValidationErrors } from "@/types/api";
import type { TldPricing, TldPricingWritePayload } from "@/types/services";
import AdminConfirmDialog from "./AdminConfirmDialog";
import AdminDataTable from "./AdminDataTable";
import AdminFilterBar from "./AdminFilterBar";
import AdminFormField from "./AdminFormField";

function TldPricingDialog({ pricing, busy, fieldErrors, onClose, onSubmit }: {
  pricing: TldPricing | null;
  busy: boolean;
  fieldErrors: ValidationErrors;
  onClose: () => void;
  onSubmit: (payload: TldPricingWritePayload) => void;
}) {
  const dialogRef = useDialogAccessibility(true, onClose, !busy);
  const [tld, setTld] = useState(pricing?.tld ?? "");
  const [registerPrice, setRegisterPrice] = useState(pricing?.register_price ?? "0.00");
  const [renewPrice, setRenewPrice] = useState(pricing?.renew_price ?? "0.00");
  const [transferPrice, setTransferPrice] = useState(pricing?.transfer_price ?? "0.00");
  const [autoRegister, setAutoRegister] = useState(pricing?.is_auto_register ?? false);
  const [active, setActive] = useState(pricing?.is_active ?? true);
  const errorFor = (field: string) => fieldErrors[field]?.map((message) => <span key={message} className="mt-1 block text-xs text-red-600">{message}</span>);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit({
      tld: normalizeTld(tld), register_price: toMoneyString(registerPrice || 0),
      renew_price: toMoneyString(renewPrice || 0), transfer_price: toMoneyString(transferPrice || 0),
      is_auto_register: autoRegister, is_active: active,
    });
  };

  return <div ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="tld-dialog-title" className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) onClose(); }}>
    <form onSubmit={submit} className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-md bg-white p-5 shadow-xl">
      <div className="flex items-start justify-between gap-4"><div><h2 id="tld-dialog-title" className="text-lg font-bold">{pricing ? "Chỉnh sửa giá TLD" : "Thêm giá TLD"}</h2><p className="mt-1 text-sm text-[#60727a]">TLD được chuẩn hóa chữ thường và tự thêm dấu chấm đầu.</p></div><button type="button" aria-label="Đóng" onClick={onClose} disabled={busy} className="size-8"><i className="fas fa-xmark" aria-hidden="true" /></button></div>
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <label className="text-sm font-semibold sm:col-span-3">Đuôi tên miền<input autoFocus required maxLength={20} value={tld} onChange={(event) => setTld(event.target.value)} onBlur={() => setTld(normalizeTld(tld))} placeholder=".com" className="mt-1 h-10 w-full rounded border border-[#cbd6d8] px-3 font-normal" />{errorFor("tld")}</label>
        <label className="text-sm font-semibold">Giá đăng ký<input required type="number" min="0" step="0.01" value={registerPrice} onChange={(event) => setRegisterPrice(event.target.value)} className="mt-1 h-10 w-full rounded border border-[#cbd6d8] px-3 font-normal" />{errorFor("register_price")}</label>
        <label className="text-sm font-semibold">Giá gia hạn<input required type="number" min="0" step="0.01" value={renewPrice} onChange={(event) => setRenewPrice(event.target.value)} className="mt-1 h-10 w-full rounded border border-[#cbd6d8] px-3 font-normal" />{errorFor("renew_price")}</label>
        <label className="text-sm font-semibold">Giá chuyển về<input required type="number" min="0" step="0.01" value={transferPrice} onChange={(event) => setTransferPrice(event.target.value)} className="mt-1 h-10 w-full rounded border border-[#cbd6d8] px-3 font-normal" />{errorFor("transfer_price")}</label>
        <label className="flex items-center gap-2 text-sm font-semibold sm:col-span-3"><input type="checkbox" checked={autoRegister} onChange={(event) => setAutoRegister(event.target.checked)} /> Đăng ký tự động qua registrar</label>
        <label className="flex items-center gap-2 text-sm font-semibold sm:col-span-3"><input type="checkbox" checked={active} onChange={(event) => setActive(event.target.checked)} /> Hoạt động</label>
        {pricing?.is_active && !active && <p className="border-l-4 border-amber-500 bg-amber-50 px-3 py-2 text-sm text-amber-900 sm:col-span-3">TLD sẽ không còn được cung cấp cho tra cứu và đăng ký domain mới trên storefront.</p>}
      </div>
      <div className="mt-6 flex justify-end gap-2"><button type="button" disabled={busy} onClick={onClose} className="rounded border border-[#cbd6d8] px-4 py-2 text-sm font-semibold">Hủy</button><button type="submit" disabled={busy || !normalizeTld(tld)} className="rounded bg-[#116966] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{busy ? "Đang lưu..." : "Lưu bảng giá"}</button></div>
    </form>
  </div>;
}

export default function AdminTldPricingDirectory() {
  const user = useAuthStore((state) => state.user);
  const manageable = can(user, "services.manage");
  const { searchParams, update } = useAdminQueryState();
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const search = searchParams.get("search") ?? "";
  const active = searchParams.get("is_active") ?? "";
  const auto = searchParams.get("is_auto_register") ?? "";
  const [draftSearch, setDraftSearch] = useState(search);
  const [response, setResponse] = useState<PaginatedResponse<TldPricing> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<TldPricing | null | undefined>(undefined);
  const [deleting, setDeleting] = useState<TldPricing | null>(null);
  const [busy, setBusy] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<ValidationErrors>({});
  const [reload, setReload] = useState(0);
  const query = useMemo(() => ({ page, per_page: 15, ...(search ? { search } : {}), ...(active ? { is_active: active === "1" ? 1 as const : 0 as const } : {}), ...(auto ? { is_auto_register: auto === "1" ? 1 as const : 0 as const } : {}) }), [page, search, active, auto]);
  const load = useCallback(async (signal?: AbortSignal) => setResponse(await adminServicesService.getTldPricing(query, signal)), [query]);

  useEffect(() => {
    const controller = new AbortController();
    Promise.resolve().then(() => { setLoading(true); setError(null); return load(controller.signal); })
      .catch((requestError) => { if (!axios.isCancel(requestError)) setError(normalizeApiError(requestError).message); })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [load, reload]);

  const save = async (payload: TldPricingWritePayload) => {
    setBusy(true); setFieldErrors({});
    try {
      if (editing) await adminServicesService.updateTldPricing(editing.id, payload);
      else await adminServicesService.createTldPricing(payload);
      toast.success(editing ? "Đã cập nhật bảng giá TLD." : "Đã thêm bảng giá TLD.");
      setEditing(undefined); await load();
    } catch (requestError) {
      const apiError = normalizeApiError(requestError); setFieldErrors(apiError.fieldErrors); toast.error(apiError.message);
    } finally { setBusy(false); }
  };

  const remove = async () => {
    if (!deleting) return; setBusy(true);
    try { await adminServicesService.deleteTldPricing(deleting.id); toast.success("Đã xóa bảng giá TLD."); setDeleting(null); await load(); }
    catch (requestError) { toast.error(normalizeApiError(requestError).message); }
    finally { setBusy(false); }
  };

  return <section><header className="mb-5 flex flex-wrap items-end justify-between gap-3"><div><h1 className="text-xl font-bold">Bảng giá TLD</h1><p className="mt-1 text-sm text-[#60727a]">Quản lý giá đăng ký, gia hạn, chuyển tên miền và cơ chế xử lý.</p></div>{manageable && <button type="button" onClick={() => { setFieldErrors({}); setEditing(null); }} className="h-9 rounded bg-[#116966] px-4 text-sm font-semibold text-white"><i className="fas fa-plus mr-2" aria-hidden="true" />Thêm TLD</button>}</header>
    <AdminFilterBar onSubmit={(event) => { event.preventDefault(); update({ search: draftSearch.trim(), page: 1 }); }}><AdminFormField id="tld-search" label="Tìm kiếm" value={draftSearch} onChange={(event) => setDraftSearch(event.target.value)} placeholder=".com, .vn" /><label className="text-xs font-semibold text-[#52636c]">Xử lý đăng ký<select value={auto} onChange={(event) => update({ is_auto_register: event.target.value, page: 1 })} className="mt-1 h-9 min-w-40 rounded border border-[#cbd6d8] bg-white px-3 text-sm font-normal"><option value="">Tất cả</option><option value="1">Tự động</option><option value="0">Thủ công</option></select></label><label className="text-xs font-semibold text-[#52636c]">Trạng thái<select value={active} onChange={(event) => update({ is_active: event.target.value, page: 1 })} className="mt-1 h-9 min-w-32 rounded border border-[#cbd6d8] bg-white px-3 text-sm font-normal"><option value="">Tất cả</option><option value="1">Hoạt động</option><option value="0">Đã ẩn</option></select></label><button type="submit" className="h-9 rounded bg-[#116966] px-4 text-sm font-semibold text-white">Lọc</button></AdminFilterBar>
    {loading ? <LoadingState label="Đang tải bảng giá TLD..." /> : error ? <ErrorState message={error} onRetry={() => setReload((value) => value + 1)} /> : <><div className="mb-2 text-right text-xs text-[#60727a]">{response?.meta.total ?? 0} TLD</div><AdminDataTable rows={response?.data ?? []} rowKey={(pricing) => pricing.id} columns={[
      { key: "tld", header: "TLD", render: (pricing) => <strong className="text-base">{normalizeTld(pricing.tld)}</strong> },
      { key: "register", header: "Đăng ký", render: (pricing) => formatCurrency(pricing.register_price) },
      { key: "renew", header: "Gia hạn", render: (pricing) => <strong>{formatCurrency(pricing.renew_price)}</strong> },
      { key: "transfer", header: "Chuyển về", render: (pricing) => formatCurrency(pricing.transfer_price) },
      { key: "mode", header: "Xử lý", render: (pricing) => pricing.is_auto_register ? "Tự động" : "Thủ công" },
      { key: "status", header: "Trạng thái", render: (pricing) => <span className={pricing.is_active ? "font-semibold text-emerald-700" : "font-semibold text-red-700"}>{pricing.is_active ? "Hoạt động" : "Đã ẩn"}</span> },
      { key: "created", header: "Ngày tạo", render: (pricing) => formatDate(pricing.created_at) },
      { key: "actions", header: "Thao tác", render: (pricing) => manageable ? <div className="flex gap-1"><button type="button" title="Chỉnh sửa" aria-label={`Chỉnh sửa ${pricing.tld}`} onClick={() => { setFieldErrors({}); setEditing(pricing); }} className="size-8 text-[#116966]"><i className="fas fa-pen" aria-hidden="true" /></button><button type="button" title="Xóa" aria-label={`Xóa ${pricing.tld}`} onClick={() => setDeleting(pricing)} className="size-8 text-red-700"><i className="fas fa-trash" aria-hidden="true" /></button></div> : null },
    ]} emptyMessage="Không tìm thấy TLD phù hợp." /><div className="mt-4"><Pagination currentPage={response?.meta.current_page ?? 1} lastPage={response?.meta.last_page ?? 1} onPageChange={(next) => update({ page: next })} /></div></>}
    {editing !== undefined && <TldPricingDialog pricing={editing} busy={busy} fieldErrors={fieldErrors} onClose={() => setEditing(undefined)} onSubmit={save} />}
    {deleting && <AdminConfirmDialog title="Xóa bảng giá TLD" message={`Xóa “${normalizeTld(deleting.tld)}”? Nếu chỉ muốn ngừng nhận đơn mới, hãy tắt trạng thái thay vì xóa.`} confirmLabel="Xóa TLD" destructive busy={busy} onClose={() => setDeleting(null)} onConfirm={remove} />}
  </section>;
}
