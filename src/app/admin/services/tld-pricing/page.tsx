import { Suspense } from "react";
import AdminPermissionGate from "@/components/admin/AdminPermissionGate";
import AdminTldPricingDirectory from "@/components/admin/AdminTldPricingDirectory";
import LoadingState from "@/components/shared/LoadingState";

export default function AdminTldPricingPage() {
  return <AdminPermissionGate permission="services.view"><Suspense fallback={<LoadingState label="Đang tải bảng giá TLD..." />}><AdminTldPricingDirectory /></Suspense></AdminPermissionGate>;
}
