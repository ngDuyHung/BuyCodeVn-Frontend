import Link from "next/link";
import { formatCurrency } from "@/lib/format";
import { formatBillingCycle, getLowestVpsLocationId, getVpsPrice } from "@/lib/vps";
import type { VpsPlan } from "@/types/services";

interface VpsPlanCardProps {
  plan: VpsPlan;
  actionHref?: string;
  actionLabel: string;
  actionDisabled?: boolean;
  onAction?: () => void;
}

const ramLabel = (ramMb: number) => ramMb >= 1024 && ramMb % 1024 === 0 ? `${ramMb / 1024} GB` : `${ramMb} MB`;

export default function VpsPlanCard({ plan, actionHref, actionLabel, actionDisabled = false, onAction }: VpsPlanCardProps) {
  const cycles = Object.keys(plan.pricing);
  const cycle = cycles.includes("monthly") ? "monthly" : cycles[0];
  const locationId = getLowestVpsLocationId(plan);
  const price = cycle && locationId ? getVpsPrice(plan, cycle, locationId) : null;
  const actionClass = "inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-blue-primary px-3 text-sm font-bold text-white shadow-[0_7px_18px_color-mix(in_srgb,var(--color-blue-primary)_22%,transparent)] transition hover:-translate-y-0.5 hover:bg-[var(--color-blue-primary-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-primary disabled:cursor-not-allowed disabled:opacity-45";
  const specs = [
    { icon: "fa-microchip", label: "CPU", value: `${plan.cpu} vCPU` },
    { icon: "fa-memory", label: "RAM", value: ramLabel(plan.ram_mb) },
    { icon: "fa-hard-drive", label: "Lưu trữ", value: `${plan.disk_gb} GB SSD` },
    { icon: "fa-network-wired", label: "Địa chỉ IP", value: plan.ip_description },
    { icon: "fa-location-dot", label: "Khu vực", value: `${plan.locations.length} lựa chọn` },
    { icon: "fa-gauge-high", label: "Băng thông", value: plan.bandwidth },
  ];

  return <article className="group relative flex h-full min-w-0 flex-col overflow-hidden rounded-lg border border-[#dce4e7] border-t-[3px] border-t-blue-primary bg-white shadow-[0_8px_28px_rgba(15,43,71,.06)] transition duration-300 hover:-translate-y-1 hover:border-blue-primary hover:shadow-[0_18px_38px_color-mix(in_srgb,var(--color-blue-primary)_15%,transparent)]">
    <div className="px-5 pb-4 pt-5">
      <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate text-[11px] font-bold uppercase tracking-wide text-blue-primary">{plan.group_name || "Cloud VPS"}</p><h2 className="mt-1 truncate text-xl font-extrabold text-blue-nav" title={plan.name}>{plan.name}</h2></div><span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-[var(--color-blue-primary-soft)] text-lg text-blue-primary"><i className="fas fa-server" aria-hidden="true" /></span></div>
      <div className="mt-5 border-b border-[#e8edef] pb-5"><span className="text-[11px] font-bold uppercase text-[#718289]">Chỉ từ</span><div className="mt-1 flex items-end gap-1"><strong className="min-w-0 truncate text-[28px] font-black leading-none text-blue-nav">{price ? formatCurrency(price) : "Liên hệ"}</strong>{cycle && <span className="shrink-0 text-xs text-[#718289]">/ {formatBillingCycle(cycle)}</span>}</div></div>
    </div>
    <div className="flex flex-1 flex-col px-5 pb-5">
      <dl className="space-y-3">
        {specs.map((spec) => <div key={spec.label} className="flex items-center gap-3 text-sm"><dt className="flex min-w-0 flex-1 items-center gap-2 text-[#60727a]"><span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-[var(--color-blue-primary-soft)] text-[11px] text-blue-primary"><i className={`fas ${spec.icon}`} aria-hidden="true" /></span><span className="truncate">{spec.label}</span></dt><dd className="max-w-[50%] truncate text-right font-bold text-[#263d48]" title={spec.value}>{spec.value}</dd></div>)}
      </dl>
      <div className="mt-auto border-t border-[#e8edef] pt-5">
        {actionHref ? <Link href={actionHref} className={actionClass}>{actionLabel}<i className="fas fa-arrow-right text-xs" aria-hidden="true" /></Link> : <button type="button" disabled={actionDisabled || !price} onClick={onAction} className={actionClass}>{actionLabel}<i className="fas fa-arrow-right text-xs" aria-hidden="true" /></button>}
      </div>
    </div>
  </article>;
}
