import AdminPermissionGate from "@/components/admin/AdminPermissionGate";
import AdminSiteSettingForm from "@/components/admin/AdminSiteSettingForm";

export default function AdminGeneralSettingPage() {
  return <AdminPermissionGate permission="settings.view"><AdminSiteSettingForm /></AdminPermissionGate>;
}
