import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import type { Metadata } from "next";
import "./globals.css";
import AuthSessionProvider from "@/components/providers/AuthSessionProvider";
import NetworkStatus from "@/components/providers/NetworkStatus";
import SiteCodeInjector from "@/components/providers/SiteCodeInjector";
import { getSiteSettings } from "@/services/server/siteSettingService";
import { Suspense } from "react";

async function SiteCustomCode() {
  const settings = await getSiteSettings();
  return <SiteCodeInjector headerHtml={settings.site_header_html} footerHtml={settings.site_footer_html} />;
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: settings.site_name,
    applicationName: settings.site_short_name,
    description: settings.site_description,
    keywords: settings.site_keywords.split(",").map((keyword) => keyword.trim()).filter(Boolean),
    icons: settings.favicon_url ? { icon: settings.favicon_url, shortcut: settings.favicon_url } : undefined,
    openGraph: { title: settings.site_name, description: settings.site_description, siteName: settings.site_name, locale: "vi_VN", type: "website" },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
        />
      </head>
      <body className="min-h-screen bg-white font-sans leading-relaxed">
        <NetworkStatus />
        <AuthSessionProvider />
        {children}
        <ToastContainer position="bottom-right" autoClose={3000} />
        <Suspense fallback={null}><SiteCustomCode /></Suspense>
      </body>
    </html>
  );
}
