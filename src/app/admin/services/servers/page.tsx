import { Suspense } from "react";
import AdminPermissionGate from "@/components/admin/AdminPermissionGate";
import AdminServerDirectory from "@/components/admin/AdminServerDirectory";
import LoadingState from "@/components/shared/LoadingState";

export default function AdminServersPage() {
  return <AdminPermissionGate permission="services.view"><Suspense fallback={<LoadingState label="Đang tải máy chủ..." />}><AdminServerDirectory /></Suspense></AdminPermissionGate>;
}
