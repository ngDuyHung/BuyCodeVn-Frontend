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
    "inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-blue-primary px-4 text-sm font-bold text-white shadow-[0_7px_18px_color-mix(in_srgb,var(--color-blue-primary)_22%,transparent)] transition hover:-translate-y-0.5 hover:bg-[var(--color-blue-primary-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-primary";
  const customFeatures = Object.entries(plan.custom_features ?? {}).slice(0, 2);
  const features = [
    { icon: "fa-hard-drive", label: "Lưu trữ", value: formatDiskQuota(plan.disk_quota) },
    { icon: "fa-gauge-high", label: "Băng thông", value: formatLimit(plan.bandwidth_limit_mb, " MB") },
    { icon: "fa-memory", label: "RAM", value: plan.memory_limit_mb == null ? "Theo máy chủ" : formatLimit(plan.memory_limit_mb, " MB") },
    { icon: "fa-database", label: "Database", value: formatLimit(plan.max_databases) },
    { icon: "fa-layer-group", label: "Addon domain", value: formatLimit(plan.max_addon_domains) },
    ...customFeatures.map(([label, value]) => ({ icon: "fa-circle-check", label, value: String(value) })),
  ];

  return (
    <article className="group relative flex h-full min-w-0 flex-col overflow-hidden rounded-lg border border-[#dce4e7] border-t-[3px] border-t-blue-primary bg-white shadow-[0_8px_28px_rgba(15,43,71,.06)] transition duration-300 hover:-translate-y-1 hover:border-blue-primary hover:shadow-[0_18px_38px_color-mix(in_srgb,var(--color-blue-primary)_15%,transparent)]">
      <div className="px-5 pb-4 pt-5">
        <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-[11px] font-bold uppercase tracking-wide text-blue-primary">Web Hosting</p><h3 className="mt-1 truncate text-xl font-extrabold text-blue-nav" title={plan.name}>{plan.name}</h3></div><span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-[var(--color-blue-primary-soft)] text-lg text-blue-primary"><i className="fas fa-cloud" aria-hidden="true" /></span></div>
        <div className="mt-5 flex items-end gap-1 border-b border-[#e8edef] pb-5"><strong className="min-w-0 truncate text-[28px] font-black leading-none text-blue-nav">{formatCurrency(plan.price_per_month)}</strong><span className="shrink-0 text-xs text-[#718289]">/tháng</span></div>
      </div>
      <div className="flex flex-1 flex-col px-5 pb-5 pt-4">
        <dl className="space-y-3">
          {features.map((feature) => <div key={feature.label} className="flex items-center gap-3 text-sm"><dt className="flex min-w-0 flex-1 items-center gap-2 text-[#60727a]"><span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-[var(--color-blue-primary-soft)] text-[11px] text-blue-primary"><i className={`fas ${feature.icon}`} aria-hidden="true" /></span><span className="truncate">{feature.label}</span></dt><dd className="max-w-[48%] truncate text-right font-bold text-[#263d48]" title={feature.value}>{feature.value}</dd></div>)}
        </dl>
        <div className="mt-auto border-t border-[#e8edef] pt-5">{onSelect ? (
        <button type="button" onClick={() => onSelect(plan)} className={buttonClass}>
          Đăng ký ngay<i className="fas fa-arrow-right text-xs" aria-hidden="true" />
        </button>
      ) : (
        <Link href={`/hosting?plan=${plan.id}`} className={buttonClass}>
          Đăng ký ngay<i className="fas fa-arrow-right text-xs" aria-hidden="true" />
        </Link>
      )}</div>
      </div>
    </article>
  );
}
