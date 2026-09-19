import Footer from "@/components/client/layout/Footer";
import Header from "@/components/client/layout/Header";
import TopBar from "@/components/client/layout/TopBar";

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen flex-col">
      <TopBar />
      <Header />
      <main className="flex flex-1 bg-gray-light">{children}</main>
      <Footer />
    </div>
  );
}
