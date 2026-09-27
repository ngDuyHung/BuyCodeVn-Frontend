import type { Metadata } from "next";
import WithdrawalForm from "@/components/client/finance/WithdrawalForm";

export const metadata: Metadata = { title: "Rút tiền | BUYCODE.VN" };

export default function WithdrawPage() {
  return <WithdrawalForm />;
}
