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
import { formatDate } from "@/lib/format";
import { adminServicesService } from "@/services/admin/adminServicesService";
import { useAuthStore } from "@/stores/authStore";
import type { PaginatedResponse, ValidationErrors } from "@/types/api";
import type { ProvisioningMode, Server, ServerAuthType, ServerType, ServerWritePayload } from "@/types/services";
import AdminConfirmDialog from "./AdminConfirmDialog";
import AdminDataTable from "./AdminDataTable";
import AdminFilterBar from "./AdminFilterBar";
import AdminFormField from "./AdminFormField";
import ProviderPackageManagerDialog from "./ProviderPackageManagerDialog";

const serverTypes: ServerType[] = ["mock", "whm", "cyberpanel"];
const typeLabels: Record<ServerType, string> = { mock: "Mock", whm: "WHM/cPanel", cyberpanel: "CyberPanel" };
const modeLabels: Record<ProvisioningMode, string> = { automatic: "Tự động", manual: "Thủ công" };

function ServerDialog({ server, busy, fieldErrors, onClose, onSubmit }: {
  server: Server | null; busy: boolean; fieldErrors: ValidationErrors;
  onClose: () => void; onSubmit: (payload: ServerWritePayload) => void;
}) {
  const dialogRef = useDialogAccessibility(true, onClose, !busy);
  const [name, setName] = useState(server?.name ?? "");
  const [host, setHost] = useState(server?.ip_address ?? "");
  const [type, setType] = useState<ServerType>(server?.type ?? "whm");
  const [mode, setMode] = useState<ProvisioningMode>(server?.provisioning_mode ?? "automatic");
  const [loginUrl, setLoginUrl] = useState(server?.login_url ?? "");
  const [apiUsername, setApiUsername] = useState(server?.api_username ?? "root");
  const [authType, setAuthType] = useState<ServerAuthType>(server?.api_auth_type ?? "token");
  const [apiSecret, setApiSecret] = useState("");
  const [apiPort, setApiPort] = useState(String(server?.api_port ?? 2087));
  const [verifyTls, setVerifyTls] = useState(server?.verify_tls ?? true);
  const [connectTimeout, setConnectTimeout] = useState(String(server?.connect_timeout ?? 10));
  const [requestTimeout, setRequestTimeout] = useState(String(server?.request_timeout ?? 30));
  const [active, setActive] = useState(server?.is_active ?? true);
  const errorFor = (field: string) => fieldErrors[field]?.map((message) => <span key={message} className="mt-1 block text-xs text-red-600">{message}</span>);

  const changeType = (nextType: ServerType) => {
    setType(nextType);
    if (server) return;
    setApiUsername(nextType === "cyberpanel" ? "admin" : "root");
    setApiPort(nextType === "cyberpanel" ? "8090" : "2087");
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit({
      name: name.trim(), ip_address: host.trim(), type, provisioning_mode: mode,
      login_url: loginUrl.trim() || null, api_username: apiUsername.trim(), api_auth_type: authType,
      api_port: Number(apiPort), verify_tls: verifyTls, connect_timeout: Number(connectTimeout),
      request_timeout: Number(requestTimeout), is_active: active,
      ...(!server || apiSecret ? { api_token: apiSecret || null } : {}),
    });
  };

  const needsCredentials = type !== "mock" && mode === "automatic";
  return <div ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="server-dialog-title" className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) onClose(); }}>
    <form onSubmit={submit} className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-md bg-white p-5 shadow-xl">
      <div className="flex items-start justify-between gap-4"><div><h2 id="server-dialog-title" className="text-lg font-bold">{server ? "Chỉnh sửa máy chủ" : "Thêm máy chủ"}</h2><p className="mt-1 text-sm text-[#60727a]">Cấu hình kết nối panel dùng riêng cho cấp phát và cron hosting.</p></div><button type="button" aria-label="Đóng" onClick={onClose} disabled={busy} className="size-8"><i className="fas fa-xmark" aria-hidden="true" /></button></div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-semibold sm:col-span-2">Tên máy chủ<input autoFocus required maxLength={255} value={name} onChange={(event) => setName(event.target.value)} className="mt-1 h-10 w-full rounded border border-[#cbd6d8] px-3 font-normal" />{errorFor("name")}</label>
        <label className="text-sm font-semibold">Hostname hoặc IP<input required maxLength={253} value={host} onChange={(event) => setHost(event.target.value)} placeholder="whm.example.com" className="mt-1 h-10 w-full rounded border border-[#cbd6d8] px-3 font-normal" />{errorFor("ip_address")}</label>
        <label className="text-sm font-semibold">Loại panel<select value={type} onChange={(event) => changeType(event.target.value as ServerType)} className="mt-1 h-10 w-full rounded border border-[#cbd6d8] bg-white px-3 font-normal">{serverTypes.map((value) => <option key={value} value={value}>{typeLabels[value]}</option>)}</select>{errorFor("type")}</label>
        <label className="text-sm font-semibold">Chế độ cấp phát<select value={mode} onChange={(event) => setMode(event.target.value as ProvisioningMode)} className="mt-1 h-10 w-full rounded border border-[#cbd6d8] bg-white px-3 font-normal"><option value="automatic">Tự động</option><option value="manual">Thủ công</option></select>{errorFor("provisioning_mode")}</label>
        <label className="text-sm font-semibold">URL đăng nhập khách hàng<input type="url" maxLength={2048} value={loginUrl} onChange={(event) => setLoginUrl(event.target.value)} placeholder={type === "whm" ? "https://panel.example.com:2083" : "https://panel.example.com"} className="mt-1 h-10 w-full rounded border border-[#cbd6d8] px-3 font-normal" />{errorFor("login_url")}</label>
        {type !== "mock" && <>
          <div className="sm:col-span-2 border-t border-[#dbe3e5] pt-4"><h3 className="text-sm font-bold text-[#334155]">Xác thực API</h3></div>
          <label className="text-sm font-semibold">Tài khoản API<input required={needsCredentials} maxLength={100} value={apiUsername} onChange={(event) => setApiUsername(event.target.value)} placeholder={type === "whm" ? "root hoặc reseller" : "admin"} className="mt-1 h-10 w-full rounded border border-[#cbd6d8] px-3 font-normal" />{errorFor("api_username")}</label>
          <label className="text-sm font-semibold">Kiểu xác thực<select value={authType} onChange={(event) => setAuthType(event.target.value as ServerAuthType)} className="mt-1 h-10 w-full rounded border border-[#cbd6d8] bg-white px-3 font-normal"><option value="token">API token</option><option value="password">Mật khẩu</option></select>{errorFor("api_auth_type")}</label>
          <label className="text-sm font-semibold sm:col-span-2">{authType === "password" ? "Mật khẩu API" : "API token"}<input type="password" autoComplete="new-password" maxLength={4096} required={!server?.has_api_token && needsCredentials} value={apiSecret} onChange={(event) => setApiSecret(event.target.value)} placeholder={server?.has_api_token ? "Đã cấu hình; để trống để giữ nguyên" : "Nhập thông tin xác thực"} className="mt-1 h-10 w-full rounded border border-[#cbd6d8] px-3 font-normal" />{errorFor("api_token")}<span className="mt-1 block text-xs font-normal text-[#60727a]">Secret chỉ được gửi khi thay đổi và không bao giờ được đọc lại từ API.</span></label>
          <label className="text-sm font-semibold">Cổng API<input required type="number" min="1" max="65535" value={apiPort} onChange={(event) => setApiPort(event.target.value)} className="mt-1 h-10 w-full rounded border border-[#cbd6d8] px-3 font-normal" />{errorFor("api_port")}</label>
          <label className="flex items-center gap-2 self-end pb-2 text-sm font-semibold"><input type="checkbox" checked={verifyTls} onChange={(event) => setVerifyTls(event.target.checked)} /> Xác minh chứng chỉ TLS</label>
          <label className="text-sm font-semibold">Timeout kết nối (giây)<input required type="number" min="1" max="60" value={connectTimeout} onChange={(event) => setConnectTimeout(event.target.value)} className="mt-1 h-10 w-full rounded border border-[#cbd6d8] px-3 font-normal" />{errorFor("connect_timeout")}</label>
          <label className="text-sm font-semibold">Timeout request (giây)<input required type="number" min="1" max="120" value={requestTimeout} onChange={(event) => setRequestTimeout(event.target.value)} className="mt-1 h-10 w-full rounded border border-[#cbd6d8] px-3 font-normal" />{errorFor("request_timeout")}</label>
        </>}
        <label className="flex items-center gap-2 text-sm font-semibold sm:col-span-2"><input type="checkbox" checked={active} onChange={(event) => setActive(event.target.checked)} /> Máy chủ đang hoạt động</label>
        {server?.is_active && !active && <p className="border-l-4 border-amber-500 bg-amber-50 px-3 py-2 text-sm text-amber-900 sm:col-span-2">Tắt máy chủ sẽ ẩn toàn bộ gói hosting liên quan khỏi storefront.</p>}
      </div>
      <div className="mt-6 flex justify-end gap-2"><button type="button" disabled={busy} onClick={onClose} className="rounded border border-[#cbd6d8] px-4 py-2 text-sm font-semibold">Hủy</button><button type="submit" disabled={busy || !name.trim() || !host.trim()} className="rounded bg-[#116966] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{busy ? "Đang lưu..." : "Lưu máy chủ"}</button></div>
    </form>
  </div>;
}

export default function AdminServerDirectory() {
  const user = useAuthStore((state) => state.user);
  const manageable = can(user, "services.manage");
  const { searchParams, update } = useAdminQueryState();
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const search = searchParams.get("search") ?? "";
  const type = searchParams.get("type") ?? "";
  const active = searchParams.get("is_active") ?? "";
  const [draftSearch, setDraftSearch] = useState(search);
  const [response, setResponse] = useState<PaginatedResponse<Server> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Server | null | undefined>(undefined);
  const [deleting, setDeleting] = useState<Server | null>(null);
  const [deleteBlocked, setDeleteBlocked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [testingId, setTestingId] = useState<number | null>(null);
  const [providerDialog, setProviderDialog] = useState<Server | null>(null);
  const [fieldErrors, setFieldErrors] = useState<ValidationErrors>({});
  const [reload, setReload] = useState(0);
  const query = useMemo(() => ({ page, per_page: 15, ...(search ? { search } : {}), ...(type ? { type: type as ServerType } : {}), ...(active ? { is_active: active === "1" ? 1 as const : 0 as const } : {}) }), [page, search, type, active]);
  const load = useCallback(async (signal?: AbortSignal) => setResponse(await adminServicesService.getServers(query, signal)), [query]);

  useEffect(() => {
    const controller = new AbortController();
    Promise.resolve().then(() => { setLoading(true); setError(null); return load(controller.signal); })
      .catch((requestError) => { if (!axios.isCancel(requestError)) setError(normalizeApiError(requestError).message); })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [load, reload]);

  const save = async (payload: ServerWritePayload) => {
    setBusy(true); setFieldErrors({});
    try {
      if (editing) await adminServicesService.updateServer(editing.id, payload); else await adminServicesService.createServer(payload);
      toast.success(editing ? "Đã cập nhật máy chủ." : "Đã tạo máy chủ."); setEditing(undefined); await load();
    } catch (requestError) { const apiError = normalizeApiError(requestError); setFieldErrors(apiError.fieldErrors); toast.error(apiError.message); }
    finally { setBusy(false); }
  };

  const testConnection = async (server: Server) => {
    setTestingId(server.id);
    try { const result = await adminServicesService.testServerConnection(server.id); toast.success(`Kết nối thành công${result.version ? ` · WHM ${result.version}` : ""}.`); }
    catch (requestError) { toast.error(normalizeApiError(requestError).message); }
    finally { setTestingId(null); }
  };

  const removeOrDisable = async () => {
    if (!deleting) return; setBusy(true);
    try {
      if (deleteBlocked) { await adminServicesService.updateServer(deleting.id, { is_active: false }); toast.success("Đã tắt máy chủ; các gói liên quan không còn được bán."); }
      else { await adminServicesService.deleteServer(deleting.id); toast.success("Đã xóa máy chủ."); }
      setDeleting(null); setDeleteBlocked(false); await load();
    } catch (requestError) {
      const apiError = normalizeApiError(requestError);
      if (!deleteBlocked && apiError.status === 409) setDeleteBlocked(true); else toast.error(apiError.message);
    } finally { setBusy(false); }
  };

  return <section>
    <header className="mb-5 flex flex-wrap items-end justify-between gap-3"><div><h1 className="text-xl font-bold">Máy chủ hosting</h1><p className="mt-1 text-sm text-[#60727a]">Quản lý kết nối panel và nguồn package cấp phát tự động.</p></div>{manageable && <button type="button" onClick={() => { setFieldErrors({}); setEditing(null); }} className="h-9 rounded bg-[#116966] px-4 text-sm font-semibold text-white"><i className="fas fa-plus mr-2" aria-hidden="true" />Thêm máy chủ</button>}</header>
    <AdminFilterBar onSubmit={(event) => { event.preventDefault(); update({ search: draftSearch.trim(), page: 1 }); }}><AdminFormField id="server-search" label="Tìm kiếm" value={draftSearch} onChange={(event) => setDraftSearch(event.target.value)} placeholder="Tên, hostname hoặc IP" /><label className="text-xs font-semibold text-[#52636c]">Loại<select value={type} onChange={(event) => update({ type: event.target.value, page: 1 })} className="mt-1 h-9 min-w-36 rounded border border-[#cbd6d8] bg-white px-3 text-sm font-normal"><option value="">Tất cả</option>{serverTypes.map((value) => <option key={value} value={value}>{typeLabels[value]}</option>)}</select></label><label className="text-xs font-semibold text-[#52636c]">Trạng thái<select value={active} onChange={(event) => update({ is_active: event.target.value, page: 1 })} className="mt-1 h-9 min-w-32 rounded border border-[#cbd6d8] bg-white px-3 text-sm font-normal"><option value="">Tất cả</option><option value="1">Hoạt động</option><option value="0">Đã tắt</option></select></label><button type="submit" className="h-9 rounded bg-[#116966] px-4 text-sm font-semibold text-white">Lọc</button></AdminFilterBar>
    {loading ? <LoadingState label="Đang tải máy chủ..." /> : error ? <ErrorState message={error} onRetry={() => setReload((value) => value + 1)} /> : <><div className="mb-2 text-right text-xs text-[#60727a]">{response?.meta.total ?? 0} máy chủ</div><AdminDataTable rows={response?.data ?? []} rowKey={(server) => server.id} columns={[
      { key: "server", header: "Máy chủ", render: (server) => <div><strong>{server.name}</strong><span className="block text-xs text-[#60727a]">{server.ip_address}:{server.api_port}</span></div> },
      { key: "type", header: "Panel", render: (server) => <div><strong>{typeLabels[server.type]}</strong><span className="block text-xs text-[#60727a]">{modeLabels[server.provisioning_mode]}</span></div> },
      { key: "connection", header: "Kết nối API", render: (server) => <div className={server.has_api_token ? "text-emerald-700" : "text-[#60727a]"}><span className="font-semibold"><i className={`fas ${server.has_api_token ? "fa-shield-halved" : "fa-minus"} mr-2`} aria-hidden="true" />{server.has_api_token ? "Đã cấu hình" : "Chưa cấu hình"}</span>{server.type !== "mock" && <span className="block text-xs text-[#60727a]">{server.api_username} · {server.api_auth_type === "password" ? "Mật khẩu" : "Token"} · TLS {server.verify_tls ? "bật" : "tắt"}</span>}</div> },
      { key: "status", header: "Trạng thái", render: (server) => <span className={server.is_active ? "font-semibold text-emerald-700" : "font-semibold text-red-700"}>{server.is_active ? "Hoạt động" : "Đã tắt"}</span> },
      { key: "created", header: "Ngày tạo", render: (server) => formatDate(server.created_at) },
      { key: "actions", header: "Thao tác", render: (server) => manageable ? <div className="flex gap-1"><button type="button" title="Kiểm tra kết nối" aria-label={`Kiểm tra kết nối ${server.name}`} disabled={testingId === server.id || !server.has_api_token} onClick={() => testConnection(server)} className="size-8 text-emerald-700 disabled:opacity-35"><i className={`fas ${testingId === server.id ? "fa-spinner fa-spin" : "fa-plug-circle-check"}`} aria-hidden="true" /></button>{server.type === "whm" && <button type="button" title="Quản lý package WHM" aria-label={`Quản lý package ${server.name}`} disabled={!server.has_api_token} onClick={() => setProviderDialog(server)} className="size-8 text-blue-700 disabled:opacity-35"><i className="fas fa-boxes-stacked" aria-hidden="true" /></button>}<button type="button" title="Chỉnh sửa" aria-label={`Chỉnh sửa ${server.name}`} onClick={() => { setFieldErrors({}); setEditing(server); }} className="size-8 text-[#116966]"><i className="fas fa-pen" aria-hidden="true" /></button><button type="button" title="Xóa" aria-label={`Xóa ${server.name}`} onClick={() => { setDeleteBlocked(false); setDeleting(server); }} className="size-8 text-red-700"><i className="fas fa-trash" aria-hidden="true" /></button></div> : null },
    ]} emptyMessage="Không tìm thấy máy chủ phù hợp." /><div className="mt-4"><Pagination currentPage={response?.meta.current_page ?? 1} lastPage={response?.meta.last_page ?? 1} onPageChange={(next) => update({ page: next })} /></div></>}
    {editing !== undefined && <ServerDialog server={editing} busy={busy} fieldErrors={fieldErrors} onClose={() => setEditing(undefined)} onSubmit={save} />}
    {providerDialog && <ProviderPackageManagerDialog server={providerDialog} onClose={() => setProviderDialog(null)} />}
    {deleting && <AdminConfirmDialog title={deleteBlocked ? "Máy chủ đang được sử dụng" : "Xóa máy chủ"} message={deleteBlocked ? `Không thể xóa “${deleting.name}” vì còn gói hosting phụ thuộc. Bạn có thể tắt máy chủ để ngừng bán toàn bộ gói liên quan.` : `Xóa “${deleting.name}”? Backend sẽ từ chối nếu máy chủ vẫn còn gói hosting.`} confirmLabel={deleteBlocked ? "Tắt máy chủ" : "Xóa máy chủ"} destructive={!deleteBlocked} busy={busy} onClose={() => { setDeleting(null); setDeleteBlocked(false); }} onConfirm={removeOrDisable} />}
  </section>;
}
