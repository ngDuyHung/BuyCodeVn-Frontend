import AdminOrderDirectory from "@/components/admin/AdminOrderDirectory";
import AdminPermissionGate from "@/components/admin/AdminPermissionGate";

export default function AdminOrdersPage() {
  return <AdminPermissionGate permission="orders.view"><AdminOrderDirectory /></AdminPermissionGate>;
}
