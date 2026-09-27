import AdminPermissionGate from "@/components/admin/AdminPermissionGate";
import AdminPermissionDirectory from "@/components/admin/AdminPermissionDirectory";

export default function AdminPermissionsPage() {
  return <AdminPermissionGate permission="roles.manage"><AdminPermissionDirectory /></AdminPermissionGate>;
}
