import type { Metadata } from "next";
import WithdrawalHistory from "@/components/client/finance/WithdrawalHistory";

export const metadata: Metadata = { title: "Lịch sử rút tiền | BUYCODE.VN" };

export default function WithdrawalsPage() {
  return <WithdrawalHistory />;
}
