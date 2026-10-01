"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import ErrorState from "@/components/shared/ErrorState";
import LoadingState from "@/components/shared/LoadingState";
import { normalizeApiError } from "@/lib/api-error";
import { formatCurrency, formatDate } from "@/lib/format";
import { createIdempotencyKey } from "@/lib/idempotency";
import { userService } from "@/services/client/userService";
import type { UserService } from "@/types/services";
import HostingServiceActions from "./HostingServiceActions";
import ServiceStatusBadge from "./ServiceStatusBadge";

const resourceValue = (value: number | null | undefined, unit = "") => {
  if (value === null || value === undefined) return "-";
  return value === 0 ? "Không giới hạn" : `${value.toLocaleString("vi-VN")}${unit}`;
};

export default function HostingServiceDetail({ serviceId }: { serviceId: number }) {
  const [service, setService] = useState<UserService | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeAction, setActiveAction] = useState<"upgrade" | "reset" | "delete" | null>(null);
  const [targetPlanId, setTargetPlanId] = useState<number | null>(null);
  const [upgradeKey, setUpgradeKey] = useState(() => createIdempotencyKey("hosting-upgrade", serviceId));
  const [confirmation, setConfirmation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newPassword, setNewPassword] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setService(await userService.getService(serviceId));
    } catch (requestError) {
      setError(normalizeApiError(requestError).message);
    } finally {
      setIsLoading(false);
    }
  }, [serviceId]);

  useEffect(() => {
    const controller = new AbortController();
    userService.getService(serviceId, controller.signal)
      .then((result) => setService(result))
      .catch((requestError) => {
        if (!controller.signal.aborted) setError(normalizeApiError(requestError).message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    return () => controller.abort();
  }, [serviceId]);

  const runUpgrade = async () => {
    if (!targetPlanId) return;
    setIsSubmitting(true);
    try {
      await userService.upgradeHosting(serviceId, targetPlanId, upgradeKey);
      toast.success("Nâng cấp gói hosting thành công.");
      setActiveAction(null);
      setUpgradeKey(createIdempotencyKey("hosting-upgrade", serviceId));
      await load();
    } catch (requestError) {
      toast.error(normalizeApiError(requestError).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const runDestructiveAction = async (action: "reset" | "delete") => {
    setIsSubmitting(true);
    setNewPassword(null);
    try {
      if (action === "reset") {
        const result = await userService.resetHosting(serviceId, confirmation);
        setNewPassword(result.new_password);
        toast.success("Reset hosting thành công.");
        await load();
      } else {
        await userService.terminateHosting(serviceId, confirmation);
        toast.success("Đã xóa hosting trên máy chủ.");
        setActiveAction(null);
        await load();
      }
      setConfirmation("");
    } catch (requestError) {
      toast.error(normalizeApiError(requestError).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <LoadingState label="Đang đồng bộ thông tin hosting..." />;
  if (error || !service) return <ErrorState message={error ?? "Không tìm thấy hosting."} onRetry={load} />;

  const plan = service.hosting_plan ?? service.plan ?? service.service;
  const details = service.hosting_details;
  const options = service.upgrade_options ?? [];
  const domainMatches = confirmation.trim().toLowerCase() === (service.domain_name ?? "").toLowerCase();

  return (
    <div className="space-y-5">
      <nav className="flex items-center gap-2 text-sm text-text-muted" aria-label="Breadcrumb">
        <Link href="/user/hosting" className="hover:text-blue-primary">Quản lý hosting</Link>
        <i className="fas fa-chevron-right text-[10px]" aria-hidden="true" />
        <span className="truncate font-semibold text-blue-nav">{service.domain_name}</span>
      </nav>

      <section className="border border-gray-border bg-white shadow-[0_2px_12px_rgba(0,0,0,.04)]">
        <header className="flex flex-col gap-4 border-b border-gray-border p-5 sm:flex-row sm:items-start sm:justify-between md:p-6">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase text-blue-primary">{plan?.name ?? `Hosting #${service.id}`}</p>
            <h1 className="mt-1 break-all text-2xl font-extrabold text-blue-nav">{service.domain_name}</h1>
            <p className="mt-2 text-sm text-text-muted">Mã dịch vụ #{service.id} · Hết hạn {formatDate(service.expires_at)}</p>
          </div>
          <ServiceStatusBadge status={service.status} />
        </header>

        <div className="grid gap-0 lg:grid-cols-[1.1fr_.9fr]">
          <div className="p-5 md:p-6 lg:border-r lg:border-gray-border">
            <h2 className="text-base font-extrabold text-blue-nav">Thông tin máy chủ</h2>
            {details?.warning && <p className="mt-3 border-l-4 border-amber-400 bg-amber-50 px-3 py-2 text-sm text-amber-800">{details.warning}</p>}
            <dl className="mt-4 grid gap-x-6 gap-y-4 sm:grid-cols-2">
              {[
                ["Máy chủ", details?.server_name], ["Hostname", details?.server_host],
                ["IP hosting", details?.ip_address], ["Package WHM", details?.provider_plan],
                ["URL cPanel", details?.login_url], ["Tài khoản", service.username],
              ].map(([label, value]) => <div key={label}><dt className="text-xs font-semibold uppercase text-text-muted">{label}</dt><dd className="mt-1 break-all text-sm font-bold text-[#334155]">{value || "-"}</dd></div>)}
            </dl>
            <div className="mt-5 border-t border-gray-border pt-5">
              <h3 className="text-sm font-extrabold text-blue-nav">Nameserver</h3>
              {details?.nameservers?.length ? <div className="mt-2 grid gap-2 sm:grid-cols-2">{details.nameservers.map((nameserver) => <code key={nameserver} className="break-all bg-[#f4f7f8] px-3 py-2 text-sm text-blue-nav">{nameserver}</code>)}</div> : <p className="mt-2 text-sm text-text-muted">Máy chủ chưa trả về nameserver.</p>}
            </div>
          </div>

          <div className="p-5 md:p-6">
            <h2 className="text-base font-extrabold text-blue-nav">Tài nguyên gói</h2>
            <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div><dt className="text-text-muted">Dung lượng</dt><dd className="mt-1 font-bold text-blue-nav">{resourceValue(plan?.disk_quota, " MB")}</dd></div>
              <div><dt className="text-text-muted">Băng thông</dt><dd className="mt-1 font-bold text-blue-nav">{resourceValue(plan?.bandwidth_limit_mb, " MB")}</dd></div>
              <div><dt className="text-text-muted">RAM</dt><dd className="mt-1 font-bold text-blue-nav">{resourceValue(plan?.memory_limit_mb, " MB")}</dd></div>
              <div><dt className="text-text-muted">Giá tháng</dt><dd className="mt-1 font-bold text-orange-main">{plan?.price_per_month ? formatCurrency(plan.price_per_month) : "-"}</dd></div>
            </dl>
            <HostingServiceActions service={service} onUpdated={load} />
          </div>
        </div>
      </section>

      {service.status === "active" && service.provisioning_mode === "automatic" && (
        <section className="border border-gray-border bg-white p-5 md:p-6">
          <h2 className="text-base font-extrabold text-blue-nav">Thao tác nâng cao</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {service.actions.can_upgrade && <button type="button" onClick={() => { setActiveAction("upgrade"); setNewPassword(null); }} className="h-10 border border-blue-primary px-4 text-sm font-bold text-blue-primary hover:bg-blue-50">Nâng cấp hosting</button>}
            {service.actions.can_reset && <button type="button" onClick={() => { setActiveAction("reset"); setNewPassword(null); }} className="h-10 border border-amber-500 px-4 text-sm font-bold text-amber-700 hover:bg-amber-50">Reset hosting</button>}
            {service.actions.can_terminate && <button type="button" onClick={() => { setActiveAction("delete"); setNewPassword(null); }} className="h-10 border border-red-500 px-4 text-sm font-bold text-red-600 hover:bg-red-50">Xóa hosting</button>}
          </div>

          {activeAction === "upgrade" && <div className="mt-5 max-w-xl border-l-4 border-blue-primary bg-[#f8fafc] p-4"><h3 className="font-bold text-blue-nav">Chọn gói cao hơn</h3>{options.length ? <><select value={targetPlanId ?? ""} onChange={(event) => { setTargetPlanId(Number(event.target.value)); setUpgradeKey(createIdempotencyKey("hosting-upgrade", serviceId)); }} className="mt-3 h-11 w-full border border-gray-border bg-white px-3 text-sm"><option value="" disabled>Chọn gói nâng cấp</option>{options.map((option) => <option key={option.id} value={option.id}>{option.name} · phí nâng cấp {formatCurrency(option.upgrade_fee)}</option>)}</select><p className="mt-2 text-xs text-text-muted">Phí được tính theo chênh lệch giá và số ngày còn lại. Ngày hết hạn không thay đổi.</p><button type="button" disabled={!targetPlanId || isSubmitting} onClick={runUpgrade} className="mt-3 h-10 bg-blue-primary px-4 text-sm font-bold text-white disabled:opacity-50">{isSubmitting ? "Đang nâng cấp..." : "Xác nhận nâng cấp"}</button></> : <p className="mt-2 text-sm text-text-muted">Hiện chưa có gói cao hơn phù hợp trên cùng máy chủ.</p>}</div>}

          {(activeAction === "reset" || activeAction === "delete") && <div className={`mt-5 max-w-xl border-l-4 p-4 ${activeAction === "delete" ? "border-red-500 bg-red-50" : "border-amber-500 bg-amber-50"}`}><h3 className="font-bold text-blue-nav">{activeAction === "delete" ? "Xóa vĩnh viễn hosting" : "Reset toàn bộ hosting"}</h3><p className="mt-2 text-sm text-[#475569]">{activeAction === "delete" ? "Account và toàn bộ dữ liệu trên máy chủ sẽ bị xóa." : "Toàn bộ dữ liệu hiện tại sẽ bị xóa, account được tạo lại và cấp mật khẩu mới."} Nhập <strong>{service.domain_name}</strong> để xác nhận.</p><input value={confirmation} onChange={(event) => setConfirmation(event.target.value)} className="mt-3 h-11 w-full border border-gray-border bg-white px-3 text-sm" placeholder={service.domain_name ?? "Tên miền"} /><button type="button" disabled={!domainMatches || isSubmitting} onClick={() => runDestructiveAction(activeAction)} className={`mt-3 h-10 px-4 text-sm font-bold text-white disabled:opacity-50 ${activeAction === "delete" ? "bg-red-600" : "bg-amber-600"}`}>{isSubmitting ? "Đang xử lý..." : activeAction === "delete" ? "Xóa hosting" : "Reset hosting"}</button>{newPassword && <div className="mt-4 bg-white p-3 text-sm"><p className="font-semibold text-green-700">Mật khẩu mới chỉ hiển thị lần này:</p><code className="mt-2 block break-all text-blue-nav">{newPassword}</code></div>}</div>}
        </section>
      )}
    </div>
  );
}
