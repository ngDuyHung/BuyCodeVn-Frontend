import Link from "next/link";
import { formatCurrency } from "@/lib/format";
import type { HostingPlan } from "@/types/services";

interface HostingPlanCardProps {
  plan: HostingPlan;
  onSelect?: (plan: HostingPlan) => void;
}

const formatDiskQuota = (megabytes: number) => {
  if (megabytes >= 1024) {
    const gigabytes = megabytes / 1024;
    return `${Number.isInteger(gigabytes) ? gigabytes : gigabytes.toFixed(1)} GB`;
  }
  return `${megabytes} MB`;
};

export default function HostingPlanCard({ plan, onSelect }: HostingPlanCardProps) {
  const buttonClass =
    "mt-auto inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border-[1.5px] border-blue-primary px-4 text-[13.5px] font-bold text-blue-primary transition-colors hover:bg-blue-primary hover:text-white";

  return (
    <article className="relative flex h-full min-h-[350px] flex-col rounded-lg border-[1.5px] border-[#e5e7eb] bg-white px-4 pb-[18px] pt-[22px] transition duration-200 hover:-translate-y-1 hover:border-[#c7d8f0] hover:shadow-[0_10px_30px_rgba(0,0,0,.1)] lg:px-5 lg:pb-[22px] lg:pt-[26px]">
      <h3 className="text-[18px] font-extrabold leading-6 text-blue-nav">
        {plan.name}
      </h3>
      <p className="mt-1 min-h-10 text-[12.5px] leading-5 text-text-muted">
        Gói hosting linh hoạt cho website của bạn
      </p>
      <p className="mb-[18px] mt-3 text-[26px] font-extrabold leading-none text-blue-nav">
        {formatCurrency(plan.price_per_month)}
        <span className="ml-1 text-[12px] font-normal text-text-muted">/tháng</span>
      </p>
      <ul className="mb-5 flex flex-col gap-2.5">
        <li className="flex items-center gap-2 text-[12.5px] text-[#374151]">
          <i className="fas fa-hard-drive w-[14px] shrink-0 text-xs text-blue-primary" aria-hidden="true" />
          {formatDiskQuota(plan.disk_quota)} lưu trữ
        </li>
        <li className="flex items-center gap-2 text-[12.5px] text-[#374151]">
          <i className="fas fa-globe w-[14px] shrink-0 text-xs text-blue-primary" aria-hidden="true" />
          Sử dụng tên miền riêng
        </li>
        <li className="flex items-center gap-2 text-[12.5px] text-[#374151]">
          <i className="fas fa-calendar-check w-[14px] shrink-0 text-xs text-blue-primary" aria-hidden="true" />
          Chu kỳ từ 1 đến 36 tháng
        </li>
        <li className="flex items-center gap-2 text-[12.5px] text-[#374151]">
          <i className="fas fa-gauge-high w-[14px] shrink-0 text-xs text-blue-primary" aria-hidden="true" />
          Quản lý trong tài khoản
        </li>
        <li className="flex items-center gap-2 text-[12.5px] text-[#374151]">
          <i className="fas fa-headset w-[14px] shrink-0 text-xs text-blue-primary" aria-hidden="true" />
          Hỗ trợ kỹ thuật
        </li>
      </ul>
      {onSelect ? (
        <button type="button" onClick={() => onSelect(plan)} className={buttonClass}>
          Đăng ký ngay
        </button>
      ) : (
        <Link href={`/hosting?plan=${plan.id}`} className={buttonClass}>
          Đăng ký ngay
        </Link>
      )}
    </article>
  );
}
