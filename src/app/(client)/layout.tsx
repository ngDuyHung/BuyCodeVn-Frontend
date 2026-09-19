import Footer from "@/components/client/layout/Footer";
import Header from "@/components/client/layout/Header";
import TopBar from "@/components/client/layout/TopBar";

export default function ClientLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen flex-col">
      <TopBar />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
