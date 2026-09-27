"use client";

import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import ErrorState from "@/components/shared/ErrorState";
import LoadingState from "@/components/shared/LoadingState";
import Pagination from "@/components/shared/Pagination";
import { useAdminQueryState } from "@/hooks/admin/useAdminQueryState";
import { useDialogAccessibility } from "@/hooks/useDialogAccessibility";
import { normalizeApiError } from "@/lib/api-error";
import { formatCurrency, formatDateTime, getStatusLabel } from "@/lib/format";
import { adminOperationsService } from "@/services/admin/adminOperationsService";
import type { PaginatedResponse } from "@/types/api";
import type { AdminOrder, AdminOrderQuery, OrderItemType, OrderStatus } from "@/types/orders";
import AdminDataTable from "./AdminDataTable";
import AdminFilterBar from "./AdminFilterBar";
import AdminFormField from "./AdminFormField";

const typeLabels: Record<OrderItemType, string> = { product: "Mã nguồn", hosting: "Hosting", domain: "Tên miền", vps: "VPS" };
const statusClass = (status: OrderStatus) => status === "completed" ? "text-emerald-700" : status === "failed" ? "text-red-700" : "text-amber-700";

function OrderDetailDialog({ order, loading, onClose }: { order: AdminOrder | null; loading: boolean; onClose: () => void }) {
  const dialogRef = useDialogAccessibility(true, onClose);
  return <div ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="order-detail-title" className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-md bg-white p-5 shadow-xl">
    <div className="flex items-start justify-between gap-4"><div><h2 id="order-detail-title" className="text-lg font-bold">Chi tiết đơn hàng {order ? `#${order.id}` : ""}</h2><p className="mt-1 text-sm text-[#60727a]">Dữ liệu đối soát và dịch vụ phát sinh từ đơn.</p></div><button type="button" aria-label="Đóng" onClick={onClose} className="size-8"><i className="fas fa-xmark" aria-hidden="true" /></button></div>
    {loading || !order ? <LoadingState label="Đang tải chi tiết đơn hàng..." /> : <div className="mt-5 space-y-5">
      <dl className="grid gap-x-6 gap-y-3 border-y border-[#dce3e5] py-4 text-sm sm:grid-cols-2 lg:grid-cols-4"><div><dt className="text-xs text-[#60727a]">Khách hàng</dt><dd className="mt-1 font-semibold">{order.user?.name ?? "-"}<span className="block font-normal text-[#60727a]">{order.user?.email}</span></dd></div><div><dt className="text-xs text-[#60727a]">Trạng thái</dt><dd className={`mt-1 font-semibold ${statusClass(order.status)}`}>{getStatusLabel(order.status)}</dd></div><div><dt className="text-xs text-[#60727a]">Thanh toán</dt><dd className="mt-1 font-semibold">{formatCurrency(order.final_amount)}<span className="block font-normal text-[#60727a]">Giảm {formatCurrency(order.discount_amount)}</span></dd></div><div><dt className="text-xs text-[#60727a]">Thời gian</dt><dd className="mt-1 font-semibold">{formatDateTime(order.created_at)}</dd></div></dl>
      <section><h3 className="mb-2 text-sm font-bold">Dòng đơn hàng</h3><div className="divide-y divide-[#e1e7e8] border border-[#dce3e5]">{order.items.map((item) => { const snapshot = item.item as { title?: string; name?: string } | null; return <div key={item.id} className="grid gap-3 p-4 text-sm sm:grid-cols-[1fr_auto]"><div><strong>{typeLabels[item.item_type]}</strong><span className="ml-2 text-[#60727a]">{snapshot?.title ?? snapshot?.name ?? item.service?.domain_name ?? `#${item.item_id}`}</span>{item.service && <span className="mt-1 block text-xs text-[#60727a]">Dịch vụ #{item.service.id} · {getStatusLabel(item.service.status)} · {item.service.domain_name ?? "-"}</span>}</div><div className="text-right"><strong>{formatCurrency(item.subtotal)}</strong><span className="block text-xs text-[#60727a]">{item.quantity} × {formatCurrency(item.price)}</span></div>{item.config && Object.keys(item.config).length > 0 && <details className="sm:col-span-2"><summary className="cursor-pointer text-xs font-semibold text-[#116966]">Cấu hình an toàn</summary><pre className="mt-2 overflow-x-auto bg-[#f4f7f7] p-3 text-xs text-[#42545b]">{JSON.stringify(item.config, null, 2)}</pre></details>}</div>; })}</div></section>
      {order.coupon && <p className="text-sm"><span className="text-[#60727a]">Coupon:</span> <strong className="font-mono">{order.coupon.code}</strong></p>}
    </div>}
  </div></div>;
}

export default function AdminOrderDirectory() {
  const { searchParams, update } = useAdminQueryState();
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const search = searchParams.get("search") ?? "";
  const status = (searchParams.get("status") ?? "") as OrderStatus | "";
  const itemType = (searchParams.get("item_type") ?? "") as OrderItemType | "";
  const [draft, setDraft] = useState({ search, user_id: searchParams.get("user_id") ?? "", date_from: searchParams.get("date_from") ?? "", date_to: searchParams.get("date_to") ?? "", min_amount: searchParams.get("min_amount") ?? "", max_amount: searchParams.get("max_amount") ?? "" });
  const [response, setResponse] = useState<PaginatedResponse<AdminOrder> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<AdminOrder | null | undefined>(undefined);
  const [detailLoading, setDetailLoading] = useState(false);
  const [reload, setReload] = useState(0);
  const query = useMemo<AdminOrderQuery>(() => ({ page, per_page: 15, ...(search ? { search } : {}), ...(status ? { status } : {}), ...(itemType ? { item_type: itemType } : {}), ...(searchParams.get("user_id") ? { user_id: Number(searchParams.get("user_id")) } : {}), ...(searchParams.get("date_from") ? { date_from: searchParams.get("date_from")! } : {}), ...(searchParams.get("date_to") ? { date_to: searchParams.get("date_to")! } : {}), ...(searchParams.get("min_amount") ? { min_amount: searchParams.get("min_amount")! } : {}), ...(searchParams.get("max_amount") ? { max_amount: searchParams.get("max_amount")! } : {}) }), [page, search, status, itemType, searchParams]);
  const load = useCallback(async (signal?: AbortSignal) => setResponse(await adminOperationsService.getOrders(query, signal)), [query]);

  useEffect(() => { const controller = new AbortController(); Promise.resolve().then(() => { setLoading(true); setError(null); return load(controller.signal); }).catch((requestError) => { if (!axios.isCancel(requestError)) setError(normalizeApiError(requestError).message); }).finally(() => setLoading(false)); return () => controller.abort(); }, [load, reload]);
  const openDetail = async (id: number) => { setDetail(null); setDetailLoading(true); try { setDetail(await adminOperationsService.getOrder(id)); } catch (requestError) { setDetail(undefined); setError(normalizeApiError(requestError).message); } finally { setDetailLoading(false); } };

  return <section><header className="mb-5"><h1 className="text-xl font-bold">Đơn hàng</h1><p className="mt-1 text-sm text-[#60727a]">Đối soát đơn hàng theo trạng thái và loại dịch vụ.</p></header>
    <AdminFilterBar onSubmit={(event) => { event.preventDefault(); update({ ...draft, page: 1 }); }}><AdminFormField id="order-search" label="Khách hàng" value={draft.search} onChange={(event) => setDraft((value) => ({ ...value, search: event.target.value }))} placeholder="Tên hoặc email" /><AdminFormField id="order-user" label="User ID" type="number" min="1" value={draft.user_id} onChange={(event) => setDraft((value) => ({ ...value, user_id: event.target.value }))} /><label className="text-xs font-semibold text-[#52636c]">Trạng thái<select value={status} onChange={(event) => update({ status: event.target.value, page: 1 })} className="mt-1 h-9 min-w-36 rounded border border-[#cbd6d8] bg-white px-3 text-sm font-normal"><option value="">Tất cả</option><option value="processing">Đang xử lý</option><option value="completed">Hoàn thành</option><option value="failed">Thất bại</option></select></label><label className="text-xs font-semibold text-[#52636c]">Loại<select value={itemType} onChange={(event) => update({ item_type: event.target.value, page: 1 })} className="mt-1 h-9 min-w-36 rounded border border-[#cbd6d8] bg-white px-3 text-sm font-normal"><option value="">Tất cả</option>{Object.entries(typeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><AdminFormField id="order-from" label="Từ ngày" type="date" value={draft.date_from} onChange={(event) => setDraft((value) => ({ ...value, date_from: event.target.value }))} /><AdminFormField id="order-to" label="Đến ngày" type="date" value={draft.date_to} onChange={(event) => setDraft((value) => ({ ...value, date_to: event.target.value }))} /><AdminFormField id="order-min" label="Từ số tiền" type="number" min="0" value={draft.min_amount} onChange={(event) => setDraft((value) => ({ ...value, min_amount: event.target.value }))} /><AdminFormField id="order-max" label="Đến số tiền" type="number" min="0" value={draft.max_amount} onChange={(event) => setDraft((value) => ({ ...value, max_amount: event.target.value }))} /><button type="submit" className="h-9 rounded bg-[#116966] px-4 text-sm font-semibold text-white">Lọc</button></AdminFilterBar>
    {loading ? <LoadingState label="Đang tải đơn hàng..." /> : error ? <ErrorState message={error} onRetry={() => setReload((value) => value + 1)} /> : <><div className="mb-2 text-right text-xs text-[#60727a]">{response?.meta.total ?? 0} đơn hàng</div><AdminDataTable rows={response?.data ?? []} rowKey={(order) => order.id} columns={[
      { key: "id", header: "Mã đơn", render: (order) => <strong>#{order.id}</strong> },
      { key: "user", header: "Khách hàng", render: (order) => <div><strong>{order.user?.name ?? "-"}</strong><span className="block text-xs text-[#60727a]">{order.user?.email}</span></div> },
      { key: "status", header: "Trạng thái", render: (order) => <span className={`font-semibold ${statusClass(order.status)}`}>{getStatusLabel(order.status)}</span> },
      { key: "amount", header: "Thanh toán", render: (order) => <div><strong>{formatCurrency(order.final_amount)}</strong>{Number(order.discount_amount) > 0 && <span className="block text-xs text-[#60727a]">Giảm {formatCurrency(order.discount_amount)}</span>}</div> },
      { key: "items", header: "Dòng đơn", render: (order) => order.item_count },
      { key: "created", header: "Ngày tạo", render: (order) => formatDateTime(order.created_at) },
      { key: "action", header: "Chi tiết", render: (order) => <button type="button" title="Xem chi tiết" aria-label={`Xem đơn hàng ${order.id}`} onClick={() => void openDetail(order.id)} className="size-8 text-[#116966]"><i className="fas fa-eye" aria-hidden="true" /></button> },
    ]} emptyMessage="Không tìm thấy đơn hàng." /><div className="mt-4"><Pagination currentPage={response?.meta.current_page ?? 1} lastPage={response?.meta.last_page ?? 1} onPageChange={(next) => update({ page: next })} /></div></>}
    {detail !== undefined && <OrderDetailDialog order={detail} loading={detailLoading} onClose={() => setDetail(undefined)} />}
  </section>;
}
