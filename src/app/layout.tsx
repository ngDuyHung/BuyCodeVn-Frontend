import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import type { Metadata } from "next";
import "./globals.css";
import TopBar from "@/components/client/layout/TopBar";
import Header from "@/components/client/layout/Header";
import Footer from "@/components/client/layout/Footer"; // Import thêm Footer

export const metadata: Metadata = {
  title: "BUYCODE.VN - Giải pháp Mã Nguồn & Hạ Tầng Công Nghệ Toàn Diện",
  description:
    "Cung cấp mã nguồn chất lượng, cho thuê website, hosting, VPS/Server hiệu suất cao.",
};

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
      <body className="font-sans bg-white leading-relaxed flex flex-col min-h-screen">
        <TopBar />
        <Header />
        <main className="flex-1">{children}</main>
        {/* Container hiển thị thông báo lỗi/thành công */}
        <ToastContainer position="bottom-right" autoClose={3000} />
        <Footer /> {/* Thêm Footer vào đây */}
      </body>
    </html>
  );
}
