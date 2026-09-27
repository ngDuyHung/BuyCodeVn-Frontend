import AdminPermissionGate from "@/components/admin/AdminPermissionGate";
import AdminServiceOperations from "@/components/admin/AdminServiceOperations";

export default function AdminServicesPage() {
  return <AdminPermissionGate permission="services.view"><AdminServiceOperations /></AdminPermissionGate>;
}
