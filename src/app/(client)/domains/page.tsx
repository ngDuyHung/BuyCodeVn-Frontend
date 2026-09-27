import type { Metadata } from "next";
import { Suspense } from "react";
import DomainStorefront from "@/components/client/domains/DomainStorefront";
import LoadingState from "@/components/shared/LoadingState";

export const metadata: Metadata = {
  title: "Tên miền | BUYCODE.VN",
  description: "Kiểm tra và đăng ký tên miền theo bảng giá hiện hành.",
};

export default function DomainsPage() {
  return (
    <Suspense fallback={<LoadingState label="Đang tải trang tên miền..." />}>
      <DomainStorefront />
    </Suspense>
  );
}
