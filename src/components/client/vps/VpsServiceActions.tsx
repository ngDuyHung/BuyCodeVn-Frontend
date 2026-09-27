"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { normalizeApiError } from "@/lib/api-error";
import { formatCurrency, formatDate } from "@/lib/format";
import { createVpsRequestId, formatBillingCycle, getVpsPrice, isValidVpsHostname } from "@/lib/vps";
import { orderService } from "@/services/client/orderService";
import { userService } from "@/services/client/userService";
import { vpsService } from "@/services/client/vpsService";
import type { RenewVpsResult } from "@/types/orders";
import type { UserService, VpsOsImage, VpsPlan, VpsServiceCredentials } from "@/types/services";

type PowerAction = "start" | "stop" | "restart" | "poweroff";
type Panel = "credentials" | "power" | "rebuild" | "password" | "hostname" | "renew" | null;

const powerLabels: Record<PowerAction, string> = {
  start: "Khởi động",
  stop: "Dừng",
  restart: "Khởi động lại",
  poweroff: "Tắt nguồn",
};

const validPassword = (password: string) => {
  const groups = [/[a-z]/, /[A-Z]/, /[0-9]/].filter((pattern) => pattern.test(password)).length;
  return password.length >= 10 && password.length <= 64 && !/\s/.test(password) && groups >= 2;
};

export default function VpsServiceActions({ service, osImages, onUpdated }: { service: UserService; osImages: VpsOsImage[]; onUpdated: () => void }) {
  const credentialRequest = useRef(0);
  const [panel, setPanel] = useState<Panel>(null);
  const [credentials, setCredentials] = useState<VpsServiceCredentials | null>(null);
  const [powerAction, setPowerAction] = useState<PowerAction>("restart");
  const [password, setPassword] = useState("");
  const [hostname, setHostname] = useState(service.vps?.hostname ?? "");
  const [osImageId, setOsImageId] = useState(osImages[0]?.id ?? 0);
  const [confirmRebuild, setConfirmRebuild] = useState(false);
  const [renewPlan, setRenewPlan] = useState<VpsPlan | null>(null);
  const [cycle, setCycle] = useState("");
  const cycles = Object.keys(renewPlan?.pricing ?? {});
  const locationId = service.vps?.location?.id;
  const price = renewPlan && locationId ? getVpsPrice(renewPlan, cycle, locationId) : null;
  const [renewKey, setRenewKey] = useState(createVpsRequestId);
  const [renewResult, setRenewResult] = useState<RenewVpsResult | null>(null);
  const [reconciling, setReconciling] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => () => { credentialRequest.current += 1; }, []);

  const open = async (next: Panel) => {
    const request = ++credentialRequest.current;
    setBusy(false);
    setCredentials(null);
    setPassword("");
    setError(null);
    setNotice(null);
    setPanel(next);
    if (next === "renew") {
      const planId = service.service?.id ?? service.vps_plan?.id;
      setRenewPlan(null);
      setCycle("");
      if (!planId) { setError("Dịch vụ chưa có mã gói VPS để tra cứu giá gia hạn."); return; }
      setBusy(true);
      try {
        const plan = await vpsService.getPlan(planId);
        if (request !== credentialRequest.current) return;
        setRenewPlan(plan);
        setCycle(Object.keys(plan.pricing)[0] ?? "");
      } catch (requestError) {
        if (request === credentialRequest.current) setError(normalizeApiError(requestError).message);
      } finally {
        if (request === credentialRequest.current) setBusy(false);
      }
      return;
    }
    if (next !== "credentials") return;
    setBusy(true);
    try {
      const response = await userService.getCredentials(service.id);
      if (request !== credentialRequest.current) return;
      if ("service_type" in response && response.service_type === "vps") setCredentials(response);
      else setError("Không tìm thấy thông tin đăng nhập VPS.");
    } catch (requestError) {
      if (request === credentialRequest.current) setError(normalizeApiError(requestError).message);
    } finally {
      if (request === credentialRequest.current) setBusy(false);
    }
  };

  const run = async (task: () => Promise<unknown>, success: string) => {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await task();
      setNotice(success);
      setPassword("");
      setConfirmRebuild(false);
      onUpdated();
    } catch (requestError) {
      setError(normalizeApiError(requestError).message);
    } finally {
      setBusy(false);
    }
  };

  const renew = async () => {
    setBusy(true);
    setError(null);
    try {
      const response = await orderService.renewVps(service.id, { billing_cycle: cycle, idempotency_key: renewKey });
      setRenewResult(response.data);
      setReconciling(response.data.status === "reconciling");
      onUpdated();
    } catch (requestError) {
      const apiError = normalizeApiError(requestError);
      setReconciling(apiError.status === 409 || !apiError.status || apiError.status >= 500);
      setError(apiError.message);
    } finally {
      setBusy(false);
    }
  };

  const copy = async (value: string) => {
    try { await navigator.clipboard.writeText(value); toast.success("Đã sao chép."); }
    catch { toast.error("Không thể sao chép."); }
  };

  const close = () => {
    credentialRequest.current += 1;
    setPanel(null);
    setBusy(false);
    setCredentials(null);
    setPassword("");
    setConfirmRebuild(false);
    setError(null);
    setNotice(null);
  };

  return (
    <div className="mt-4 border-t border-gray-border pt-4">
      <div className="flex flex-wrap gap-2">
        {service.actions.can_view_credentials && <button type="button" onClick={() => open("credentials")} className="rounded-md border border-gray-border px-3 py-2 text-sm font-semibold text-blue-primary">Thông tin đăng nhập</button>}
        {service.actions.can_manage_vps && <>
          <button type="button" onClick={() => open("power")} className="rounded-md border border-gray-border px-3 py-2 text-sm font-semibold text-blue-primary">Nguồn</button>
          <button type="button" onClick={() => open("rebuild")} className="rounded-md border border-gray-border px-3 py-2 text-sm font-semibold text-blue-primary">Cài lại OS</button>
          <button type="button" onClick={() => open("password")} className="rounded-md border border-gray-border px-3 py-2 text-sm font-semibold text-blue-primary">Đổi mật khẩu</button>
          <button type="button" onClick={() => open("hostname")} className="rounded-md border border-gray-border px-3 py-2 text-sm font-semibold text-blue-primary">Đổi hostname</button>
          <button type="button" onClick={() => run(() => userService.syncVps(service.id), "Đã đồng bộ trạng thái VPS.")} disabled={busy} className="rounded-md border border-gray-border px-3 py-2 text-sm font-semibold text-blue-primary disabled:opacity-50">Đồng bộ</button>
        </>}
        {service.actions.can_renew && <button type="button" onClick={() => open("renew")} className="rounded-md bg-blue-primary px-3 py-2 text-sm font-bold text-white">Gia hạn</button>}
      </div>
      {notice && <p role="status" className="mt-3 text-sm font-semibold text-green-700">{notice}</p>}
      {error && !panel && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}
      {panel && <div className="mt-4 border-l-4 border-blue-primary bg-[#f8fafc] p-4">
        <div className="mb-3 flex items-start justify-between gap-2"><h3 className="font-bold text-blue-nav">{panel === "credentials" ? "Thông tin đăng nhập" : panel === "power" ? "Điều khiển nguồn" : panel === "rebuild" ? "Cài lại hệ điều hành" : panel === "password" ? "Đổi mật khẩu root" : panel === "hostname" ? "Đổi hostname" : "Gia hạn VPS"}</h3><button type="button" onClick={close} aria-label="Đóng" className="size-8 text-text-muted"><i className="fas fa-xmark" aria-hidden="true" /></button></div>
        {error && <p role="alert" className="mb-3 text-sm text-red-600">{error}</p>}
        {notice && <p role="status" className="mb-3 text-sm font-semibold text-green-700">{notice}</p>}
        {panel === "credentials" && (busy ? <p className="text-sm">Đang tải...</p> : credentials && <div className="space-y-2 text-sm"><p className="text-amber-700">Mật khẩu chỉ hiển thị khi bạn mở mục này.</p>{(["ip_address", "username", "password"] as const).map((field) => <div key={field} className="flex items-center gap-2"><span className="w-20 shrink-0 text-text-muted">{field === "ip_address" ? "IP" : field === "username" ? "Tài khoản" : "Mật khẩu"}</span><code className="min-w-0 flex-1 break-all bg-white px-2 py-1">{credentials[field] ?? "-"}</code>{credentials[field] && <button type="button" onClick={() => copy(credentials[field]!)} aria-label={`Sao chép ${field}`} className="size-9 text-blue-primary"><i className="fas fa-copy" aria-hidden="true" /></button>}</div>)}</div>)}
        {panel === "power" && <div className="space-y-3 text-sm"><label className="block font-semibold">Thao tác<select value={powerAction} onChange={(event) => setPowerAction(event.target.value as PowerAction)} className="mt-1 h-10 w-full rounded-md border border-gray-border bg-white px-3 font-normal">{(Object.keys(powerLabels) as PowerAction[]).map((action) => <option key={action} value={action}>{powerLabels[action]}</option>)}</select></label><p className="text-amber-800">Dừng hoặc tắt nguồn sẽ khiến VPS tạm thời không truy cập được.</p><button type="button" disabled={busy} onClick={() => run(() => userService.vpsAction(service.id, powerAction), `Đã gửi lệnh ${powerLabels[powerAction].toLowerCase()}.`)} className="rounded-md bg-blue-primary px-4 py-2 font-bold text-white disabled:opacity-50">Xác nhận {powerLabels[powerAction].toLowerCase()}</button></div>}
        {panel === "password" && <div className="space-y-3 text-sm"><label className="block font-semibold">Mật khẩu mới<input type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1 h-10 w-full rounded-md border border-gray-border bg-white px-3 font-normal" /></label><p className="text-text-muted">10–64 ký tự, không có khoảng trắng và có ít nhất hai nhóm chữ thường/chữ hoa/chữ số.</p><button type="button" disabled={busy || !validPassword(password)} onClick={() => run(() => userService.changeVpsPassword(service.id, password), "Đã gửi yêu cầu đổi mật khẩu. Hãy mở lại thông tin đăng nhập sau khi đồng bộ.")} className="rounded-md bg-blue-primary px-4 py-2 font-bold text-white disabled:opacity-50">Xác nhận đổi mật khẩu</button></div>}
        {panel === "hostname" && <div className="space-y-3 text-sm"><label className="block font-semibold">Hostname mới<input value={hostname} maxLength={63} onChange={(event) => setHostname(event.target.value)} className="mt-1 h-10 w-full rounded-md border border-gray-border bg-white px-3 font-normal" /></label><button type="button" disabled={busy || !isValidVpsHostname(hostname)} onClick={() => run(() => userService.changeVpsHostname(service.id, hostname), "Đã cập nhật hostname.")} className="rounded-md bg-blue-primary px-4 py-2 font-bold text-white disabled:opacity-50">Lưu hostname</button></div>}
        {panel === "rebuild" && <div className="space-y-3 text-sm"><p className="font-semibold text-red-700">Cài lại OS sẽ xóa toàn bộ dữ liệu hiện có trên VPS. Không thể hoàn tác.</p><label className="block font-semibold">Hệ điều hành<select value={osImageId} onChange={(event) => setOsImageId(Number(event.target.value))} className="mt-1 h-10 w-full rounded-md border border-gray-border bg-white px-3 font-normal">{osImages.map((os) => <option key={os.id} value={os.id}>{os.name}</option>)}</select></label><label className="block font-semibold">Mật khẩu mới (không bắt buộc)<input type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1 h-10 w-full rounded-md border border-gray-border bg-white px-3 font-normal" /></label><label className="flex items-start gap-2"><input type="checkbox" checked={confirmRebuild} onChange={(event) => setConfirmRebuild(event.target.checked)} className="mt-1" /> Tôi hiểu dữ liệu trên VPS sẽ bị xóa vĩnh viễn.</label><button type="button" disabled={busy || !confirmRebuild || !osImageId || Boolean(password && !validPassword(password))} onClick={() => run(() => userService.rebuildVps(service.id, { os_image_id: osImageId, ...(password ? { new_password: password } : {}) }), "Đã gửi yêu cầu cài lại OS.")} className="rounded-md bg-red-600 px-4 py-2 font-bold text-white disabled:opacity-50">Xác nhận xóa dữ liệu và cài lại</button></div>}
        {panel === "renew" && (renewResult ? <div className="space-y-2 text-sm"><p className="font-bold text-green-700">{renewResult.idempotent ? "Yêu cầu đã được xử lý trước đó, không tạo giao dịch mới." : renewResult.status === "reconciling" ? "Đang đối soát với nhà cung cấp." : "Đã tiếp nhận gia hạn VPS."}</p>{renewResult.expires_at && <p>Hạn mới: {formatDate(renewResult.expires_at)}</p>}<p>Đơn hàng #{renewResult.order_id}</p></div> : <div className="space-y-3 text-sm"><label className="block font-semibold">Chu kỳ<select value={cycle} disabled={reconciling} onChange={(event) => { setCycle(event.target.value); setRenewKey(createVpsRequestId()); setReconciling(false); }} className="mt-1 h-10 w-full rounded-md border border-gray-border bg-white px-3 font-normal">{cycles.length ? cycles.map((value) => <option key={value} value={value}>{formatBillingCycle(value)}</option>) : <option value="">Chưa có giá</option>}</select></label>{price ? <p>Chi phí dự kiến (gồm phụ thu khu vực): <strong>{formatCurrency(price)}</strong></p> : <p className="text-amber-700">Chưa có giá gia hạn và khu vực từ backend. Không thể xác nhận thanh toán.</p>}{reconciling && <p className="border-l-4 border-amber-400 bg-amber-50 p-3 text-amber-800">Yêu cầu chưa được xác nhận hoàn tất. Kiểm tra lỗi phía trên; thử lại với cùng UUID để tránh trùng giao dịch.</p>}<button type="button" disabled={busy || !price} onClick={renew} className="rounded-md bg-blue-primary px-4 py-2 font-bold text-white disabled:opacity-50">{reconciling ? "Thử lại yêu cầu" : "Xác nhận gia hạn"}</button></div>)}
      </div>}
    </div>
  );
}
