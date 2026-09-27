import { Suspense } from "react";
import AdminPermissionGate from "@/components/admin/AdminPermissionGate";
import AdminProductDirectory from "@/components/admin/AdminProductDirectory";
import LoadingState from "@/components/shared/LoadingState";

export default function AdminProductsPage() {
  return <AdminPermissionGate permission="catalog.view"><Suspense fallback={<LoadingState label="Đang tải sản phẩm..." />}><AdminProductDirectory /></Suspense></AdminPermissionGate>;
}
