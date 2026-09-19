import type { Metadata } from "next";
import OrderHistory from "@/components/client/orders/OrderHistory";

export const metadata: Metadata = {
  title: "Lịch sử đơn hàng | BUYCODE.VN",
  description: "Theo dõi đơn hàng và tải lại sản phẩm đã mua.",
};

export default function OrdersPage() {
  return <OrderHistory />;
}
