"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { createIdempotencyKey } from "@/lib/idempotency";
import { normalizeApiError } from "@/lib/api-error";
import { formatCurrency, formatDate } from "@/lib/format";
import { multiplyMoney } from "@/lib/money";
import { orderService } from "@/services/client/orderService";
import { userService } from "@/services/client/userService";
import { HOSTING_MONTH_OPTIONS, type HostingMonths, type RenewHostingResult } from "@/types/orders";
import type { HostingServiceCredentials, UserService } from "@/types/services";

type ActivePanel = "credentials" | "password" | "renew" | null;

const copyValue = async (value: string, label: string) => {
  try {
    await navigator.clipboard.writeText(value);
    toast.success(`Đã sao chép ${label}.`);
  } catch {
    toast.error(`Không thể sao chép ${label}.`);
  }
};

export default function HostingServiceActions({ service, onUpdated }: { service: UserService; onUpdated: () => void }) {
  const [panel, setPanel] = useState<ActivePanel>(null);
  const [credentials, setCredentials] = useState<HostingServiceCredentials | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [revealedPassword, setRevealedPassword] = useState<string | null>(null);
  const [months, setMonths] = useState<HostingMonths>(1);
  const [renewalKey, setRenewalKey] = useState(() => createIdempotencyKey("hosting-renew", service.id));
  const [renewal, setRenewal] = useState<RenewHostingResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpeningCpanel, setIsOpeningCpanel] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openPanel = async (nextPanel: ActivePanel) => {
    if (panel !== nextPanel) {
      setCredentials(null);
      setRevealedPassword(null);
      setRenewal(null);
    }
    setPanel(nextPanel);
    setError(null);
    if (nextPanel !== "credentials" || credentials) return;

    setIsSubmitting(true);
    try {
      const response = await userService.getCredentials(service.id);
      if ("domain" in response) {
        setCredentials(response);
      } else {
        setError("Dịch vụ này không phải hosting.");
      }
    } catch (requestError) {
      setError(normalizeApiError(requestError).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const changePassword = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await orderService.changeHostingPassword(
        service.id,
        newPassword ? { new_password: newPassword } : {},
      );
      setRevealedPassword(response.data.new_password);
      setNewPassword("");
      onUpdated();
    } catch (requestError) {
      setError(normalizeApiError(requestError).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renewHosting = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await orderService.renewHosting(service.id, {
        months,
        idempotency_key: renewalKey,
      });
      setRenewal(response.data);
      onUpdated();
    } catch (requestError) {
      setError(normalizeApiError(requestError).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const closePanel = () => {
    setPanel(null);
    setCredentials(null);
    setRevealedPassword(null);
    setRenewal(null);
    setError(null);
  };

  const openCpanel = async () => {
    const popup = window.open("", "_blank");
    if (!popup) {
      setError("Trình duyệt đang chặn cửa sổ đăng nhập cPanel.");
      return;
    }
    popup.opener = null;
    setIsOpeningCpanel(true);
    setError(null);
    try {
      const session = await userService.createHostingLoginSession(service.id);
      popup.location.replace(session.url);
    } catch (requestError) {
      popup.close();
      setError(normalizeApiError(requestError).message);
    } finally {
      setIsOpeningCpanel(false);
    }
  };

  const plan = service.hosting_plan ?? service.plan;

  return (
    <div className="mt-4 border-t border-gray-border pt-4">
      <div className="flex flex-wrap gap-2">
        {service.status === "active" && service.provisioning_mode === "automatic" && (
          <button type="button" disabled={isOpeningCpanel} onClick={openCpanel} className="inline-flex h-9 items-center gap-2 rounded-md border border-emerald-600 px-3 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 disabled:opacity-50">
            <i className={`fas ${isOpeningCpanel ? "fa-spinner fa-spin" : "fa-arrow-up-right-from-square"}`} aria-hidden="true" /> {isOpeningCpanel ? "Đang mở cPanel..." : "Đăng nhập cPanel"}
          </button>
        )}
        {service.actions.can_view_credentials && (
          <button type="button" onClick={() => openPanel("credentials")} className="inline-flex h-9 items-center gap-2 rounded-md border border-gray-border px-3 text-sm font-semibold text-[#475569] hover:border-blue-primary hover:text-blue-primary">
            <i className="fas fa-eye" aria-hidden="true" /> Thông tin đăng nhập
          </button>
        )}
        {service.actions.can_change_password && (
          <button type="button" onClick={() => openPanel("password")} className="inline-flex h-9 items-center gap-2 rounded-md border border-gray-border px-3 text-sm font-semibold text-[#475569] hover:border-blue-primary hover:text-blue-primary">
            <i className="fas fa-key" aria-hidden="true" /> Đổi mật khẩu
          </button>
        )}
        {service.actions.can_renew && (
          <button type="button" onClick={() => openPanel("renew")} className="inline-flex h-9 items-center gap-2 rounded-md bg-blue-primary px-3 text-sm font-bold text-white hover:bg-[#154ea0]">
            <i className="fas fa-rotate" aria-hidden="true" /> Gia hạn
          </button>
        )}
      </div>

      {!panel && error && <p role="alert" className="mt-3 text-sm font-medium text-red-600">{error}</p>}

      {panel && (
        <div className="mt-4 border-l-4 border-blue-primary bg-[#f8fafc] p-4">
          <div className="mb-3 flex items-start justify-between gap-3">
            <h3 className="font-bold text-blue-nav">
              {panel === "credentials" ? "Thông tin đăng nhập" : panel === "password" ? "Đổi mật khẩu hosting" : "Gia hạn hosting"}
            </h3>
            <button type="button" onClick={closePanel} aria-label="Đóng" className="size-8 text-text-muted hover:text-blue-nav"><i className="fas fa-xmark" aria-hidden="true" /></button>
          </div>

          {error && <p role="alert" className="mb-3 text-sm font-medium text-red-600">{error}</p>}

          {panel === "credentials" && (
            isSubmitting ? <p className="text-sm text-text-muted">Đang tải thông tin...</p> : credentials && (
              <div className="space-y-3 text-sm">
                <p className="text-amber-700">Thông tin nhạy cảm chỉ hiển thị trong lần mở này. Không chia sẻ cho người khác.</p>
                {(["login_url", "username", "password"] as const).map((field) => (
                  <div key={field} className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <span className="w-24 shrink-0 font-semibold text-[#475569]">{field === "login_url" ? "Đăng nhập" : field === "username" ? "Tài khoản" : "Mật khẩu"}</span>
                    <code className="min-w-0 flex-1 break-all rounded bg-white px-3 py-2 text-blue-nav">{credentials[field]}</code>
                    <button type="button" onClick={() => copyValue(credentials[field], field === "login_url" ? "liên kết" : field === "username" ? "tài khoản" : "mật khẩu")} aria-label={`Sao chép ${field}`} className="size-9 shrink-0 rounded border border-gray-border text-blue-primary"><i className="fas fa-copy" aria-hidden="true" /></button>
                  </div>
                ))}
              </div>
            )
          )}

          {panel === "password" && !revealedPassword && (
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-[#475569]">Mật khẩu mới (để trống để hệ thống tạo)
                <input type="password" minLength={8} maxLength={50} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className="mt-1 h-10 w-full rounded-md border border-gray-border bg-white px-3 font-normal outline-none focus:border-blue-primary" />
              </label>
              <button type="button" disabled={isSubmitting || (newPassword.length > 0 && newPassword.length < 8)} onClick={changePassword} className="h-10 rounded-md bg-blue-primary px-4 text-sm font-bold text-white disabled:opacity-50">{isSubmitting ? "Đang cập nhật..." : "Xác nhận đổi mật khẩu"}</button>
            </div>
          )}

          {panel === "password" && revealedPassword && (
            <div className="space-y-3 text-sm">
              <p className="font-semibold text-green-700">Đổi mật khẩu thành công. Mật khẩu này chỉ được hiển thị một lần.</p>
              <div className="flex items-center gap-2"><code className="min-w-0 flex-1 break-all rounded bg-white px-3 py-2 text-blue-nav">{revealedPassword}</code><button type="button" onClick={() => copyValue(revealedPassword, "mật khẩu")} aria-label="Sao chép mật khẩu mới" className="size-9 shrink-0 rounded border border-gray-border text-blue-primary"><i className="fas fa-copy" aria-hidden="true" /></button></div>
            </div>
          )}

          {panel === "renew" && !renewal && (
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-[#475569]">Thời hạn
                <select value={months} onChange={(event) => { setMonths(Number(event.target.value) as HostingMonths); setRenewalKey(createIdempotencyKey("hosting-renew", service.id)); }} className="mt-1 h-10 w-full rounded-md border border-gray-border bg-white px-3 font-normal outline-none focus:border-blue-primary">
                  {HOSTING_MONTH_OPTIONS.map((value) => <option key={value} value={value}>{value} tháng</option>)}
                </select>
              </label>
              {plan?.price_per_month && <p className="text-sm text-[#475569]">Chi phí dự kiến: <strong className="text-orange-main">{formatCurrency(multiplyMoney(plan.price_per_month, months))}</strong></p>}
              <button type="button" disabled={isSubmitting} onClick={renewHosting} className="h-10 rounded-md bg-blue-primary px-4 text-sm font-bold text-white disabled:opacity-50">{isSubmitting ? "Đang gia hạn..." : "Xác nhận gia hạn"}</button>
            </div>
          )}

          {panel === "renew" && renewal && (
            <div className="space-y-2 text-sm">
              <p className="font-semibold text-green-700">{renewal.idempotent ? "Yêu cầu này đã được xử lý trước đó, không phát sinh giao dịch mới." : "Gia hạn hosting thành công."}</p>
              <p>Hạn sử dụng mới: <strong>{formatDate(renewal.expires_at)}</strong></p>
              <p>Đơn hàng: <strong>#{renewal.order_id}</strong></p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
