"use client";

import Link from "next/link";
import EmptyState from "@/components/shared/EmptyState";
import ErrorState from "@/components/shared/ErrorState";
import LoadingState from "@/components/shared/LoadingState";
import Pagination from "@/components/shared/Pagination";
import { useUserServices } from "@/hooks/client/useUserServices";
import { formatDate, getStatusLabel } from "@/lib/format";
import type { UserServiceStatus, UserServiceType } from "@/types/services";
import DomainServiceActions from "./DomainServiceActions";
import HostingServiceActions from "./HostingServiceActions";
import ServiceStatusBadge from "./ServiceStatusBadge";

const statuses: UserServiceStatus[] = ["pending", "active", "suspended", "expired", "failed", "terminated"];

export default function UserServiceManager({ serviceType }: { serviceType: UserServiceType }) {
  const { response, query, isLoading, error, setStatus, setPage, retry } = useUserServices(serviceType);
  const isHosting = serviceType === "hosting";

  return (
    <section className="overflow-hidden rounded-lg border border-gray-border bg-white shadow-[0_2px_12px_rgba(0,0,0,.04)]">
      <header className="flex flex-col gap-4 border-b border-gray-border p-5 sm:flex-row sm:items-end sm:justify-between md:p-6">
        <div>
          <h1 className="text-xl font-extrabold text-blue-nav">{isHosting ? "Quản lý Hosting" : "Quản lý tên miền"}</h1>
          <p className="mt-1 text-sm text-text-muted">{isHosting ? "Theo dõi dịch vụ, thông tin truy cập và thời hạn hosting." : "Theo dõi trạng thái đăng ký và gia hạn tên miền."}</p>
        </div>
        <label className="w-full text-xs font-semibold text-[#475569] sm:w-48">Trạng thái
          <select value={query.status ?? ""} onChange={(event) => setStatus(event.target.value as UserServiceStatus | "")} className="mt-1 h-10 w-full rounded-md border border-gray-border bg-white px-3 text-sm font-normal outline-none focus:border-blue-primary">
            <option value="">Tất cả</option>
            {statuses.map((status) => <option key={status} value={status}>{getStatusLabel(status)}</option>)}
          </select>
        </label>
      </header>

      {isLoading ? <LoadingState label={`Đang tải ${isHosting ? "hosting" : "tên miền"}...`} /> : error ? <ErrorState message={error} onRetry={retry} /> : !response?.data.length ? (
        <EmptyState title={`Chưa có ${isHosting ? "dịch vụ hosting" : "tên miền"} phù hợp`} description="Thử thay đổi bộ lọc hoặc đăng ký dịch vụ mới." action={<Link href={isHosting ? "/hosting" : "/domains"} className="font-semibold text-blue-primary">{isHosting ? "Xem gói hosting" : "Đăng ký tên miền"}</Link>} />
      ) : (
        <>
          <div className="grid gap-4 p-4 xl:grid-cols-2 md:p-5">
            {response.data.map((service) => {
              const plan = service.hosting_plan ?? service.plan;
              return (
                <article key={service.id} className="rounded-lg border border-gray-border p-4 md:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0"><p className="text-xs font-semibold uppercase text-text-muted">{isHosting ? plan?.name ?? `Hosting #${service.id}` : service.tld_pricing?.tld ?? `Tên miền #${service.id}`}</p><h2 className="mt-1 break-all text-lg font-extrabold text-blue-nav">{service.domain_name || "Chưa gắn tên miền"}</h2></div>
                    <ServiceStatusBadge status={service.status} />
                  </div>
                  <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div><dt className="text-text-muted">Ngày bắt đầu</dt><dd className="mt-1 font-semibold text-[#334155]">{formatDate(service.starts_at ?? service.created_at)}</dd></div>
                    <div><dt className="text-text-muted">Ngày hết hạn</dt><dd className="mt-1 font-semibold text-[#334155]">{formatDate(service.expires_at)}</dd></div>
                    {isHosting && <div><dt className="text-text-muted">Cấp phát</dt><dd className="mt-1 font-semibold text-[#334155]">{service.provisioning_mode === "manual" ? "Thủ công" : service.provisioning_mode === "automatic" ? "Tự động" : "-"}</dd></div>}
                    <div><dt className="text-text-muted">Mã dịch vụ</dt><dd className="mt-1 font-semibold text-[#334155]">#{service.id}</dd></div>
                  </dl>

                  {service.pending_renewal && <div className="mt-4 border-l-4 border-amber-400 bg-amber-50 px-3 py-2 text-sm text-amber-800"><strong>Đang chờ gia hạn thủ công.</strong> Yêu cầu #{service.pending_renewal.id}{service.pending_renewal.years ? ` · ${service.pending_renewal.years} năm` : ""}</div>}

                  {isHosting ? <HostingServiceActions service={service} onUpdated={retry} mode="list" /> : <DomainServiceActions service={service} onUpdated={retry} />}
                </article>
              );
            })}
          </div>
          <div className="border-t border-gray-border p-4"><Pagination currentPage={response.meta.current_page} lastPage={response.meta.last_page} onPageChange={setPage} /></div>
        </>
      )}
    </section>
  );
}
