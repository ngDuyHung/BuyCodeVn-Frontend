import AdminPermissionGate from "@/components/admin/AdminPermissionGate";
import AdminWithdrawalDirectory from "@/components/admin/AdminWithdrawalDirectory";

export default function AdminWithdrawalsPage() {
  return <AdminPermissionGate permission="finance.view"><AdminWithdrawalDirectory /></AdminPermissionGate>;
}
