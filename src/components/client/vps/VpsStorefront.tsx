"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import EmptyState from "@/components/shared/EmptyState";
import ErrorState from "@/components/shared/ErrorState";
import LoadingState from "@/components/shared/LoadingState";
import { normalizeApiError } from "@/lib/api-error";
import { formatCurrency } from "@/lib/format";
import { formatBillingCycle, getLowestVpsLocationId, getVpsPrice } from "@/lib/vps";
import { vpsService } from "@/services/client/vpsService";
import type { VpsOsImage, VpsPlan } from "@/types/services";
import VpsCheckout from "./VpsCheckout";

export default function VpsStorefront() {
  const [plans, setPlans] = useState<VpsPlan[]>([]);
  const [osImages, setOsImages] = useState<VpsOsImage[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<VpsPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([vpsService.getPlans(controller.signal), vpsService.getOsImages(controller.signal)])
      .then(([availablePlans, images]) => { if (!controller.signal.aborted) { setPlans(availablePlans); setOsImages(images); } })
      .catch((requestError) => { if (!controller.signal.aborted) setError(normalizeApiError(requestError).message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [reloadKey]);

  return (
    <main className="min-h-screen bg-[#f8fafc] py-8 md:py-12">
      <div className="mx-auto max-w-[1350px] px-4 md:px-5">
        <nav aria-label="Breadcrumb" className="mb-3 text-sm text-text-muted"><Link href="/" className="hover:text-blue-primary">Trang chủ</Link><span className="mx-2">/</span>VPS</nav>
        <h1 className="text-2xl font-extrabold text-blue-nav">VPS</h1>
        <p className="mt-1 text-sm text-text-muted">Chọn cấu hình, khu vực và hệ điều hành phù hợp.</p>
        {loading ? <LoadingState label="Đang tải gói VPS..." /> : error ? <ErrorState message={error} onRetry={() => { setLoading(true); setError(null); setReloadKey((key) => key + 1); }} /> : plans.length === 0 ? <EmptyState title="Chưa có gói VPS khả dụng" description="Các gói VPS đang được cập nhật." /> : (
          <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {plans.map((plan) => {
              const firstCycle = Object.keys(plan.pricing)[0];
              const locationId = getLowestVpsLocationId(plan);
              const price = firstCycle && locationId ? getVpsPrice(plan, firstCycle, locationId) : null;
              return <article key={plan.id} className="flex flex-col rounded-lg border border-gray-border bg-white p-5">
                <p className="text-xs font-semibold text-text-muted">{plan.group_name}</p>
                <h2 className="mt-1 text-lg font-extrabold text-blue-nav">{plan.name}</h2>
                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm"><div><dt className="text-text-muted">CPU</dt><dd className="font-bold">{plan.cpu} vCPU</dd></div><div><dt className="text-text-muted">RAM</dt><dd className="font-bold">{plan.ram_mb} MB</dd></div><div><dt className="text-text-muted">Ổ đĩa</dt><dd className="font-bold">{plan.disk_gb} GB</dd></div><div><dt className="text-text-muted">IP</dt><dd className="font-bold">{plan.ip_description}</dd></div><div className="col-span-2"><dt className="text-text-muted">Băng thông</dt><dd className="font-bold">{plan.bandwidth}</dd></div></dl>
                <p className="mt-5 text-lg font-extrabold text-blue-primary">{price ? formatCurrency(price) : "Liên hệ"} <span className="text-xs font-normal text-text-muted">{firstCycle ? `/ ${formatBillingCycle(firstCycle)}` : ""}</span></p>
                <button type="button" disabled={!price || osImages.length === 0} onClick={() => setSelectedPlan(plan)} className="mt-4 h-10 rounded-md bg-blue-primary px-4 text-sm font-bold text-white disabled:opacity-50">{osImages.length === 0 ? "Chưa có hệ điều hành" : "Đăng ký VPS"}</button>
              </article>;
            })}
          </div>
        )}
      </div>
      {selectedPlan && <VpsCheckout plan={selectedPlan} osImages={osImages} onClose={() => setSelectedPlan(null)} />}
    </main>
  );
}
