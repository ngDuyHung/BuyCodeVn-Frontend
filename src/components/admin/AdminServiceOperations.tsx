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
import { formatCurrency, formatDate, formatDateTime, getStatusLabel } from "@/lib/format";
import { adminOperationsService } from "@/services/admin/adminOperationsService";
import { useAuthStore } from "@/stores/authStore";
import type { PaginatedResponse, ValidationErrors } from "@/types/api";
import type { ActivateManualHostingPayload, AdminUserService, AdminUserServiceQuery, UserServiceStatus, UserServiceType } from "@/types/services";
import AdminConfirmDialog from "./AdminConfirmDialog";
import AdminDataTable from "./AdminDataTable";
import AdminFilterBar from "./AdminFilterBar";
import AdminFormField from "./AdminFormField";

const typeLabels: Record<UserServiceType, string> = { hosting: "Hosting", domain: "Tên miền", vps: "VPS" };
const statusClass = (status: UserServiceStatus) => status === "active" ? "text-emerald-700" : ["failed", "terminated"].includes(status) ? "text-red-700" : "text-amber-700";

function ServiceDetailDialog({ service, loading, onClose }: { service: AdminUserService | null; loading: boolean; onClose: () => void }) {
  const dialogRef = useDialogAccessibility(true, onClose);
  const snapshot = service?.service as ({ name?: string; tld?: string; price_per_month?: string; renew_price?: string } | null | undefined);
  return <div ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="service-detail-title" className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-md bg-white p-5 shadow-xl"><div className="flex items-start justify-between gap-4"><div><h2 id="service-detail-title" className="text-lg font-bold">Chi tiết dịch vụ {service ? `#${service.id}` : ""}</h2><p className="mt-1 text-sm text-[#60727a]">Thông tin vận hành và dữ liệu đăng ký đã loại bỏ secret.</p></div><button type="button" aria-label="Đóng" onClick={onClose} className="size-8"><i className="fas fa-xmark" aria-hidden="true" /></button></div>
    {loading || !service ? <LoadingState label="Đang tải chi tiết dịch vụ..." /> : <div className="mt-5 space-y-5 text-sm"><dl className="grid gap-x-6 gap-y-3 border-y border-[#dce3e5] py-4 sm:grid-cols-2 lg:grid-cols-3"><div><dt className="text-xs text-[#60727a]">Khách hàng</dt><dd className="mt-1 font-semibold">{service.user?.name ?? "-"}<span className="block font-normal text-[#60727a]">{service.user?.email}</span></dd></div><div><dt className="text-xs text-[#60727a]">Loại và trạng thái</dt><dd className="mt-1 font-semibold">{typeLabels[service.service_type]} · <span className={statusClass(service.status)}>{getStatusLabel(service.status)}</span></dd></div><div><dt className="text-xs text-[#60727a]">Tên miền/hostname</dt><dd className="mt-1 font-semibold">{service.domain_name ?? service.vps?.hostname ?? "-"}</dd></div><div><dt className="text-xs text-[#60727a]">Gói</dt><dd className="mt-1 font-semibold">{snapshot?.name ?? snapshot?.tld ?? "-"}</dd></div><div><dt className="text-xs text-[#60727a]">Hết hạn</dt><dd className="mt-1 font-semibold">{formatDate(service.expires_at)}</dd></div><div><dt className="text-xs text-[#60727a]">Đơn hàng</dt><dd className="mt-1 font-semibold">{service.order ? `#${service.order.id} · ${formatCurrency((service.order as { final_amount?: string }).final_amount ?? "0")}` : "-"}</dd></div></dl>
      {service.pending_renewal && <div className="border-l-4 border-amber-500 bg-amber-50 px-3 py-3"><strong>Gia hạn đang chờ duyệt</strong><span className="ml-2 text-[#60727a]">#{service.pending_renewal.id} · {service.pending_renewal.years ?? 1} năm</span></div>}
      {service.hosting_provisioning && <section><h3 className="font-bold">Cấp phát hosting</h3><p className="mt-2 text-[#52636c]">Chế độ: <strong>{service.hosting_provisioning.mode === "manual" ? "Thủ công" : "Tự động"}</strong> · Username: <strong>{service.username ?? "-"}</strong></p><p className="mt-1 text-[#52636c]">Đã cấp phát: {formatDateTime(service.hosting_provisioning.provisioned_at)}</p></section>}
      {service.hosting_provisioning?.provider_last_error && <section className="border-l-4 border-red-600 bg-red-50 px-3 py-3 text-red-800"><h3 className="font-bold">Lỗi cấp phát gần nhất</h3><code className="mt-1 block whitespace-pre-wrap break-words text-xs">{service.hosting_provisioning.provider_last_error}</code><p className="mt-2 text-xs">Đã thử {service.hosting_provisioning.lifecycle_attempts} lần · Đồng bộ {formatDateTime(service.hosting_provisioning.last_synced_at)}</p></section>}
      {service.registration && Object.keys(service.registration).length > 0 && <section><h3 className="font-bold">Thông tin đăng ký an toàn</h3><dl className="mt-2 grid gap-2 bg-[#f4f7f7] p-3 sm:grid-cols-2">{Object.entries(service.registration).map(([key, value]) => <div key={key}><dt className="text-xs text-[#60727a]">{key}</dt><dd className="break-words font-semibold">{typeof value === "object" ? JSON.stringify(value) : String(value ?? "-")}</dd></div>)}</dl></section>}
    </div>}
  </div></div>;
}

function ActivateHostingDialog({ service, busy, fieldErrors, onClose, onSubmit }: { service: AdminUserService; busy: boolean; fieldErrors: ValidationErrors; onClose: () => void; onSubmit: (payload: ActivateManualHostingPayload) => void }) {
  const dialogRef = useDialogAccessibility(true, onClose, !busy);
  const [username, setUsername] = useState(service.username ?? "");
  const [password, setPassword] = useState("");
  const [loginUrl, setLoginUrl] = useState(service.hosting_provisioning?.login_url ?? "");
  const errorFor = (field: string) => fieldErrors[field]?.map((message) => <span key={message} className="mt-1 block text-xs text-red-600">{message}</span>);
  return <div ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="activate-hosting-title" className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"><form onSubmit={(event) => { event.preventDefault(); onSubmit({ username: username.trim(), password, login_url: loginUrl.trim() }); }} className="w-full max-w-lg rounded-md bg-white p-5 shadow-xl"><div className="flex items-start justify-between gap-4"><div><h2 id="activate-hosting-title" className="text-lg font-bold">Kích hoạt hosting thủ công</h2><p className="mt-1 text-sm text-[#60727a]">{service.domain_name}</p></div><button type="button" aria-label="Đóng" disabled={busy} onClick={onClose} className="size-8"><i className="fas fa-xmark" aria-hidden="true" /></button></div><div className="mt-5 space-y-4"><label className="block text-sm font-semibold">Username<input required maxLength={100} value={username} onChange={(event) => setUsername(event.target.value)} className="mt-1 h-10 w-full rounded border border-[#cbd6d8] px-3 font-normal" />{errorFor("username")}</label><label className="block text-sm font-semibold">Mật khẩu tạm<input required type="password" minLength={8} maxLength={255} value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1 h-10 w-full rounded border border-[#cbd6d8] px-3 font-normal" />{errorFor("password")}</label><label className="block text-sm font-semibold">URL đăng nhập<input required type="url" value={loginUrl} onChange={(event) => setLoginUrl(event.target.value)} placeholder="https://panel.example.com:2083" className="mt-1 h-10 w-full rounded border border-[#cbd6d8] px-3 font-normal" />{errorFor("login_url")}</label></div><div className="mt-6 flex justify-end gap-2"><button type="button" disabled={busy} onClick={onClose} className="rounded border border-[#cbd6d8] px-4 py-2 text-sm font-semibold">Hủy</button><button type="submit" disabled={busy || !username.trim() || password.length < 8 || !loginUrl.trim()} className="rounded bg-[#116966] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{busy ? "Đang kích hoạt..." : "Kích hoạt hosting"}</button></div></form></div>;
}

export default function AdminServiceOperations() {
  const user = useAuthStore((state) => state.user);
  const canApproveDomain = can(user, "domains.approve");
  const canManageServices = can(user, "services.manage");
  const { searchParams, update } = useAdminQueryState();
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const search = searchParams.get("search") ?? "";
  const serviceType = (searchParams.get("service_type") ?? "") as UserServiceType | "";
  const status = (searchParams.get("status") ?? "") as UserServiceStatus | "";
  const [draft, setDraft] = useState({ search, user_id: searchParams.get("user_id") ?? "", expiring_before: searchParams.get("expiring_before") ?? "" });
  const [response, setResponse] = useState<PaginatedResponse<AdminUserService> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<AdminUserService | null | undefined>(undefined);
  const [detailLoading, setDetailLoading] = useState(false);
  const [approving, setApproving] = useState<AdminUserService | null>(null);
  const [activating, setActivating] = useState<AdminUserService | null>(null);
  const [busy, setBusy] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<ValidationErrors>({});
  const [reload, setReload] = useState(0);
  const query = useMemo<AdminUserServiceQuery>(() => ({ page, per_page: 15, ...(search ? { search } : {}), ...(serviceType ? { service_type: serviceType } : {}), ...(status ? { status } : {}), ...(searchParams.get("user_id") ? { user_id: Number(searchParams.get("user_id")) } : {}), ...(searchParams.get("expiring_before") ? { expiring_before: searchParams.get("expiring_before")! } : {}) }), [page, search, serviceType, status, searchParams]);
  const load = useCallback(async (signal?: AbortSignal) => setResponse(await adminOperationsService.getServices(query, signal)), [query]);
  useEffect(() => { const controller = new AbortController(); Promise.resolve().then(() => { setLoading(true); setError(null); return load(controller.signal); }).catch((requestError) => { if (!axios.isCancel(requestError)) setError(normalizeApiError(requestError).message); }).finally(() => setLoading(false)); return () => controller.abort(); }, [load, reload]);

  const openDetail = async (id: number) => { setDetail(null); setDetailLoading(true); try { setDetail(await adminOperationsService.getService(id)); } catch (requestError) { setDetail(undefined); setError(normalizeApiError(requestError).message); } finally { setDetailLoading(false); } };
  const approve = async () => { if (!approving || busy) return; setBusy(true); try { const result = await adminOperationsService.approveDomain(approving.id); toast.success(result.idempotent ? "Yêu cầu đã được duyệt trước đó." : result.operation === "renewal" ? "Đã duyệt gia hạn tên miền." : "Đã duyệt đăng ký tên miền."); setApproving(null); await load(); } catch (requestError) { toast.error(normalizeApiError(requestError).message); await load(); } finally { setBusy(false); } };
  const activate = async (payload: ActivateManualHostingPayload) => { if (!activating || busy) return; setBusy(true); setFieldErrors({}); try { const result = await adminOperationsService.activateHosting(activating.id, payload); toast.success(result.idempotent ? "Hosting đã được kích hoạt trước đó." : "Đã kích hoạt hosting thủ công."); setActivating(null); await load(); } catch (requestError) { const apiError = normalizeApiError(requestError); setFieldErrors(apiError.fieldErrors); toast.error(apiError.message); await load(); } finally { setBusy(false); } };

  return <section><header className="mb-5"><h1 className="text-xl font-bold">Dịch vụ khách hàng</h1><p className="mt-1 text-sm text-[#60727a]">Theo dõi dịch vụ và xử lý hàng đợi thủ công.</p></header><AdminFilterBar onSubmit={(event) => { event.preventDefault(); update({ ...draft, page: 1 }); }}><AdminFormField id="service-search" label="Tìm kiếm" value={draft.search} onChange={(event) => setDraft((value) => ({ ...value, search: event.target.value }))} placeholder="Domain, tên hoặc email" /><AdminFormField id="service-user" label="User ID" type="number" min="1" value={draft.user_id} onChange={(event) => setDraft((value) => ({ ...value, user_id: event.target.value }))} /><label className="text-xs font-semibold text-[#52636c]">Loại<select value={serviceType} onChange={(event) => update({ service_type: event.target.value, page: 1 })} className="mt-1 h-9 min-w-36 rounded border border-[#cbd6d8] bg-white px-3 text-sm font-normal"><option value="">Tất cả</option>{Object.entries(typeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label className="text-xs font-semibold text-[#52636c]">Trạng thái<select value={status} onChange={(event) => update({ status: event.target.value, page: 1 })} className="mt-1 h-9 min-w-36 rounded border border-[#cbd6d8] bg-white px-3 text-sm font-normal"><option value="">Tất cả</option>{["pending", "active", "suspended", "expired", "failed", "terminated"].map((value) => <option key={value} value={value}>{getStatusLabel(value)}</option>)}</select></label><AdminFormField id="service-expiry" label="Hết hạn trước" type="date" value={draft.expiring_before} onChange={(event) => setDraft((value) => ({ ...value, expiring_before: event.target.value }))} /><button type="submit" className="h-9 rounded bg-[#116966] px-4 text-sm font-semibold text-white">Lọc</button></AdminFilterBar>
    {loading ? <LoadingState label="Đang tải dịch vụ..." /> : error ? <ErrorState message={error} onRetry={() => setReload((value) => value + 1)} /> : <><div className="mb-2 text-right text-xs text-[#60727a]">{response?.meta.total ?? 0} dịch vụ</div><AdminDataTable rows={response?.data ?? []} rowKey={(service) => service.id} columns={[
      { key: "service", header: "Dịch vụ", render: (service) => <div><strong>{service.domain_name ?? service.vps?.hostname ?? `#${service.id}`}</strong><span className="block text-xs text-[#60727a]">{typeLabels[service.service_type]} · #{service.id}</span></div> },
      { key: "user", header: "Khách hàng", render: (service) => <div><strong>{service.user?.name ?? "-"}</strong><span className="block text-xs text-[#60727a]">{service.user?.email}</span></div> },
      { key: "status", header: "Trạng thái", render: (service) => <div><span className={`font-semibold ${statusClass(service.status)}`}>{getStatusLabel(service.status)}</span>{service.pending_renewal && <span className="block text-xs font-semibold text-amber-700">Gia hạn đang chờ</span>}{service.hosting_provisioning?.provider_last_error && <span className="block text-xs font-semibold text-red-700"><i className="fas fa-triangle-exclamation mr-1" aria-hidden="true" />Có lỗi cấp phát</span>}</div> },
      { key: "expiry", header: "Hết hạn", render: (service) => formatDate(service.expires_at) },
      { key: "actions", header: "Thao tác", render: (service) => <div className="flex gap-1"><button type="button" aria-label={`Xem dịch vụ ${service.id}`} title="Xem chi tiết" onClick={() => void openDetail(service.id)} className="size-8 text-[#116966]"><i className="fas fa-eye" aria-hidden="true" /></button>{canApproveDomain && service.actions.can_approve_domain && <button type="button" disabled={busy} aria-label={`Duyệt tên miền ${service.domain_name}`} title="Duyệt tên miền" onClick={() => setApproving(service)} className="size-8 text-emerald-700 disabled:opacity-40"><i className="fas fa-circle-check" aria-hidden="true" /></button>}{canManageServices && service.actions.can_activate_hosting && <button type="button" disabled={busy} aria-label={`Kích hoạt hosting ${service.domain_name}`} title="Kích hoạt hosting" onClick={() => { setFieldErrors({}); setActivating(service); }} className="size-8 text-blue-700 disabled:opacity-40"><i className="fas fa-power-off" aria-hidden="true" /></button>}</div> },
    ]} emptyMessage="Không tìm thấy dịch vụ." /><div className="mt-4"><Pagination currentPage={response?.meta.current_page ?? 1} lastPage={response?.meta.last_page ?? 1} onPageChange={(next) => update({ page: next })} /></div></>}
    {detail !== undefined && <ServiceDetailDialog service={detail} loading={detailLoading} onClose={() => setDetail(undefined)} />}
    {approving && <AdminConfirmDialog title={approving.pending_renewal ? "Duyệt gia hạn tên miền" : "Duyệt đăng ký tên miền"} message={approving.pending_renewal ? `Duyệt gia hạn ${approving.domain_name} thêm ${approving.pending_renewal.years ?? 1} năm? Hạn mới được cộng từ hạn hiện tại hoặc hôm nay, tùy thời điểm nào muộn hơn.` : `Xác nhận tên miền ${approving.domain_name} đã được đăng ký và sẵn sàng kích hoạt?`} confirmLabel={approving.pending_renewal ? "Duyệt gia hạn" : "Duyệt đăng ký"} busy={busy} onClose={() => setApproving(null)} onConfirm={() => void approve()} />}
    {activating && <ActivateHostingDialog service={activating} busy={busy} fieldErrors={fieldErrors} onClose={() => setActivating(null)} onSubmit={(payload) => void activate(payload)} />}
  </section>;
}
