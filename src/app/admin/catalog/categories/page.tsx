import AdminCategoryDirectory from "@/components/admin/AdminCategoryDirectory";
import AdminPermissionGate from "@/components/admin/AdminPermissionGate";

export default function AdminCategoriesPage() {
  return <AdminPermissionGate permission="catalog.view"><AdminCategoryDirectory /></AdminPermissionGate>;
}
