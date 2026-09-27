import AdminBankAccountDirectory from "@/components/admin/AdminBankAccountDirectory";
import AdminPermissionGate from "@/components/admin/AdminPermissionGate";

export default function AdminBankAccountsPage() {
  return <AdminPermissionGate permission="bank_accounts.manage"><AdminBankAccountDirectory /></AdminPermissionGate>;
}
