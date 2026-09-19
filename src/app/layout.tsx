import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import type { Metadata } from "next";
import "./globals.css";
import AuthSessionProvider from "@/components/providers/AuthSessionProvider";

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
      <body className="min-h-screen bg-white font-sans leading-relaxed">
        <AuthSessionProvider />
        {children}
        <ToastContainer position="bottom-right" autoClose={3000} />
      </body>
    </html>
  );
}
