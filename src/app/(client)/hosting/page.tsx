import type { Metadata } from "next";
import { Suspense } from "react";
import HostingStorefront from "@/components/client/hosting/HostingStorefront";
import LoadingState from "@/components/shared/LoadingState";

export const metadata: Metadata = {
  title: "Hosting | BUYCODE.VN",
  description: "So sánh và đăng ký các gói hosting đang hoạt động.",
};

export default function HostingPage() {
  return (
    <Suspense fallback={<LoadingState label="Đang tải gói hosting..." />}>
      <HostingStorefront />
    </Suspense>
  );
}
