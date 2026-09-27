import { Suspense } from "react";
import AdminPermissionGate from "@/components/admin/AdminPermissionGate";
import AdminUserDirectory from "@/components/admin/AdminUserDirectory";
import LoadingState from "@/components/shared/LoadingState";

export default function AdminUsersPage() {
  return <AdminPermissionGate permission="users.view"><Suspense fallback={<LoadingState label="Đang tải người dùng..." />}><AdminUserDirectory /></Suspense></AdminPermissionGate>;
}
