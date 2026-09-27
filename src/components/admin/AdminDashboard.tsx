"use client";

import { useEffect, useState } from "react";
import ErrorState from "@/components/shared/ErrorState";
import LoadingState from "@/components/shared/LoadingState";
import { can, type AdminPermission } from "@/lib/admin-permissions";
import { adminService } from "@/services/admin/adminService";
import { useAuthStore } from "@/stores/authStore";

const metrics: { label: string; resource: "users" | "orders" | "services" | "catalog/products"; permission: AdminPermission; icon: string }[] = [
  { label: "Người dùng", resource: "users", permission: "users.view", icon: "fa-users" },
  { label: "Đơn hàng", resource: "orders", permission: "orders.view", icon: "fa-receipt" },
  { label: "Dịch vụ", resource: "services", permission: "services.view", icon: "fa-server" },
  { label: "Sản phẩm", resource: "catalog/products", permission: "catalog.view", icon: "fa-box" },
];

export default function AdminDashboard() {
  const user = useAuthStore((state) => state.user);
  const [totals, setTotals] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reload, setReload] = useState(0);
  const visible = metrics.filter((metric) => can(user, metric.permission));
  const permissionKey = visible.map((metric) => metric.resource).join(",");

  useEffect(() => {
    const controller = new AbortController();
    const selected = metrics.filter((metric) => permissionKey.split(",").includes(metric.resource));
    Promise.allSettled(selected.map(async (metric) => [metric.resource, await adminService.getTotal(metric.resource, controller.signal)] as const))
      .then((results) => {
        if (controller.signal.aborted) return;
        const values: Record<string, number> = {};
        results.forEach((result) => { if (result.status === "fulfilled") values[result.value[0]] = result.value[1]; });
        setTotals(values);
        if (results.some((result) => result.status === "rejected")) setError("Một số chỉ số chưa tải được.");
        else setError(null);
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [permissionKey, reload]);

  return <section><header className="mb-6"><h1 className="text-xl font-bold">Tổng quan</h1><p className="mt-1 text-sm text-[#60727a]">Số liệu từ hệ thống hiện tại.</p></header>{loading ? <LoadingState label="Đang tải chỉ số..." /> : <>{error && <ErrorState message={error} onRetry={() => { setLoading(true); setReload((value) => value + 1); }} />}{visible.length ? <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{visible.map((metric) => <div key={metric.resource} className="border border-[#dce3e5] bg-white p-4"><div className="flex items-center justify-between text-sm text-[#60727a]"><span>{metric.label}</span><i className={`fas ${metric.icon}`} aria-hidden="true" /></div><p className="mt-3 text-2xl font-bold tabular-nums text-[#172b35]">{totals[metric.resource] ?? "—"}</p></div>)}</div> : <p className="text-sm text-[#60727a]">Tài khoản chưa có quyền xem chỉ số.</p>}</>}</section>;
}
