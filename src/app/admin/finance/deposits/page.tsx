import AdminDepositDirectory from "@/components/admin/AdminDepositDirectory";
import AdminPermissionGate from "@/components/admin/AdminPermissionGate";

export default function AdminDepositsPage() {
  return <AdminPermissionGate permission="finance.view"><AdminDepositDirectory /></AdminPermissionGate>;
}
