"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import EmptyState from "@/components/shared/EmptyState";
import ErrorState from "@/components/shared/ErrorState";
import LoadingState from "@/components/shared/LoadingState";
import { normalizeApiError } from "@/lib/api-error";
import { vpsService } from "@/services/client/vpsService";
import type { VpsOsImage, VpsPlan } from "@/types/services";
import VpsCheckout from "./VpsCheckout";
import VpsPlanCard from "./VpsPlanCard";

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
          <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4 xl:gap-5">
            {plans.map((plan) => <VpsPlanCard key={plan.id} plan={plan} actionLabel={osImages.length === 0 ? "Chưa có hệ điều hành" : "Đăng ký VPS"} actionDisabled={osImages.length === 0} onAction={() => setSelectedPlan(plan)} />)}
          </div>
        )}
      </div>
      {selectedPlan && <VpsCheckout plan={selectedPlan} osImages={osImages} onClose={() => setSelectedPlan(null)} />}
    </main>
  );
}
