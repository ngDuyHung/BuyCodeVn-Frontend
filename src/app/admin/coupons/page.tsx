import AdminCouponDirectory from "@/components/admin/AdminCouponDirectory";
import AdminPermissionGate from "@/components/admin/AdminPermissionGate";

export default function AdminCouponsPage() {
  return <AdminPermissionGate permission="orders.manage"><AdminCouponDirectory /></AdminPermissionGate>;
}
