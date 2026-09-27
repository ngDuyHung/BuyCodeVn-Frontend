"use client";

import axios from "axios";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useDialogAccessibility } from "@/hooks/useDialogAccessibility";
import { normalizeApiError } from "@/lib/api-error";
import { adminServicesService } from "@/services/admin/adminServicesService";
import type { ValidationErrors } from "@/types/api";
import type {
  AdminHostingPlan,
  ProviderHostingCapabilities,
  ProviderHostingLimitField,
  ProviderHostingPlan,
  ProviderHostingPlanWritePayload,
  Server,
} from "@/types/services";
import AdminConfirmDialog from "./AdminConfirmDialog";
import AdminDataTable from "./AdminDataTable";

interface ManagedProviderPlan extends ProviderHostingPlan {
  localPlan?: AdminHostingPlan;
}

interface KeyValuePair {
  id: number;
  key: string;
  value: string;
}

const numberFormat = new Intl.NumberFormat("vi-VN");
const packagePattern = /^[A-Za-z0-9][A-Za-z0-9_.-]*$/;

function recordToPairs(record: Record<string, string> = {}): KeyValuePair[] {
  return Object.entries(record).map(([key, value], index) => ({ id: index + 1, key, value }));
}

function pairsToRecord(pairs: KeyValuePair[]): Record<string, string> {
  return Object.fromEntries(pairs.filter((pair) => pair.key.trim()).map((pair) => [pair.key.trim(), pair.value.trim()]));
}

function KeyValueEditor({ label, pairs, onChange }: {
  label: string;
  pairs: KeyValuePair[];
  onChange: (pairs: KeyValuePair[]) => void;
}) {
  const add = () => onChange([...pairs, { id: Math.max(0, ...pairs.map((pair) => pair.id)) + 1, key: "", value: "" }]);
  const update = (id: number, field: "key" | "value", value: string) => onChange(pairs.map((pair) => pair.id === id ? { ...pair, [field]: value } : pair));

  return <fieldset className="sm:col-span-2">
    <div className="flex items-center justify-between gap-3"><legend className="text-sm font-bold">{label}</legend><button type="button" aria-label={`Thêm dòng ${label}`} onClick={add} className="inline-flex h-8 items-center gap-2 text-sm font-semibold text-[#116966]"><i className="fas fa-plus" aria-hidden="true" />Thêm dòng</button></div>
    {pairs.length === 0 ? <p className="mt-2 border border-dashed border-[#cbd6d8] px-3 py-3 text-sm text-[#60727a]">Chưa có dữ liệu.</p> : <div className="mt-2 space-y-2">{pairs.map((pair) => <div key={pair.id} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_32px] gap-2">
      <input aria-label={`${label} key`} maxLength={64} value={pair.key} onChange={(event) => update(pair.id, "key", event.target.value)} placeholder="Tên" className="h-9 min-w-0 rounded border border-[#cbd6d8] px-3 text-sm" />
      <input aria-label={`${label} value`} maxLength={255} value={pair.value} onChange={(event) => update(pair.id, "value", event.target.value)} placeholder="Giá trị" className="h-9 min-w-0 rounded border border-[#cbd6d8] px-3 text-sm" />
      <button type="button" aria-label={`Xóa dòng ${label}`} onClick={() => onChange(pairs.filter((item) => item.id !== pair.id))} className="size-8 text-red-700"><i className="fas fa-trash" aria-hidden="true" /></button>
    </div>)}</div>}
  </fieldset>;
}

function FieldHelp({ label, children }: { label: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return <span className="relative inline-flex">
    <button type="button" title={`Giải thích ${label}`} aria-label={`Giải thích ${label}`} aria-expanded={open} onClick={() => setOpen((current) => !current)} className="inline-flex size-6 items-center justify-center text-[#116966] hover:bg-[#e7f4f2]">
      <i className="fas fa-circle-info" aria-hidden="true" />
    </button>
    {open && <span role="note" className="absolute left-0 top-7 z-20 w-72 max-w-[calc(100vw-3rem)] rounded border border-[#b9cbce] bg-white p-3 text-xs font-normal leading-5 text-[#42545b] shadow-lg">{children}</span>}
  </span>;
}

function ResourceInput({ field, label, description, value, onChange, capabilities, error }: {
  field: ProviderHostingLimitField;
  label: string;
  description: string;
  value: string;
  onChange: (value: string) => void;
  capabilities: ProviderHostingCapabilities | null;
  error?: React.ReactNode;
}) {
  const limit = capabilities?.field_limits[field];
  const unlimited = value === "0";
  const previousFinite = useRef(value !== "0" ? value : "1");
  useEffect(() => {
    if (!unlimited && value !== "") previousFinite.current = value;
  }, [unlimited, value]);
  const unlimitedDenied = limit?.allow_unlimited === false;
  const maximum = limit?.maximum ?? 999999;

  return <div className="min-w-0 text-sm">
    <div className="flex min-h-6 items-center gap-1 font-semibold"><label htmlFor={`package-${field}`}>{label}</label><FieldHelp label={label}>{description}<span className="mt-2 block font-semibold text-[#334155]">Trong WHM, giá trị 0 nghĩa là không giới hạn.</span></FieldHelp></div>
    <input id={`package-${field}`} aria-label={label} required disabled={unlimited} type="number" min="1" max={maximum} step="1" value={unlimited ? "" : value} onChange={(event) => onChange(event.target.value)} placeholder={unlimited ? "Không giới hạn" : undefined} className="mt-1 h-10 w-full rounded border border-[#cbd6d8] px-3 font-normal disabled:bg-[#f1f5f9] disabled:text-[#60727a]" />
    <label className={`mt-2 flex min-h-6 items-center gap-2 text-xs font-medium ${unlimitedDenied && !unlimited ? "cursor-not-allowed text-[#7b898e]" : "cursor-pointer text-[#334155]"}`}>
      <input type="checkbox" aria-label={`${label}: Không giới hạn`} checked={unlimited} disabled={unlimitedDenied && !unlimited} onChange={(event) => onChange(event.target.checked ? "0" : previousFinite.current)} className="size-4 accent-[#116966]" />
      Không giới hạn
    </label>
    {unlimitedDenied ? <p className="mt-1 text-xs leading-5 text-amber-700"><i className="fas fa-lock mr-1" aria-hidden="true" />WHM không cấp quyền unlimited cho thông số này.</p> : limit?.allow_unlimited === true ? <p className="mt-1 text-xs text-[#52706f]">WHM cho phép đặt không giới hạn.</p> : <p className="mt-1 text-xs text-[#60727a]">Quyền unlimited chưa xác định, WHM sẽ kiểm tra khi lưu.</p>}
    {limit?.maximum != null ? <p className="mt-1 text-xs text-[#52706f]">Tối đa từ WHM: {numberFormat.format(limit.maximum)}</p> : <p className="mt-1 text-xs text-[#60727a]">WHM không công bố trần hữu hạn.</p>}
    {error}
  </div>;
}

function OptionalMemoryInput({ value, onChange, error }: { value: string; onChange: (value: string) => void; error?: React.ReactNode }) {
  const [lastValue, setLastValue] = useState(value || "1024");
  const disabled = value === "";

  return <div className="min-w-0 text-sm">
    <div className="flex min-h-6 items-center gap-1 font-semibold"><label htmlFor="package-memory">RAM metadata (MB)</label><FieldHelp label="RAM metadata">WHM chuẩn không áp dụng RAM package. Giá trị này dùng để hiển thị và đồng bộ cho extension như CloudLinux qua Provider options.</FieldHelp></div>
    <input id="package-memory" aria-label="RAM metadata (MB)" disabled={disabled} type="number" min="1" max="1048576" step="1" value={value} onChange={(event) => { setLastValue(event.target.value); onChange(event.target.value); }} placeholder={disabled ? "Không cấu hình" : undefined} className="mt-1 h-10 w-full rounded border border-[#cbd6d8] px-3 font-normal disabled:bg-[#f1f5f9]" />
    <label className="mt-2 flex min-h-6 cursor-pointer items-center gap-2 text-xs font-medium text-[#334155]"><input type="checkbox" checked={disabled} onChange={(event) => onChange(event.target.checked ? "" : lastValue)} className="size-4 accent-[#116966]" />Không cấu hình RAM</label>
    <p className="mt-1 text-xs leading-5 text-[#60727a]">Không cấu hình nghĩa là WHM/cPanel cơ bản không giới hạn RAM qua package này.</p>
    {error}
  </div>;
}

function CapabilitySummary({ capabilities }: { capabilities: ProviderHostingCapabilities | null }) {
  if (!capabilities) return <div className="mt-4 border-y border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-800"><i className="fas fa-triangle-exclamation mr-2" aria-hidden="true" />Chưa đọc được hạn mức WHM. Các giá trị vẫn được WHM kiểm tra khi lưu.</div>;
  const account = capabilities.account_limit;

  return <section aria-label="Hạn mức WHM" className="mt-4 border-y border-[#d5e1e2] bg-[#f6faf9] px-3 py-3">
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm"><strong><i className="fas fa-gauge-high mr-2 text-[#116966]" aria-hidden="true" />Hạn mức WHM</strong><span>Tài khoản: {numberFormat.format(account.used ?? 0)} / {account.is_unlimited ? "Không giới hạn" : numberFormat.format(account.maximum ?? 0)}</span><span>Reseller: {capabilities.username}</span></div>
    {capabilities.warnings.length > 0 && <details className="mt-2 text-xs text-[#60727a]"><summary className="cursor-pointer font-semibold">Lưu ý từ nhà cung cấp ({capabilities.warnings.length})</summary><ul className="mt-2 space-y-1">{capabilities.warnings.map((warning) => <li key={warning}>- {warning}</li>)}</ul></details>}
  </section>;
}

function PackageForm({ server, plan, capabilities, busy, fieldErrors, onClose, onSubmit }: {
  server: Server;
  plan: ManagedProviderPlan | null;
  capabilities: ProviderHostingCapabilities | null;
  busy: boolean;
  fieldErrors: ValidationErrors;
  onClose: () => void;
  onSubmit: (payload: ProviderHostingPlanWritePayload & { name?: string }) => void;
}) {
  const dialogRef = useDialogAccessibility(true, onClose, !busy);
  const local = plan?.localPlan;
  const [name, setName] = useState(plan?.name ?? "");
  const [disk, setDisk] = useState(String(plan?.quota_mb ?? 1024));
  const [bandwidth, setBandwidth] = useState(String(plan?.bandwidth_mb ?? 10240));
  const [memory, setMemory] = useState(local?.memory_limit_mb == null ? "" : String(local.memory_limit_mb));
  const [ftp, setFtp] = useState(String(plan?.max_ftp_accounts ?? 0));
  const [email, setEmail] = useState(String(plan?.max_email_accounts ?? 0));
  const [databases, setDatabases] = useState(String(plan?.max_databases ?? 0));
  const [subdomains, setSubdomains] = useState(String(plan?.max_subdomains ?? 0));
  const [parked, setParked] = useState(String(plan?.max_parked_domains ?? 0));
  const [addons, setAddons] = useState(String(plan?.max_addon_domains ?? 0));
  const [customFeatures, setCustomFeatures] = useState<KeyValuePair[]>(recordToPairs(local?.custom_features));
  const [extensions, setExtensions] = useState("");
  const [providerOptions, setProviderOptions] = useState<KeyValuePair[]>([]);
  const [localError, setLocalError] = useState("");
  const errorFor = (field: string) => fieldErrors[field]?.map((message) => <span key={message} className="mt-1 block text-xs text-red-600">{message}</span>);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const normalizedName = name.trim();
    if (!plan && !packagePattern.test(normalizedName)) {
      setLocalError("Tên package chỉ gồm chữ, số, dấu chấm, gạch ngang hoặc gạch dưới.");
      return;
    }
    const extensionList = extensions.split(",").map((value) => value.trim()).filter(Boolean);
    setLocalError("");
    onSubmit({
      ...(!plan ? { name: normalizedName } : {}),
      disk_quota: Number(disk), bandwidth_limit_mb: Number(bandwidth),
      memory_limit_mb: memory === "" ? null : Number(memory),
      max_ftp_accounts: Number(ftp), max_email_accounts: Number(email),
      max_databases: Number(databases), max_subdomains: Number(subdomains),
      max_parked_domains: Number(parked), max_addon_domains: Number(addons),
      custom_features: pairsToRecord(customFeatures),
      ...(extensionList.length ? { package_extensions: extensionList } : {}),
      ...(providerOptions.some((pair) => pair.key.trim()) ? { provider_options: pairsToRecord(providerOptions) } : {}),
    });
  };

  return <div ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="provider-package-form-title" className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) onClose(); }}>
    <form onSubmit={submit} className="max-h-[94vh] w-full max-w-4xl overflow-y-auto rounded-md bg-white p-5 shadow-xl">
      <div className="flex items-start justify-between gap-4"><div><h2 id="provider-package-form-title" className="text-lg font-bold">{plan ? "Sửa package WHM" : "Tạo package WHM"}</h2><p className="mt-1 text-sm text-[#60727a]">{server.name}</p></div><button type="button" aria-label="Đóng" disabled={busy} onClick={onClose} className="size-8"><i className="fas fa-xmark" aria-hidden="true" /></button></div>
      <CapabilitySummary capabilities={capabilities} />
      {(localError || fieldErrors.provider_options?.length) && <p role="alert" className="mt-4 border-l-4 border-red-600 bg-red-50 px-3 py-2 text-sm text-red-700">{localError || fieldErrors.provider_options?.[0]}</p>}
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <label className="text-sm font-semibold sm:col-span-2 lg:col-span-3">Tên package<input autoFocus={!plan} required readOnly={Boolean(plan)} maxLength={100} value={name} onChange={(event) => setName(event.target.value)} className="mt-1 h-10 w-full rounded border border-[#cbd6d8] px-3 font-normal read-only:bg-[#f1f5f9]" />{errorFor("name")}</label>
        <ResourceInput field="disk_quota" label="Dung lượng (MB)" description="Dung lượng đĩa tối đa cho mỗi tài khoản được tạo từ package." value={disk} onChange={setDisk} capabilities={capabilities} error={errorFor("disk_quota")} />
        <ResourceInput field="bandwidth_limit_mb" label="Băng thông (MB)" description="Tổng lưu lượng truyền dữ liệu tối đa trong một tháng cho mỗi tài khoản." value={bandwidth} onChange={setBandwidth} capabilities={capabilities} error={errorFor("bandwidth_limit_mb")} />
        <OptionalMemoryInput value={memory} onChange={setMemory} error={errorFor("memory_limit_mb")} />
        <ResourceInput field="max_ftp_accounts" label="Tài khoản FTP" description="Số tài khoản FTP phụ tối đa; không tính tài khoản cPanel chính." value={ftp} onChange={setFtp} capabilities={capabilities} error={errorFor("max_ftp_accounts")} />
        <ResourceInput field="max_email_accounts" label="Tài khoản email" description="Số hộp thư theo tên miền tối đa mà khách hàng có thể tạo." value={email} onChange={setEmail} capabilities={capabilities} error={errorFor("max_email_accounts")} />
        <ResourceInput field="max_databases" label="Database" description="Tổng số cơ sở dữ liệu MySQL/MariaDB tối đa trên tài khoản." value={databases} onChange={setDatabases} capabilities={capabilities} error={errorFor("max_databases")} />
        <ResourceInput field="max_subdomains" label="Subdomain" description="Số tên miền phụ tối đa, ví dụ shop.example.com." value={subdomains} onChange={setSubdomains} capabilities={capabilities} error={errorFor("max_subdomains")} />
        <ResourceInput field="max_parked_domains" label="Parked domain" description="Số alias domain tối đa cùng hiển thị nội dung của tên miền chính." value={parked} onChange={setParked} capabilities={capabilities} error={errorFor("max_parked_domains")} />
        <ResourceInput field="max_addon_domains" label="Addon domain" description="Số tên miền độc lập bổ sung được lưu trữ trong cùng một tài khoản cPanel." value={addons} onChange={setAddons} capabilities={capabilities} error={errorFor("max_addon_domains")} />
        <KeyValueEditor label="Thông số tùy chỉnh" pairs={customFeatures} onChange={setCustomFeatures} />
        <details className="sm:col-span-2 lg:col-span-3 border-t border-[#dbe3e5] pt-3">
          <summary className="cursor-pointer text-sm font-bold text-[#334155]">Tùy chọn extension WHM</summary>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-semibold sm:col-span-2">Package extensions<input value={extensions} onChange={(event) => setExtensions(event.target.value)} placeholder="cloudlinux, extension-khac" className="mt-1 h-10 w-full rounded border border-[#cbd6d8] px-3 font-normal" />{errorFor("package_extensions")}</label>
            <KeyValueEditor label="Provider options" pairs={providerOptions} onChange={setProviderOptions} />
          </div>
        </details>
      </div>
      <div className="mt-6 flex justify-end gap-2"><button type="button" disabled={busy} onClick={onClose} className="rounded border border-[#cbd6d8] px-4 py-2 text-sm font-semibold">Hủy</button><button type="submit" disabled={busy || !name.trim()} className="rounded bg-[#116966] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{busy ? "Đang đồng bộ..." : plan ? "Cập nhật trên WHM" : "Tạo trên WHM"}</button></div>
    </form>
  </div>;
}

export default function ProviderPackageManagerDialog({ server, onClose, onChanged }: { server: Server; onClose: () => void; onChanged?: () => void }) {
  const [plans, setPlans] = useState<ManagedProviderPlan[]>([]);
  const [capabilities, setCapabilities] = useState<ProviderHostingCapabilities | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<ManagedProviderPlan | null | undefined>(undefined);
  const [deleting, setDeleting] = useState<ManagedProviderPlan | null>(null);
  const [fieldErrors, setFieldErrors] = useState<ValidationErrors>({});
  const dialogRef = useDialogAccessibility(editing === undefined && deleting === null, onClose, !busy);

  const load = useCallback(async (signal?: AbortSignal) => {
    const [providerPlans, localResponse, providerCapabilities] = await Promise.all([
      adminServicesService.getProviderPlans(server.id, signal),
      adminServicesService.getHostingPlans({ server_id: server.id, per_page: 100 }, signal),
      adminServicesService.getProviderCapabilities(server.id, signal).catch(() => null),
    ]);
    const localByPackage = new Map(localResponse.data.map((plan) => [plan.whm_package_name, plan]));
    setPlans(providerPlans.map((plan) => ({ ...plan, localPlan: localByPackage.get(plan.name) })));
    setCapabilities(providerCapabilities);
  }, [server.id]);

  useEffect(() => {
    const controller = new AbortController();
    Promise.resolve().then(() => { setLoading(true); setError(""); return load(controller.signal); })
      .catch((requestError) => { if (!axios.isCancel(requestError)) setError(normalizeApiError(requestError).message); })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [load]);

  const save = async (payload: ProviderHostingPlanWritePayload & { name?: string }) => {
    setBusy(true); setFieldErrors({});
    try {
      if (editing) await adminServicesService.updateProviderPlan(server.id, editing.name, payload);
      else await adminServicesService.createProviderPlan(server.id, payload as ProviderHostingPlanWritePayload & { name: string });
      toast.success(editing ? "Đã cập nhật package trên WHM." : "Đã tạo package trên WHM.");
      setEditing(undefined); await load(); onChanged?.();
    } catch (requestError) {
      const apiError = normalizeApiError(requestError); setFieldErrors(apiError.fieldErrors); toast.error(apiError.message);
    } finally { setBusy(false); }
  };

  const remove = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      await adminServicesService.deleteProviderPlan(server.id, deleting.name);
      toast.success("Đã xóa package trên WHM và ngừng bán gói local.");
      setDeleting(null); await load(); onChanged?.();
    } catch (requestError) { toast.error(normalizeApiError(requestError).message); }
    finally { setBusy(false); }
  };

  const rows = useMemo(() => plans, [plans]);
  return <div ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="provider-plans-title" className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) onClose(); }}>
    <div className="max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-md bg-white p-5 shadow-xl">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 id="provider-plans-title" className="text-lg font-bold">Package trên {server.name}</h2><p className="mt-1 text-sm text-[#60727a]">Quản lý trực tiếp package WHM. Giá bán được cấu hình riêng tại danh mục gói hosting.</p></div><div className="flex items-center gap-2"><button type="button" onClick={() => { setFieldErrors({}); setEditing(null); }} className="h-9 rounded bg-[#116966] px-3 text-sm font-semibold text-white"><i className="fas fa-plus mr-2" aria-hidden="true" />Tạo package</button><button type="button" onClick={onClose} aria-label="Đóng" disabled={busy} className="size-8"><i className="fas fa-xmark" aria-hidden="true" /></button></div></div>
      {loading ? <p className="py-12 text-center text-sm text-[#60727a]">Đang đọc package từ WHM...</p> : error ? <div className="mt-5 border-l-4 border-red-600 bg-red-50 px-4 py-3 text-sm text-red-700"><p>{error}</p><button type="button" onClick={() => { setLoading(true); setError(""); load().catch((requestError) => setError(normalizeApiError(requestError).message)).finally(() => setLoading(false)); }} className="mt-2 font-bold underline">Thử lại</button></div> : <div className="mt-5"><AdminDataTable rows={rows} rowKey={(plan) => plan.name} columns={[
        { key: "name", header: "Package", render: (plan) => <div><strong>{plan.name}</strong><span className="block text-xs text-[#60727a]">{plan.localPlan ? (plan.localPlan.is_active ? "Đang bán" : "Chưa bán") : "Chưa có giá local"}</span></div> },
        { key: "storage", header: "Lưu trữ", render: (plan) => <div><strong>{numberFormat.format(plan.quota_mb)} MB</strong><span className="block text-xs text-[#60727a]">BW {plan.bandwidth_mb === 0 ? "Không giới hạn" : `${numberFormat.format(plan.bandwidth_mb)} MB`}</span></div> },
        { key: "memory", header: "RAM", render: (plan) => plan.localPlan?.memory_limit_mb ? `${numberFormat.format(plan.localPlan.memory_limit_mb)} MB` : "-" },
        { key: "limits", header: "Giới hạn", render: (plan) => <span className="text-xs leading-5">FTP {plan.max_ftp_accounts} · Email {plan.max_email_accounts}<br />DB {plan.max_databases} · Addon {plan.max_addon_domains}<br />Sub {plan.max_subdomains} · Parked {plan.max_parked_domains}</span> },
        { key: "actions", header: "Thao tác", render: (plan) => <div className="flex gap-1"><button type="button" title="Sửa package" aria-label={`Sửa package ${plan.name}`} onClick={() => { setFieldErrors({}); setEditing(plan); }} className="size-8 text-[#116966]"><i className="fas fa-pen" aria-hidden="true" /></button><button type="button" title="Xóa package" aria-label={`Xóa package ${plan.name}`} onClick={() => setDeleting(plan)} className="size-8 text-red-700"><i className="fas fa-trash" aria-hidden="true" /></button></div> },
      ]} emptyMessage="Tài khoản WHM chưa có package." /></div>}
    </div>
    {editing !== undefined && <PackageForm server={server} plan={editing} capabilities={capabilities} busy={busy} fieldErrors={fieldErrors} onClose={() => setEditing(undefined)} onSubmit={save} />}
    {deleting && <AdminConfirmDialog title="Xóa package khỏi WHM" message={`Xóa “${deleting.name}” trực tiếp trên WHM? Gói local sẽ được giữ lại nhưng chuyển sang không khả dụng và ngừng bán.`} confirmLabel="Xóa package WHM" destructive busy={busy} onClose={() => setDeleting(null)} onConfirm={remove} />}
  </div>;
}
