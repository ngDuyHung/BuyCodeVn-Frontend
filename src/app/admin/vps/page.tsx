import AdminPermissionGate from "@/components/admin/AdminPermissionGate";
import AdminVpsConsole from "@/components/admin/AdminVpsConsole";

export default function AdminVpsPage() {
  return <AdminPermissionGate permission="services.view"><AdminVpsConsole /></AdminPermissionGate>;
}
