import Footer from "@/components/client/layout/Footer";
import Header from "@/components/client/layout/Header";
import TopBar from "@/components/client/layout/TopBar";
import { FooterSkeleton, HeaderSkeleton } from "@/components/client/layout/ClientChromeSkeletons";
import { getNavigationMenus } from "@/services/server/navigationService";
import { getSiteSettings } from "@/services/server/siteSettingService";
import { Suspense } from "react";

async function ClientHeader() {
  const [menus, settings] = await Promise.all([getNavigationMenus(), getSiteSettings()]);
  return <><TopBar settings={settings} /><Header items={menus?.header} settings={settings} /></>;
}

async function ClientFooter() {
  const [menus, settings] = await Promise.all([getNavigationMenus(), getSiteSettings()]);
  return <Footer items={menus?.footer} settings={settings} />;
}

export default function ClientLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen flex-col">
      <Suspense fallback={<HeaderSkeleton />}><ClientHeader /></Suspense>
      <main className="flex-1">{children}</main>
      <Suspense fallback={<FooterSkeleton />}><ClientFooter /></Suspense>
    </div>
  );
}
