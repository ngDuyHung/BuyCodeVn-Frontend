import AdminPermissionGate from "@/components/admin/AdminPermissionGate";
import AdminPresentationDirectory from "@/components/admin/AdminPresentationDirectory";

export default function AdminPresentationPage() {
  return <AdminPermissionGate permission="settings.view"><AdminPresentationDirectory /></AdminPermissionGate>;
}
