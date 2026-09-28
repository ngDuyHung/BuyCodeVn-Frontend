import AdminNavigationDirectory from "@/components/admin/AdminNavigationDirectory";
import AdminPermissionGate from "@/components/admin/AdminPermissionGate";

export default function AdminNavigationPage() {
  return <AdminPermissionGate permission="settings.view"><AdminNavigationDirectory /></AdminPermissionGate>;
}
