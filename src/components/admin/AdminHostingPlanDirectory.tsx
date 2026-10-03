"use client";

import axios from "axios";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { adminServicesService } from "@/services/admin/adminServicesService";
import { useAuthStore } from "@/stores/authStore";
import type { PaginatedResponse, ValidationErrors } from "@/types/api";
import type { AdminHostingPlan, HostingPlanWritePayload, ProviderHostingPlan, Server } from "@/types/services";
import AdminConfirmDialog from "./AdminConfirmDialog";
import AdminDataTable from "./AdminDataTable";
import AdminFilterBar from "./AdminFilterBar";
import AdminFormField from "./AdminFormField";

const packageNamePattern = /^\S+$/;
const featuresToText = (features: Record<string, string> = {}) => Object.entries(features).map(([key, value]) => `${key}=${value}`).join("\n");
const textToFeatures = (value: string) => Object.fromEntries(value.split("\n").map((line) => line.trim()).filter(Boolean).map((line) => {
  const separator = line.indexOf("=");
  return separator < 1 ? [line, ""] : [line.slice(0, separator).trim(), line.slice(separator + 1).trim()];
}));

function LocalResourceInput({ label, value, onChange, error }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: React.ReactNode;
}) {
  const unlimited = value === "0";
  const lastFinite = useRef(value !== "0" ? value : "1");

  useEffect(() => {
    if (value !== "0" && value !== "") lastFinite.current = value;
  }, [value]);

  return <div className="min-w-0 text-sm">
    <label className="font-semibold">{label}<input aria-label={label} required disabled={unlimited} type="number" min="1" step="1" value={unlimited ? "" : value} onChange={(event) => { lastFinite.current = event.target.value; onChange(event.target.value); }} placeholder={unlimited ? "Không giới hạn" : undefined} className="mt-1 h-10 w-full rounded border border-[#cbd6d8] px-3 font-normal disabled:bg-[#f1f5f9] disabled:text-[#60727a]" /></label>
    <label className="mt-2 flex min-h-6 cursor-pointer items-center gap-2 text-xs font-medium text-[#334155]"><input type="checkbox" aria-label={`${label}: Không giới hạn`} checked={unlimited} onChange={(event) => onChange(event.target.checked ? "0" : lastFinite.current)} className="size-4 accent-[#116966]" />Không giới hạn</label>
    {error}
  </div>;
}

function LocalMemoryInput({ value, onChange, error }: { value: string; onChange: (value: string) => void; error?: React.ReactNode }) {
  const disabled = value === "";
  const [lastValue, setLastValue] = useState(value || "1024");

  return <div className="min-w-0 text-sm">
    <label className="font-semibold">RAM metadata (MB)<input aria-label="RAM metadata (MB)" disabled={disabled} type="number" min="1" step="1" value={value} onChange={(event) => { setLastValue(event.target.value); onChange(event.target.value); }} placeholder={disabled ? "Không cấu hình" : undefined} className="mt-1 h-10 w-full rounded border border-[#cbd6d8] px-3 font-normal disabled:bg-[#f1f5f9]" /></label>
    <label className="mt-2 flex min-h-6 cursor-pointer items-center gap-2 text-xs font-medium text-[#334155]"><input type="checkbox" aria-label="RAM metadata: Không cấu hình" checked={disabled} onChange={(event) => onChange(event.target.checked ? "" : lastValue)} className="size-4 accent-[#116966]" />Không cấu hình</label>
    {error}
  </div>;
}

function HostingPlanDialog({ plan, servers, busy, fieldErrors, onClose, onSubmit }: {
  plan: AdminHostingPlan | null; servers: Server[]; busy: boolean; fieldErrors: ValidationErrors;
  onClose: () => void; onSubmit: (payload: HostingPlanWritePayload) => void;
}) {
  const dialogRef = useDialogAccessibility(true, onClose, !busy);
  const [serverId, setServerId] = useState(String(plan?.server_id ?? servers.find((server) => server.is_active)?.id ?? servers[0]?.id ?? ""));
  const [name, setName] = useState(plan?.name ?? "");
  const [packageName, setPackageName] = useState(plan?.whm_package_name ?? "");
  const [diskQuota, setDiskQuota] = useState(String(plan?.disk_quota ?? 1024));
  const [bandwidth, setBandwidth] = useState(String(plan?.bandwidth_limit_mb ?? 0));
  const [memory, setMemory] = useState(plan?.memory_limit_mb == null ? "" : String(plan.memory_limit_mb));
  const [maxFtp, setMaxFtp] = useState(String(plan?.max_ftp_accounts ?? 0));
  const [maxEmail, setMaxEmail] = useState(String(plan?.max_email_accounts ?? 0));
  const [maxDatabases, setMaxDatabases] = useState(String(plan?.max_databases ?? 0));
  const [maxSubdomains, setMaxSubdomains] = useState(String(plan?.max_subdomains ?? 0));
  const [maxParked, setMaxParked] = useState(String(plan?.max_parked_domains ?? 0));
  const [maxAddon, setMaxAddon] = useState(String(plan?.max_addon_domains ?? 0));
  const [customFeatures, setCustomFeatures] = useState(featuresToText(plan?.custom_features));
  const [price, setPrice] = useState(plan?.price_per_month ?? "0.00");
  const [displayOrder, setDisplayOrder] = useState(String(plan?.display_order ?? 0));
  const [active, setActive] = useState(plan?.is_active ?? true);
  const [providerPlans, setProviderPlans] = useState<ProviderHostingPlan[]>([]);
  const [providerLoading, setProviderLoading] = useState(false);
  const [providerError, setProviderError] = useState("");
  const [localPackageError, setLocalPackageError] = useState("");
  const selectedServer = servers.find((server) => server.id === Number(serverId));
  const usesWhmCatalog = selectedServer?.type === "whm" && selectedServer.provisioning_mode === "automatic";
  const errorFor = (field: string) => fieldErrors[field]?.map((message) => <span key={message} className="mt-1 block text-xs text-red-600">{message}</span>);

  useEffect(() => {
    if (!usesWhmCatalog || !selectedServer?.has_api_token) return;
    const controller = new AbortController();
    Promise.resolve().then(() => { setProviderLoading(true); setProviderError(""); return adminServicesService.getProviderPlans(selectedServer.id, controller.signal); })
      .then(setProviderPlans)
      .catch((requestError) => { if (!axios.isCancel(requestError)) setProviderError(normalizeApiError(requestError).message); })
      .finally(() => setProviderLoading(false));
    return () => controller.abort();
  }, [selectedServer?.id, selectedServer?.has_api_token, usesWhmCatalog]);

  const applyProviderResources = (providerPlan: ProviderHostingPlan) => {
    setDiskQuota(String(providerPlan.quota_mb));
    setBandwidth(String(providerPlan.bandwidth_mb));
    setMaxFtp(String(providerPlan.max_ftp_accounts));
    setMaxEmail(String(providerPlan.max_email_accounts));
    setMaxDatabases(String(providerPlan.max_databases));
    setMaxSubdomains(String(providerPlan.max_subdomains));
    setMaxParked(String(providerPlan.max_parked_domains));
    setMaxAddon(String(providerPlan.max_addon_domains));
  };

  const chooseProviderPlan = (value: string) => {
    setPackageName(value);
    const providerPlan = providerPlans.find((item) => item.name === value);
    if (!providerPlan) return;
    applyProviderResources(providerPlan);
    if (!name.trim()) setName(providerPlan.name);
  };

  const setAllUnlimited = () => {
    setDiskQuota("0"); setBandwidth("0"); setMaxFtp("0"); setMaxEmail("0");
    setMaxDatabases("0"); setMaxSubdomains("0"); setMaxParked("0"); setMaxAddon("0"); setMemory("");
  };

  const selectedProviderPlan = providerPlans.find((item) => item.name === packageName);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const normalizedPackage = packageName.trim();
    if (!packageNamePattern.test(normalizedPackage)) { setLocalPackageError("Tên package không được chứa khoảng trắng."); return; }
    setLocalPackageError("");
    onSubmit({
      server_id: Number(serverId), name: name.trim(), whm_package_name: normalizedPackage,
      disk_quota: Number(diskQuota), bandwidth_limit_mb: Number(bandwidth),
      memory_limit_mb: memory === "" ? null : Number(memory),
      max_ftp_accounts: Number(maxFtp), max_email_accounts: Number(maxEmail),
      max_databases: Number(maxDatabases), max_subdomains: Number(maxSubdomains),
      max_parked_domains: Number(maxParked), max_addon_domains: Number(maxAddon),
      custom_features: textToFeatures(customFeatures),
      price_per_month: toMoneyString(price || 0), display_order: Number(displayOrder), is_active: active,
    });
  };

  const currentPackageMissing = Boolean(packageName && providerPlans.length && !providerPlans.some((item) => item.name === packageName));
  return <div ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="hosting-plan-dialog-title" className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) onClose(); }}>
    <form onSubmit={submit} className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-md bg-white p-5 shadow-xl">
      <div className="flex items-start justify-between gap-4"><div><h2 id="hosting-plan-dialog-title" className="text-lg font-bold">{plan ? "Chỉnh sửa gói hosting" : "Thêm gói hosting"}</h2><p className="mt-1 text-sm text-[#60727a]">Package dùng để cấp phát. Tài nguyên và giá bán bên dưới là cấu hình local độc lập.</p></div><button type="button" aria-label="Đóng" onClick={onClose} disabled={busy} className="size-8"><i className="fas fa-xmark" aria-hidden="true" /></button></div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-semibold sm:col-span-2">Máy chủ<select required value={serverId} onChange={(event) => { setServerId(event.target.value); setPackageName(""); setProviderPlans([]); setProviderError(""); }} className="mt-1 h-10 w-full rounded border border-[#cbd6d8] bg-white px-3 font-normal"><option value="">Chọn máy chủ</option>{servers.map((server) => <option key={server.id} value={server.id}>{server.name} ({server.type}){server.is_active ? "" : " - đã tắt"}</option>)}</select>{errorFor("server_id")}</label>
        <label className="text-sm font-semibold">Tên gói bán<input autoFocus required maxLength={255} value={name} onChange={(event) => setName(event.target.value)} className="mt-1 h-10 w-full rounded border border-[#cbd6d8] px-3 font-normal" />{errorFor("name")}</label>
        {usesWhmCatalog ? <label className="text-sm font-semibold">Package WHM<select required disabled={providerLoading || providerPlans.length === 0} value={packageName} onChange={(event) => chooseProviderPlan(event.target.value)} className="mt-1 h-10 w-full rounded border border-[#cbd6d8] bg-white px-3 font-normal disabled:bg-[#f1f5f9]"><option value="">{providerLoading ? "Đang tải package..." : "Chọn package"}</option>{currentPackageMissing && <option value={packageName}>{packageName} - không còn trên WHM</option>}{providerPlans.map((item) => <option key={item.name} value={item.name}>{item.name}</option>)}</select>{providerError && <span className="mt-1 block text-xs text-red-600">{providerError}</span>}{!providerLoading && !providerError && providerPlans.length === 0 && <span className="mt-1 block text-xs font-normal text-amber-700">Máy chủ chưa có package khả dụng.</span>}{errorFor("whm_package_name")}</label> : <label className="text-sm font-semibold">Tên package panel<input required maxLength={100} value={packageName} onChange={(event) => setPackageName(event.target.value)} placeholder="basic_1gb" className="mt-1 h-10 w-full rounded border border-[#cbd6d8] px-3 font-normal" />{localPackageError && <span className="mt-1 block text-xs text-red-600">{localPackageError}</span>}{errorFor("whm_package_name")}</label>}
        <LocalResourceInput label="Dung lượng (MB)" value={diskQuota} onChange={setDiskQuota} error={errorFor("disk_quota")} />
        <label className="text-sm font-semibold">Giá mỗi tháng<input required type="number" min="0" step="0.01" value={price} onChange={(event) => setPrice(event.target.value)} className="mt-1 h-10 w-full rounded border border-[#cbd6d8] px-3 font-normal" />{errorFor("price_per_month")}</label>
        <label className="text-sm font-semibold sm:col-span-2">Thứ tự hiển thị<input aria-label="Thứ tự hiển thị" required type="number" min="0" max="999999" step="1" value={displayOrder} onChange={(event) => setDisplayOrder(event.target.value)} className="mt-1 h-10 w-full rounded border border-[#cbd6d8] px-3 font-normal" /><span className="mt-1 block text-xs font-normal text-[#60727a]">Số nhỏ hơn sẽ xuất hiện trước trên trang chủ và danh mục hosting.</span>{errorFor("display_order")}</label>
        <div className="sm:col-span-2 border-t border-[#dbe3e5] pt-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="text-sm font-bold text-[#334155]">Tài nguyên gói local</h3><p className="mt-1 text-xs text-[#60727a]">Độc lập với thông số package WHM và có thể cấu hình cao hơn.</p></div><div className="flex flex-wrap gap-2"><button type="button" onClick={setAllUnlimited} className="inline-flex h-9 items-center gap-2 rounded border border-[#9fb6b8] px-3 text-xs font-semibold text-[#116966]"><i className="fas fa-infinity" aria-hidden="true" />Tất cả không giới hạn</button><button type="button" disabled={!selectedProviderPlan} onClick={() => { if (selectedProviderPlan) applyProviderResources(selectedProviderPlan); }} className="inline-flex h-9 items-center gap-2 rounded border border-[#cbd6d8] px-3 text-xs font-semibold text-[#334155] disabled:opacity-40"><i className="fas fa-rotate-left" aria-hidden="true" />Lấy lại từ package</button></div></div></div>
        <LocalResourceInput label="Băng thông (MB)" value={bandwidth} onChange={setBandwidth} error={errorFor("bandwidth_limit_mb")} />
        <LocalMemoryInput value={memory} onChange={setMemory} error={errorFor("memory_limit_mb")} />
        <LocalResourceInput label="Tài khoản FTP" value={maxFtp} onChange={setMaxFtp} error={errorFor("max_ftp_accounts")} />
        <LocalResourceInput label="Tài khoản email" value={maxEmail} onChange={setMaxEmail} error={errorFor("max_email_accounts")} />
        <LocalResourceInput label="Database" value={maxDatabases} onChange={setMaxDatabases} error={errorFor("max_databases")} />
        <LocalResourceInput label="Subdomain" value={maxSubdomains} onChange={setMaxSubdomains} error={errorFor("max_subdomains")} />
        <LocalResourceInput label="Parked domain" value={maxParked} onChange={setMaxParked} error={errorFor("max_parked_domains")} />
        <LocalResourceInput label="Addon domain" value={maxAddon} onChange={setMaxAddon} error={errorFor("max_addon_domains")} />
        <label className="text-sm font-semibold sm:col-span-2">Thông số tùy chỉnh<textarea rows={3} value={customFeatures} onChange={(event) => setCustomFeatures(event.target.value)} placeholder={"backup=Hàng ngày\nsupport=24/7"} className="mt-1 w-full rounded border border-[#cbd6d8] px-3 py-2 font-normal" />{errorFor("custom_features")}</label>
        <label className="flex items-center gap-2 text-sm font-semibold sm:col-span-2"><input type="checkbox" checked={active} onChange={(event) => setActive(event.target.checked)} /> Đang bán trên storefront</label>
        {plan?.is_active && !active && <p className="border-l-4 border-amber-500 bg-amber-50 px-3 py-2 text-sm text-amber-900 sm:col-span-2">Gói sẽ bị ẩn khỏi storefront và không nhận đơn mới.</p>}
      </div>
      <div className="mt-6 flex justify-end gap-2"><button type="button" disabled={busy} onClick={onClose} className="rounded border border-[#cbd6d8] px-4 py-2 text-sm font-semibold">Hủy</button><button type="submit" disabled={busy || providerLoading || !serverId || !name.trim() || !packageName.trim()} className="rounded bg-[#116966] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{busy ? "Đang lưu..." : "Lưu gói hosting"}</button></div>
    </form>
  </div>;
}

export default function AdminHostingPlanDirectory() {
  const user = useAuthStore((state) => state.user);
  const manageable = can(user, "services.manage");
  const { searchParams, update } = useAdminQueryState();
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const search = searchParams.get("search") ?? "";
  const serverId = searchParams.get("server_id") ?? "";
  const active = searchParams.get("is_active") ?? "";
  const [draftSearch, setDraftSearch] = useState(search);
  const [response, setResponse] = useState<PaginatedResponse<AdminHostingPlan> | null>(null);
  const [servers, setServers] = useState<Server[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<AdminHostingPlan | null | undefined>(undefined);
  const [deleting, setDeleting] = useState<AdminHostingPlan | null>(null);
  const [busy, setBusy] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<ValidationErrors>({});
  const [reload, setReload] = useState(0);
  const query = useMemo(() => ({ page, per_page: 15, ...(search ? { search } : {}), ...(serverId ? { server_id: Number(serverId) } : {}), ...(active ? { is_active: active === "1" ? 1 as const : 0 as const } : {}) }), [page, search, serverId, active]);
  const load = useCallback(async (signal?: AbortSignal) => {
    const [plans, serverResponse] = await Promise.all([adminServicesService.getHostingPlans(query, signal), adminServicesService.getServers({ per_page: 100 }, signal)]);
    setResponse(plans); setServers(serverResponse.data);
  }, [query]);

  useEffect(() => {
    const controller = new AbortController();
    Promise.resolve().then(() => { setLoading(true); setError(null); return load(controller.signal); })
      .catch((requestError) => { if (!axios.isCancel(requestError)) setError(normalizeApiError(requestError).message); })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [load, reload]);

  const save = async (payload: HostingPlanWritePayload) => {
    setBusy(true); setFieldErrors({});
    try { if (editing) await adminServicesService.updateHostingPlan(editing.id, payload); else await adminServicesService.createHostingPlan(payload); toast.success(editing ? "Đã cập nhật gói hosting." : "Đã tạo gói hosting."); setEditing(undefined); await load(); }
    catch (requestError) { const apiError = normalizeApiError(requestError); setFieldErrors(apiError.fieldErrors); toast.error(apiError.message); }
    finally { setBusy(false); }
  };

  const remove = async () => {
    if (!deleting) return; setBusy(true);
    try { await adminServicesService.deleteHostingPlan(deleting.id); toast.success("Đã xóa gói hosting."); setDeleting(null); await load(); }
    catch (requestError) { toast.error(normalizeApiError(requestError).message); }
    finally { setBusy(false); }
  };

  return <section>
    <header className="mb-5 flex flex-wrap items-end justify-between gap-3"><div><h1 className="text-xl font-bold">Gói hosting</h1><p className="mt-1 text-sm text-[#60727a]">Giá bán local được giữ nguyên khi cron đồng bộ package WHM mỗi giờ.</p></div>{manageable && <button type="button" onClick={() => { setFieldErrors({}); setEditing(null); }} className="h-9 rounded bg-[#116966] px-4 text-sm font-semibold text-white"><i className="fas fa-plus mr-2" aria-hidden="true" />Thêm gói hosting</button>}</header>
    <AdminFilterBar onSubmit={(event) => { event.preventDefault(); update({ search: draftSearch.trim(), page: 1 }); }}><AdminFormField id="hosting-plan-search" label="Tìm kiếm" value={draftSearch} onChange={(event) => setDraftSearch(event.target.value)} placeholder="Tên gói hoặc package" /><label className="text-xs font-semibold text-[#52636c]">Máy chủ<select value={serverId} onChange={(event) => update({ server_id: event.target.value, page: 1 })} className="mt-1 h-9 min-w-44 rounded border border-[#cbd6d8] bg-white px-3 text-sm font-normal"><option value="">Tất cả</option>{servers.map((server) => <option key={server.id} value={server.id}>{server.name}</option>)}</select></label><label className="text-xs font-semibold text-[#52636c]">Trạng thái bán<select value={active} onChange={(event) => update({ is_active: event.target.value, page: 1 })} className="mt-1 h-9 min-w-32 rounded border border-[#cbd6d8] bg-white px-3 text-sm font-normal"><option value="">Tất cả</option><option value="1">Đang bán</option><option value="0">Đã ẩn</option></select></label><button type="submit" className="h-9 rounded bg-[#116966] px-4 text-sm font-semibold text-white">Lọc</button></AdminFilterBar>
    {loading ? <LoadingState label="Đang tải gói hosting..." /> : error ? <ErrorState message={error} onRetry={() => setReload((value) => value + 1)} /> : <><div className="mb-2 text-right text-xs text-[#60727a]">{response?.meta.total ?? 0} gói hosting</div><AdminDataTable rows={response?.data ?? []} rowKey={(plan) => plan.id} columns={[
      { key: "plan", header: "Gói hosting", render: (plan) => <div><strong>{plan.name}</strong><span className="block text-xs text-[#60727a]">{plan.whm_package_name}</span></div> },
      { key: "order", header: "Thứ tự", render: (plan) => <span className="inline-flex min-w-9 justify-center rounded bg-[#edf4f4] px-2 py-1 font-mono text-xs font-bold text-[#315d60]">{plan.display_order}</span> },
      { key: "server", header: "Máy chủ", render: (plan) => plan.server?.name ?? servers.find((server) => server.id === plan.server_id)?.name ?? `#${plan.server_id}` },
      { key: "quota", header: "Tài nguyên", render: (plan) => <div><strong>{plan.disk_quota === 0 ? "Không giới hạn disk" : `${new Intl.NumberFormat("vi-VN").format(plan.disk_quota)} MB disk`}</strong><span className="block text-xs text-[#60727a]">BW {plan.bandwidth_limit_mb === 0 ? "không giới hạn" : `${new Intl.NumberFormat("vi-VN").format(plan.bandwidth_limit_mb)} MB`}{plan.memory_limit_mb ? ` · RAM ${new Intl.NumberFormat("vi-VN").format(plan.memory_limit_mb)} MB` : ""}</span></div> },
      { key: "price", header: "Giá/tháng", render: (plan) => <strong>{formatCurrency(plan.price_per_month)}</strong> },
      { key: "provider", header: "Provider", render: (plan) => <div><span className={plan.provider_available ? "font-semibold text-emerald-700" : "font-semibold text-red-700"}>{plan.provider_available ? "Khả dụng" : "Không còn package"}</span><span className="block text-xs text-[#60727a]">{plan.provider_synced_at ? `Đồng bộ ${formatDate(plan.provider_synced_at)}` : "Chưa đồng bộ"}</span></div> },
      { key: "status", header: "Storefront", render: (plan) => <span className={plan.is_active ? "font-semibold text-emerald-700" : "font-semibold text-red-700"}>{plan.is_active ? "Đang bán" : "Đã ẩn"}</span> },
      { key: "actions", header: "Thao tác", render: (plan) => manageable ? <div className="flex gap-1"><button type="button" title="Chỉnh sửa" aria-label={`Chỉnh sửa ${plan.name}`} onClick={() => { setFieldErrors({}); setEditing(plan); }} className="size-8 text-[#116966]"><i className="fas fa-pen" aria-hidden="true" /></button><button type="button" title="Xóa" aria-label={`Xóa ${plan.name}`} onClick={() => setDeleting(plan)} className="size-8 text-red-700"><i className="fas fa-trash" aria-hidden="true" /></button></div> : null },
    ]} emptyMessage="Không tìm thấy gói hosting phù hợp." /><div className="mt-4"><Pagination currentPage={response?.meta.current_page ?? 1} lastPage={response?.meta.last_page ?? 1} onPageChange={(next) => update({ page: next })} /></div></>}
    {editing !== undefined && <HostingPlanDialog plan={editing} servers={servers} busy={busy} fieldErrors={fieldErrors} onClose={() => setEditing(undefined)} onSubmit={save} />}
    {deleting && <AdminConfirmDialog title="Xóa gói hosting" message={`Xóa “${deleting.name}”? Nếu chỉ muốn ngừng bán, hãy chỉnh sửa và tắt trạng thái để bảo toàn dữ liệu liên quan.`} confirmLabel="Xóa gói hosting" destructive busy={busy} onClose={() => setDeleting(null)} onConfirm={remove} />}
  </section>;
}
