import Footer from "@/components/client/layout/Footer";
import Header from "@/components/client/layout/Header";
import TopBar from "@/components/client/layout/TopBar";
import { getNavigationMenus } from "@/services/server/navigationService";
import { getSiteSettings } from "@/services/server/siteSettingService";

export default async function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [menus, settings] = await Promise.all([getNavigationMenus(), getSiteSettings()]);
  return (
    <div className="flex min-h-screen flex-col">
      <TopBar settings={settings} />
      <Header items={menus?.header} settings={settings} />
      <main className="flex flex-1 bg-gray-light">{children}</main>
      <Footer items={menus?.footer} settings={settings} />
    </div>
  );
}
