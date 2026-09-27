import { Suspense } from "react";
import AdminHostingPlanDirectory from "@/components/admin/AdminHostingPlanDirectory";
import AdminPermissionGate from "@/components/admin/AdminPermissionGate";
import LoadingState from "@/components/shared/LoadingState";

export default function AdminHostingPlansPage() {
  return <AdminPermissionGate permission="services.view"><Suspense fallback={<LoadingState label="Đang tải gói hosting..." />}><AdminHostingPlanDirectory /></Suspense></AdminPermissionGate>;
}
