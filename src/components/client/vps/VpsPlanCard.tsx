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
  const actionClass = "mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-[#116966] px-3 text-sm font-bold text-white transition hover:bg-[#0d5957] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#116966] disabled:cursor-not-allowed disabled:opacity-45";

  return <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-lg border border-[#dce3e5] bg-white shadow-[0_3px_14px_rgba(18,47,58,.06)] transition duration-300 hover:-translate-y-1 hover:border-[#9fc7c3] hover:shadow-[0_14px_30px_rgba(18,47,58,.12)]">
    <div className="border-b border-[#e8edef] bg-[#f3f8f7] px-4 py-4">
      <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate text-[11px] font-bold uppercase text-[#cc6915]">{plan.group_name || "Cloud VPS"}</p><h2 className="mt-1 truncate text-lg font-extrabold text-[#183642]" title={plan.name}>{plan.name}</h2></div><span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-white text-[#116966] shadow-sm"><i className="fas fa-server" aria-hidden="true" /></span></div>
    </div>
    <div className="flex flex-1 flex-col p-4">
      <dl className="grid grid-cols-2 gap-2.5">
        <div className="rounded-md bg-[#f6f8f9] p-2.5"><dt className="flex items-center gap-1.5 text-[11px] text-[#718289]"><i className="fas fa-microchip text-[#14827d]" aria-hidden="true" />CPU</dt><dd className="mt-1 text-sm font-bold text-[#263d48]">{plan.cpu} vCPU</dd></div>
        <div className="rounded-md bg-[#f6f8f9] p-2.5"><dt className="flex items-center gap-1.5 text-[11px] text-[#718289]"><i className="fas fa-memory text-[#14827d]" aria-hidden="true" />RAM</dt><dd className="mt-1 text-sm font-bold text-[#263d48]">{ramLabel(plan.ram_mb)}</dd></div>
        <div className="rounded-md bg-[#f6f8f9] p-2.5"><dt className="flex items-center gap-1.5 text-[11px] text-[#718289]"><i className="fas fa-hard-drive text-[#14827d]" aria-hidden="true" />SSD</dt><dd className="mt-1 text-sm font-bold text-[#263d48]">{plan.disk_gb} GB</dd></div>
        <div className="rounded-md bg-[#f6f8f9] p-2.5"><dt className="flex items-center gap-1.5 text-[11px] text-[#718289]"><i className="fas fa-network-wired text-[#14827d]" aria-hidden="true" />IP</dt><dd className="mt-1 truncate text-sm font-bold text-[#263d48]" title={plan.ip_description}>{plan.ip_description}</dd></div>
      </dl>
      <div className="mt-3 space-y-2 border-b border-[#e8edef] pb-3 text-xs"><div className="flex items-center justify-between gap-3"><span className="text-[#718289]"><i className="fas fa-location-dot mr-1.5 text-[#14827d]" aria-hidden="true" />Khu vực</span><strong className="text-[#354f59]">{plan.locations.length} lựa chọn</strong></div><div className="flex items-center justify-between gap-3"><span className="text-[#718289]"><i className="fas fa-gauge-high mr-1.5 text-[#14827d]" aria-hidden="true" />Băng thông</span><strong className="truncate text-right text-[#354f59]" title={plan.bandwidth}>{plan.bandwidth}</strong></div></div>
      <div className="mt-auto pt-4"><span className="text-[11px] font-semibold uppercase text-[#718289]">Chỉ từ</span><p className="mt-0.5 truncate text-xl font-extrabold text-[#d85d2a]">{price ? formatCurrency(price) : "Liên hệ"}{cycle && <span className="ml-1 text-xs font-normal text-[#718289]">/ {formatBillingCycle(cycle)}</span>}</p>
        {actionHref ? <Link href={actionHref} className={actionClass}>{actionLabel}<i className="fas fa-arrow-right text-[10px]" aria-hidden="true" /></Link> : <button type="button" disabled={actionDisabled || !price} onClick={onAction} className={actionClass}>{actionLabel}<i className="fas fa-arrow-right text-[10px]" aria-hidden="true" /></button>}
      </div>
    </div>
  </article>;
}
