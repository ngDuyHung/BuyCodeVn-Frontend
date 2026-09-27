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
import { adminService } from "@/services/admin/adminService";
import { useAuthStore } from "@/stores/authStore";
import type { PaginatedResponse, ValidationErrors } from "@/types/api";
import type { AdminRole, AdminUserCreatePayload, AdminUserUpdatePayload, User } from "@/types/identity";
import AdminConfirmDialog from "./AdminConfirmDialog";
import AdminDataTable from "./AdminDataTable";
import AdminFilterBar from "./AdminFilterBar";
import AdminFormField from "./AdminFormField";
import AdminUserWalletDialog from "./AdminUserWalletDialog";

interface UserDialogProps {
  user: User | null;
  busy: boolean;
  errors: ValidationErrors;
  onClose: () => void;
  onSubmit: (payload: AdminUserCreatePayload | AdminUserUpdatePayload) => void;
}

function UserDialog({ user, busy, errors, onClose, onSubmit }: UserDialogProps) {
  const dialogRef = useDialogAccessibility(true, onClose, !busy);
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [active, setActive] = useState(user?.is_active ?? true);
  const [localError, setLocalError] = useState("");
  const fieldError = (field: string) => errors[field]?.map((value) => <span key={value} className="mt-1 block text-xs text-red-700">{value}</span>);

  return <div ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="user-dialog-title" className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
    <form noValidate onSubmit={(event) => {
      event.preventDefault();
      if (!user && password !== confirmation) { setLocalError("Mật khẩu xác nhận không khớp."); return; }
      onSubmit(user ? { name: name.trim(), email: email.trim() } : { name: name.trim(), email: email.trim(), password, password_confirmation: confirmation, is_active: active });
    }} className="w-full max-w-lg rounded-md bg-white p-5 shadow-xl">
      <div className="flex justify-between"><h2 id="user-dialog-title" className="text-lg font-bold">{user ? "Chỉnh sửa người dùng" : "Tạo người dùng"}</h2><button type="button" aria-label="Đóng" disabled={busy} onClick={onClose} className="size-8"><i className="fas fa-xmark" /></button></div>
      {localError && <p role="alert" className="mt-3 text-sm text-red-700">{localError}</p>}
      <div className="mt-5 space-y-4">
        <label className="block text-sm font-semibold">Họ tên<input autoFocus required maxLength={255} value={name} onChange={(event) => setName(event.target.value)} className="mt-1 h-10 w-full rounded border border-[#cbd6d8] px-3 font-normal" />{fieldError("name")}</label>
        <label className="block text-sm font-semibold">Email<input required type="email" maxLength={255} value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1 h-10 w-full rounded border border-[#cbd6d8] px-3 font-normal" />{fieldError("email")}</label>
        {!user && <><label className="block text-sm font-semibold">Mật khẩu<input required type="password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1 h-10 w-full rounded border border-[#cbd6d8] px-3 font-normal" />{fieldError("password")}</label><label className="block text-sm font-semibold">Xác nhận mật khẩu<input required type="password" minLength={8} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} className="mt-1 h-10 w-full rounded border border-[#cbd6d8] px-3 font-normal" /></label><label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={active} onChange={(event) => setActive(event.target.checked)} className="size-4 accent-[#116966]" />Kích hoạt ngay</label></>}
      </div>
      <div className="mt-6 flex justify-end gap-2"><button type="button" disabled={busy} onClick={onClose} className="rounded border border-[#cbd6d8] px-4 py-2 text-sm font-semibold">Hủy</button><button type="submit" disabled={busy || !name || !email || (!user && password.length < 8)} className="rounded bg-[#116966] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{busy ? "Đang lưu..." : "Lưu người dùng"}</button></div>
    </form>
  </div>;
}

interface UserDetailProps {
  user: User;
  roles: AdminRole[];
  canAssign: boolean;
  busy: boolean;
  onClose: () => void;
  onRoles: (roles: string[]) => void;
}

function UserDetail({ user, roles, canAssign, busy, onClose, onRoles }: UserDetailProps) {
  const dialogRef = useDialogAccessibility(true, onClose, !busy);
  const [selected, setSelected] = useState(user.roles);
  return <div ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="user-detail-title" className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"><div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-md bg-white p-5 shadow-xl">
    <div className="flex justify-between"><div><h2 id="user-detail-title" className="text-lg font-bold">{user.name}</h2><p className="text-sm text-[#60727a]">{user.email} · User #{user.id}</p></div><button type="button" aria-label="Đóng" disabled={busy} onClick={onClose} className="size-8"><i className="fas fa-xmark" /></button></div>
    <dl className="mt-5 grid gap-4 border-y border-[#dce3e5] py-4 text-sm sm:grid-cols-3"><div><dt className="text-xs text-[#60727a]">Trạng thái</dt><dd className="font-semibold">{user.is_active ? "Hoạt động" : "Đã khóa"}</dd></div><div><dt className="text-xs text-[#60727a]">Ngày tạo</dt><dd>{formatDate(user.created_at)}</dd></div><div><dt className="text-xs text-[#60727a]">Quyền hiệu lực</dt><dd>{user.permissions.length}</dd></div></dl>
    <h3 className="mt-5 text-sm font-bold">Vai trò</h3><div className="mt-2 grid gap-2 sm:grid-cols-2">{roles.length ? roles.map((role) => <label key={role.id} className="flex items-center gap-2 border border-[#dce3e5] px-3 py-2 text-sm"><input type="checkbox" disabled={!canAssign || busy} checked={selected.includes(role.name)} onChange={(event) => setSelected((current) => event.target.checked ? [...current, role.name] : current.filter((name) => name !== role.name))} className="size-4 accent-[#116966]" /><span><strong>{role.name}</strong><span className="block text-xs text-[#60727a]">{role.permissions.length} quyền</span></span></label>) : <p className="text-sm text-[#60727a]">{user.roles.join(", ") || "Chưa có vai trò"}</p>}</div>
    {canAssign && <div className="mt-5 flex justify-end"><button type="button" disabled={busy || selected.length === 0} onClick={() => onRoles(selected)} className="rounded bg-[#116966] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Cập nhật vai trò</button></div>}
  </div></div>;
}

export default function AdminUserDirectory() {
  const currentUser = useAuthStore((state) => state.user);
  const { searchParams, update } = useAdminQueryState();
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const search = searchParams.get("search") ?? "";
  const role = searchParams.get("role") ?? "";
  const active = searchParams.get("is_active") ?? "";
  const [draft, setDraft] = useState({ search, role });
  const [response, setResponse] = useState<PaginatedResponse<User> | null>(null);
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<User | null | undefined>(undefined);
  const [detail, setDetail] = useState<User | null>(null);
  const [walletUser, setWalletUser] = useState<User | null>(null);
  const [statusTarget, setStatusTarget] = useState<User | null>(null);
  const [deleting, setDeleting] = useState<User | null>(null);
  const [busy, setBusy] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<ValidationErrors>({});
  const [reload, setReload] = useState(0);
  const permissions = useMemo(() => ({ create: can(currentUser, "users.create"), update: can(currentUser, "users.update"), remove: can(currentUser, "users.delete"), roles: can(currentUser, "roles.manage"), walletView: can(currentUser, "finance.view") || can(currentUser, "wallets.manage"), walletManage: can(currentUser, "wallets.manage") }), [currentUser]);
  const query = useMemo(() => ({ page, per_page: 15, ...(search ? { search } : {}), ...(role ? { role } : {}), ...(active ? { is_active: active === "1" ? 1 as const : 0 as const } : {}) }), [page, search, role, active]);
  const load = useCallback(async (signal?: AbortSignal) => setResponse(await adminService.getUsers(query, signal)), [query]);

  useEffect(() => { const controller = new AbortController(); Promise.resolve().then(() => Promise.all([load(controller.signal), ...(permissions.roles ? [adminService.getRoles(controller.signal).then(setRoles)] : [])])).catch((requestError) => { if (!axios.isCancel(requestError)) setError(normalizeApiError(requestError).message); }).finally(() => setLoading(false)); return () => controller.abort(); }, [load, permissions.roles, reload]);
  const save = async (payload: AdminUserCreatePayload | AdminUserUpdatePayload) => { setBusy(true); setFieldErrors({}); try { if (editing) await adminService.updateUser(editing.id, payload as AdminUserUpdatePayload); else await adminService.createUser(payload as AdminUserCreatePayload); toast.success(editing ? "Đã cập nhật người dùng." : "Đã tạo người dùng."); setEditing(undefined); await load(); } catch (requestError) { const apiError = normalizeApiError(requestError); setFieldErrors(apiError.fieldErrors); toast.error(apiError.message); } finally { setBusy(false); } };
  const changeStatus = async () => { if (!statusTarget || busy) return; setBusy(true); try { await adminService.updateUserStatus(statusTarget.id, !statusTarget.is_active); toast.success(statusTarget.is_active ? "Đã khóa tài khoản và thu hồi token." : "Đã kích hoạt tài khoản."); setStatusTarget(null); await load(); } catch (requestError) { toast.error(normalizeApiError(requestError).message); setStatusTarget(null); await load(); } finally { setBusy(false); } };
  const remove = async () => { if (!deleting || busy) return; setBusy(true); try { await adminService.deleteUser(deleting.id); toast.success("Đã xóa người dùng và thu hồi token."); setDeleting(null); await load(); } catch (requestError) { toast.error(normalizeApiError(requestError).message); setDeleting(null); await load(); } finally { setBusy(false); } };
  const syncRoles = async (selected: string[]) => { if (!detail || busy) return; setBusy(true); try { const updated = await adminService.syncUserRoles(detail.id, selected); toast.success("Đã cập nhật vai trò và thu hồi token cũ."); setDetail(updated); await load(); } catch (requestError) { toast.error(normalizeApiError(requestError).message); } finally { setBusy(false); } };
  const openDetail = async (id: number) => { try { setDetail(await adminService.getUser(id)); } catch (requestError) { toast.error(normalizeApiError(requestError).message); } };

  return <section>
    <header className="mb-5 flex flex-wrap items-end justify-between gap-3"><div><h1 className="text-xl font-bold">Người dùng</h1><p className="mt-1 text-sm text-[#60727a]">Quản lý tài khoản, số dư, trạng thái và vai trò truy cập.</p></div>{permissions.create && <button type="button" onClick={() => { setFieldErrors({}); setEditing(null); }} className="h-9 rounded bg-[#116966] px-4 text-sm font-semibold text-white"><i className="fas fa-user-plus mr-2" />Tạo người dùng</button>}</header>
    <AdminFilterBar onSubmit={(event) => { event.preventDefault(); update({ search: draft.search.trim(), role: draft.role.trim(), page: 1 }); }}><AdminFormField id="admin-user-search" label="Tìm kiếm" value={draft.search} onChange={(event) => setDraft((value) => ({ ...value, search: event.target.value }))} placeholder="Tên hoặc email" /><AdminFormField id="admin-user-role" label="Vai trò" value={draft.role} onChange={(event) => setDraft((value) => ({ ...value, role: event.target.value }))} placeholder="customer" /><label className="text-xs font-semibold text-[#52636c]">Trạng thái<select value={active} onChange={(event) => update({ is_active: event.target.value, page: 1 })} className="mt-1 h-9 rounded border border-[#cbd6d8] bg-white px-3 text-sm font-normal"><option value="">Tất cả</option><option value="1">Hoạt động</option><option value="0">Đã khóa</option></select></label><button className="h-9 rounded bg-[#116966] px-4 text-sm font-semibold text-white">Lọc</button></AdminFilterBar>
    {loading ? <LoadingState label="Đang tải người dùng..." /> : error ? <ErrorState message={error} onRetry={() => { setError(null); setLoading(true); setReload((value) => value + 1); }} /> : <><AdminDataTable rows={response?.data ?? []} rowKey={(item) => item.id} columns={[
      { key: "user", header: "Người dùng", render: (item) => <div><strong>{item.name}</strong><span className="block text-xs text-[#60727a]">{item.email}</span></div> },
      { key: "roles", header: "Vai trò", render: (item) => item.roles.join(", ") || "-" },
      { key: "status", header: "Trạng thái", render: (item) => <span className={item.is_active ? "font-semibold text-emerald-700" : "font-semibold text-red-700"}>{item.is_active ? "Hoạt động" : "Đã khóa"}</span> },
      { key: "created", header: "Ngày tạo", render: (item) => formatDate(item.created_at) },
      { key: "actions", header: "Thao tác", render: (item) => <div className="flex"><button type="button" title="Chi tiết" aria-label={`Xem người dùng ${item.id}`} onClick={() => void openDetail(item.id)} className="size-8 text-[#116966]"><i className="fas fa-eye" /></button>{permissions.walletView && <button type="button" title="Lịch sử ví" aria-label={`Lịch sử giao dịch người dùng ${item.id}`} onClick={() => setWalletUser(item)} className="size-8 text-[#116966]"><i className="fas fa-clock-rotate-left" /></button>}{permissions.update && <button type="button" title="Chỉnh sửa" aria-label={`Chỉnh sửa người dùng ${item.id}`} onClick={() => setEditing(item)} className="size-8 text-[#116966]"><i className="fas fa-pen" /></button>}{permissions.update && item.id !== currentUser?.id && <button type="button" title={item.is_active ? "Khóa" : "Kích hoạt"} aria-label={`${item.is_active ? "Khóa" : "Kích hoạt"} người dùng ${item.id}`} onClick={() => setStatusTarget(item)} className={`size-8 ${item.is_active ? "text-amber-700" : "text-emerald-700"}`}><i className={`fas ${item.is_active ? "fa-lock" : "fa-lock-open"}`} /></button>}{permissions.remove && item.id !== currentUser?.id && <button type="button" title="Xóa" aria-label={`Xóa người dùng ${item.id}`} onClick={() => setDeleting(item)} className="size-8 text-red-700"><i className="fas fa-trash" /></button>}</div> },
    ]} emptyMessage="Không tìm thấy người dùng." /><div className="mt-4"><Pagination currentPage={response?.meta.current_page ?? 1} lastPage={response?.meta.last_page ?? 1} onPageChange={(next) => update({ page: next })} /></div></>}
    {editing !== undefined && <UserDialog user={editing} busy={busy} errors={fieldErrors} onClose={() => setEditing(undefined)} onSubmit={save} />}
    {detail && <UserDetail user={detail} roles={roles} canAssign={permissions.roles && detail.id !== currentUser?.id} busy={busy} onClose={() => setDetail(null)} onRoles={syncRoles} />}
    {walletUser && <AdminUserWalletDialog user={walletUser} canAdjust={permissions.walletManage} onClose={() => setWalletUser(null)} />}
    {statusTarget && <AdminConfirmDialog title={statusTarget.is_active ? "Khóa tài khoản" : "Kích hoạt tài khoản"} message={statusTarget.is_active ? `Khóa ${statusTarget.email}? Toàn bộ token đăng nhập của người dùng sẽ bị thu hồi.` : `Kích hoạt lại ${statusTarget.email}?`} confirmLabel={statusTarget.is_active ? "Khóa tài khoản" : "Kích hoạt"} destructive={statusTarget.is_active} busy={busy} onClose={() => setStatusTarget(null)} onConfirm={changeStatus} />}
    {deleting && <AdminConfirmDialog title="Xóa người dùng" message={`Xóa ${deleting.email}? Tài khoản sẽ bị soft-delete và toàn bộ token bị thu hồi. Backend sẽ chặn self-action hoặc admin hoạt động cuối cùng.`} confirmLabel="Xóa người dùng" destructive busy={busy} onClose={() => setDeleting(null)} onConfirm={remove} />}
  </section>;
}
