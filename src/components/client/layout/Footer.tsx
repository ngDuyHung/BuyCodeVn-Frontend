import Image from "next/image";
import Link from "next/link";

const serviceLinks = [
  { href: "/source-code", label: "Mã nguồn" },
  { href: "/hosting", label: "Hosting" },
  { href: "/vps", label: "VPS" },
  { href: "/domains", label: "Tên miền" },
];

const accountLinks = [
  { href: "/user", label: "Tổng quan tài khoản" },
  { href: "/user/orders", label: "Lịch sử đơn hàng" },
  { href: "/user/deposit", label: "Nạp tiền" },
  { href: "/user/withdrawals", label: "Lịch sử rút tiền" },
];

export default function Footer() {
  return (
    <footer className="bg-blue-dark text-[#cbd5e1]">
      <div className="mx-auto grid max-w-[1350px] grid-cols-1 gap-8 px-4 py-9 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1.4fr] lg:px-5 lg:py-12">
        <div>
          <Image src="/images/logoweb.png" alt="BUYCODE.VN" width={150} height={46} className="h-10 w-auto brightness-150" />
          <p className="mt-4 max-w-sm text-[13.5px] leading-7 text-[#94a3b8]">
            Nền tảng cung cấp mã nguồn, hosting và dịch vụ tên miền cho cá nhân, doanh nghiệp.
          </p>
        </div>
        <FooterLinks title="Dịch vụ" links={serviceLinks} />
        <FooterLinks title="Tài khoản" links={accountLinks} />
        <div>
          <h2 className="mb-4 text-sm font-bold uppercase text-[#e2e8f0]">Liên hệ</h2>
          <a href="mailto:support@buycode.vn" className="inline-flex items-center gap-2 text-sm text-[#94a3b8] hover:text-orange-main">
            <i className="fas fa-envelope text-orange-main" aria-hidden="true" /> support@buycode.vn
          </a>
          <p className="mt-3 flex items-center gap-2 text-sm text-[#94a3b8]">
            <i className="fas fa-clock text-orange-main" aria-hidden="true" /> Hỗ trợ trực tuyến
          </p>
        </div>
      </div>
      <div className="border-t border-white/10 py-5">
        <div className="mx-auto flex max-w-[1350px] flex-col gap-2 px-4 text-xs text-[#94a3b8] sm:flex-row sm:items-center sm:justify-between lg:px-5">
          <span>© {new Date().getFullYear()} BUYCODE.VN.</span>
          <span>Thanh toán qua số dư ví BUYCODE.VN</span>
        </div>
      </div>
    </footer>
  );
}

function FooterLinks({ title, links }: { title: string; links: Array<{ href: string; label: string }> }) {
  return (
    <div>
      <h2 className="mb-4 text-sm font-bold uppercase text-[#e2e8f0]">{title}</h2>
      <ul className="space-y-2.5">
        {links.map((link) => (
          <li key={link.href}><Link href={link.href} className="text-[13.5px] text-[#94a3b8] hover:text-orange-main">{link.label}</Link></li>
        ))}
      </ul>
    </div>
  );
}
