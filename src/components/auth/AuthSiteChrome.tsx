import Footer from "@/components/client/layout/Footer";
import Header from "@/components/client/layout/Header";
import TopBar from "@/components/client/layout/TopBar";
import { getNavigationMenus } from "@/services/server/navigationService";
import { getSiteSettings } from "@/services/server/siteSettingService";

export async function AuthHeader() {
  const [menus, settings] = await Promise.all([getNavigationMenus(), getSiteSettings()]);
  return <><TopBar settings={settings} /><Header items={menus?.header} settings={settings} /></>;
}

export async function AuthFooter() {
  const [menus, settings] = await Promise.all([getNavigationMenus(), getSiteSettings()]);
  return <Footer items={menus?.footer} settings={settings} />;
}
