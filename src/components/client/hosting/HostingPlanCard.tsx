import Link from "next/link";
import { formatCurrency } from "@/lib/format";
import type { HostingPlan } from "@/types/services";

interface HostingPlanCardProps {
  plan: HostingPlan;
  onSelect?: (plan: HostingPlan) => void;
}

const formatDiskQuota = (megabytes: number) => {
  if (megabytes === 0) return "Không giới hạn";
  if (megabytes >= 1024) {
    const gigabytes = megabytes / 1024;
    return `${Number.isInteger(gigabytes) ? gigabytes : gigabytes.toFixed(1)} GB`;
  }
  return `${megabytes} MB`;
};

const formatLimit = (value: number | undefined, unit = "") => value === 0
  ? "Không giới hạn"
  : `${new Intl.NumberFormat("vi-VN").format(value ?? 0)}${unit}`;

export default function HostingPlanCard({ plan, onSelect }: HostingPlanCardProps) {
  const buttonClass =
    "mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-[#116966] px-4 text-sm font-bold text-white transition-colors hover:bg-[#0d5957] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#116966]";
  const customFeatures = Object.entries(plan.custom_features ?? {}).slice(0, 2);

  return (
    <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-lg border border-[#dce3e5] bg-white shadow-[0_3px_14px_rgba(18,47,58,.06)] transition duration-300 hover:-translate-y-1 hover:border-[#9fc7c3] hover:shadow-[0_14px_30px_rgba(18,47,58,.12)]">
      <div className="border-b border-[#e3ecea] bg-[#eff7f5] px-4 py-4">
        <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-[11px] font-bold uppercase text-[#14827d]">Web Hosting</p><h3 className="mt-1 truncate text-lg font-extrabold text-[#183642]" title={plan.name}>{plan.name}</h3></div><span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-white text-[#116966] shadow-sm"><i className="fas fa-cloud" aria-hidden="true" /></span></div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="truncate text-xl font-extrabold text-[#d85d2a]">{formatCurrency(plan.price_per_month)}<span className="ml-1 text-xs font-normal text-[#718289]">/ tháng</span></p>
        <dl className="mt-4 grid grid-cols-2 gap-2.5">
          <div className="rounded-md bg-[#f6f8f9] p-2.5"><dt className="flex items-center gap-1.5 text-[11px] text-[#718289]"><i className="fas fa-hard-drive text-[#14827d]" aria-hidden="true" />Lưu trữ</dt><dd className="mt-1 truncate text-sm font-bold text-[#263d48]">{formatDiskQuota(plan.disk_quota)}</dd></div>
          <div className="rounded-md bg-[#f6f8f9] p-2.5"><dt className="flex items-center gap-1.5 text-[11px] text-[#718289]"><i className="fas fa-gauge-high text-[#14827d]" aria-hidden="true" />Băng thông</dt><dd className="mt-1 truncate text-sm font-bold text-[#263d48]">{formatLimit(plan.bandwidth_limit_mb, " MB")}</dd></div>
          <div className="rounded-md bg-[#f6f8f9] p-2.5"><dt className="flex items-center gap-1.5 text-[11px] text-[#718289]"><i className="fas fa-memory text-[#14827d]" aria-hidden="true" />RAM</dt><dd className="mt-1 truncate text-sm font-bold text-[#263d48]">{plan.memory_limit_mb == null ? "Theo máy chủ" : formatLimit(plan.memory_limit_mb, " MB")}</dd></div>
          <div className="rounded-md bg-[#f6f8f9] p-2.5"><dt className="flex items-center gap-1.5 text-[11px] text-[#718289]"><i className="fas fa-database text-[#14827d]" aria-hidden="true" />Database</dt><dd className="mt-1 truncate text-sm font-bold text-[#263d48]">{formatLimit(plan.max_databases)}</dd></div>
        </dl>
        <div className="mt-3 space-y-2 border-b border-[#e8edef] pb-3 text-xs"><div className="flex items-center justify-between gap-3"><span className="text-[#718289]"><i className="fas fa-layer-group mr-1.5 text-[#14827d]" aria-hidden="true" />Addon domain</span><strong className="text-[#354f59]">{formatLimit(plan.max_addon_domains)}</strong></div>{customFeatures.map(([key, value]) => <div key={key} className="flex items-center justify-between gap-3"><span className="truncate text-[#718289]"><i className="fas fa-circle-check mr-1.5 text-[#14827d]" aria-hidden="true" />{key}</span><strong className="truncate text-right text-[#354f59]">{value}</strong></div>)}</div>
        <div className="mt-auto pt-1">{onSelect ? (
        <button type="button" onClick={() => onSelect(plan)} className={buttonClass}>
          Đăng ký ngay<i className="fas fa-arrow-right text-[10px]" aria-hidden="true" />
        </button>
      ) : (
        <Link href={`/hosting?plan=${plan.id}`} className={buttonClass}>
          Đăng ký ngay<i className="fas fa-arrow-right text-[10px]" aria-hidden="true" />
        </Link>
      )}</div>
      </div>
    </article>
  );
}
