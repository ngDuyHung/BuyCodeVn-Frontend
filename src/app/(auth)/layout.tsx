import GuestOnlyBoundary from "@/components/auth/GuestOnlyBoundary";
import { AuthFooter, AuthHeader } from "@/components/auth/AuthSiteChrome";
import { FooterSkeleton, HeaderSkeleton } from "@/components/client/layout/ClientChromeSkeletons";
import { Suspense } from "react";

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen flex-col">
      <Suspense fallback={<HeaderSkeleton />}><AuthHeader /></Suspense>
      <main className="flex flex-1 bg-gray-light"><GuestOnlyBoundary>{children}</GuestOnlyBoundary></main>
      <Suspense fallback={<FooterSkeleton />}><AuthFooter /></Suspense>
    </div>
  );
}
