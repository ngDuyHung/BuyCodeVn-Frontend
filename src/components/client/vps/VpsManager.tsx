"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import EmptyState from "@/components/shared/EmptyState";
import ErrorState from "@/components/shared/ErrorState";
import LoadingState from "@/components/shared/LoadingState";
import Pagination from "@/components/shared/Pagination";
import ServiceStatusBadge from "@/components/client/services/ServiceStatusBadge";
import { useUserServices } from "@/hooks/client/useUserServices";
import { formatDate, formatDateTime, getStatusLabel } from "@/lib/format";
import { vpsService } from "@/services/client/vpsService";
import type { UserServiceStatus, VpsOsImage } from "@/types/services";
import VpsServiceActions from "./VpsServiceActions";

const statuses: UserServiceStatus[] = ["pending", "active", "suspended", "expired", "failed", "terminated"];

export default function VpsManager() {
  const { response, query, isLoading, error, setStatus, setPage, retry } = useUserServices("vps");
  const [osImages, setOsImages] = useState<VpsOsImage[]>([]);
  useEffect(() => {
    const controller = new AbortController();
    vpsService.getOsImages(controller.signal).then(setOsImages).catch(() => {});
    return () => controller.abort();
  }, []);

  return (
    <section className="overflow-hidden rounded-lg border border-gray-border bg-white">
      <header className="flex flex-col gap-3 border-b border-gray-border p-5 sm:flex-row sm:items-end sm:justify-between">
        <div><h1 className="text-xl font-extrabold text-blue-nav">Quản lý VPS</h1><p className="mt-1 text-sm text-text-muted">Theo dõi máy chủ, trạng thái cấp phát và thời hạn dịch vụ.</p></div>
        <label className="text-sm font-semibold text-[#475569]">Trạng thái<select value={query.status ?? ""} onChange={(event) => setStatus(event.target.value as UserServiceStatus | "")} className="mt-1 h-10 w-full rounded-md border border-gray-border bg-white px-3 font-normal sm:w-44"><option value="">Tất cả</option>{statuses.map((status) => <option key={status} value={status}>{getStatusLabel(status)}</option>)}</select></label>
      </header>
      {isLoading ? <LoadingState label="Đang tải VPS..." /> : error ? <ErrorState message={error} onRetry={retry} /> : !response?.data.length ? <EmptyState title="Chưa có VPS phù hợp" description="Thử thay đổi bộ lọc hoặc chọn một gói VPS." action={<Link href="/vps" className="font-semibold text-blue-primary">Xem gói VPS</Link>} /> : <>
        <div className="divide-y divide-gray-border">
          {response.data.map((service) => <article key={service.id} className="p-4 md:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><p className="text-xs font-semibold text-text-muted">VPS #{service.id}{service.service?.name ? ` · ${service.service.name}` : ""}</p><h2 className="mt-1 break-all text-lg font-extrabold text-blue-nav">{service.vps?.hostname ?? "Đang cấp phát"}</h2></div><ServiceStatusBadge status={service.status} /></div>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2 xl:grid-cols-4">
              <div><dt className="text-text-muted">IP</dt><dd className="mt-1 font-semibold">{service.vps?.ip_address ?? "Chưa có"}</dd></div>
              <div><dt className="text-text-muted">Cấp phát</dt><dd className="mt-1 font-semibold">{service.vps?.provisioning_status ?? "Đang chờ"}</dd></div>
              <div><dt className="text-text-muted">Nguồn</dt><dd className="mt-1 font-semibold">{service.vps?.power_status ?? "-"}</dd></div>
              <div><dt className="text-text-muted">Hệ điều hành</dt><dd className="mt-1 font-semibold">{service.vps?.os_name ?? "-"}</dd></div>
              <div><dt className="text-text-muted">Hết hạn</dt><dd className="mt-1 font-semibold">{formatDate(service.expires_at)}</dd></div>
              <div><dt className="text-text-muted">Đồng bộ lần cuối</dt><dd className="mt-1 font-semibold">{formatDateTime(service.vps?.last_synced_at)}</dd></div>
            </dl>
            {(service.vps?.provisioning_status === "creating" || service.vps?.provisioning_status === "installing" || service.vps?.provisioning_status === "reconciling") && <p className="mt-4 border-l-4 border-amber-400 bg-amber-50 p-3 text-sm text-amber-800">Nhà cung cấp đang xử lý. Hệ thống tự đối soát định kỳ; không cần gửi lại lệnh mua.</p>}
            <VpsServiceActions service={service} osImages={osImages} onUpdated={retry} />
          </article>)}
        </div>
        <div className="border-t border-gray-border p-4"><Pagination currentPage={response.meta.current_page} lastPage={response.meta.last_page} onPageChange={setPage} /></div>
      </>}
    </section>
  );
}
