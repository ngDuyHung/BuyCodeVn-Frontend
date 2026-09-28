import type { ReactNode } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { getSiteSettings } from "@/services/server/siteSettingService";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const settings = await getSiteSettings();
  return <AdminShell settings={settings}>{children}</AdminShell>;
}
