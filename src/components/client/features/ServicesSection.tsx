import Image from "next/image";
import Link from "next/link";

const services = [
  { title: "Mã nguồn", image: "/images/service-source-code.webp", href: "/source-code", action: "Xem mã nguồn", description: "Kho mã nguồn chất lượng cao, dễ tùy biến và triển khai.", features: ["Đầy đủ tính năng", "Cập nhật thường xuyên", "Bảo hành và hỗ trợ"] },
  { title: "Thuê website", image: "/images/service-website.webp", href: null, action: "Sắp ra mắt", description: "Website chuyên nghiệp, sẵn sàng sử dụng và tiết kiệm chi phí.", features: ["Giao diện chuẩn SEO", "Bàn giao nhanh chóng", "Hỗ trợ trọn đời"] },
  { title: "Hosting", image: "/images/service-hosting.webp", href: "/hosting", action: "Xem hosting", description: "Hosting tốc độ cao, ổn định và bảo mật cho mọi nhu cầu.", features: ["Uptime 99,9%", "Bảo mật nhiều lớp", "Hỗ trợ 24/7"] },
  { title: "VPS / Server", image: "/images/service-vps.webp", href: "/vps", action: "Xem gói VPS", description: "Máy chủ mạnh mẽ, linh hoạt với toàn quyền quản trị.", features: ["Cấu hình đa dạng", "Hiệu năng mạnh mẽ", "Toàn quyền quản trị"] },
] as const;

export default function ServicesSection() {
  return (
    <section aria-labelledby="services-title" className="bg-white py-10 sm:py-12 lg:py-16">
      <div className="mx-auto max-w-[1350px] px-4 md:px-5">
        <header className="mb-7 text-center sm:mb-9">
          <p className="text-xs font-bold uppercase text-[#14827d]">Giải pháp toàn diện</p>
          <h2 id="services-title" className="mt-2 text-2xl font-extrabold text-[#183642] sm:text-3xl">Dịch vụ của chúng tôi</h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-[#64757c] sm:text-[15px]">Đa dạng dịch vụ đáp ứng nhu cầu của cá nhân và doanh nghiệp.</p>
        </header>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {services.map((service) => <article key={service.title} className="group flex min-w-0 flex-col items-center rounded-lg border border-[#dfe7e9] bg-white p-3 text-center shadow-[0_3px_14px_rgba(18,47,58,.05)] transition duration-300 hover:-translate-y-1 hover:border-[#a9ceca] hover:shadow-[0_12px_28px_rgba(18,47,58,.1)] sm:p-5 lg:p-6">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md bg-[#f2f7f6] sm:aspect-[16/11]"><Image src={service.image} alt="" fill sizes="(max-width: 639px) 42vw, (max-width: 1023px) 45vw, 300px" className="object-contain p-1 transition-transform duration-300 group-hover:scale-[1.04] sm:p-2" /></div>
            <h3 className="mt-3 text-sm font-bold text-[#183642] sm:text-lg">{service.title}</h3>
            <p className="mt-2 hidden min-h-12 text-sm leading-6 text-[#64757c] sm:line-clamp-2">{service.description}</p>
            <ul className="mt-4 hidden w-full space-y-2 border-t border-[#e8edef] pt-4 text-left text-sm text-[#405860] lg:block">
              {service.features.map((feature) => <li key={feature} className="flex items-center gap-2"><i className="fas fa-check-circle text-xs text-[#14827d]" aria-hidden="true" /><span>{feature}</span></li>)}
            </ul>
            {service.href ? <Link href={service.href} className="mt-4 inline-flex min-h-9 w-full items-center justify-center gap-1.5 rounded-md bg-[#116966] px-2 text-xs font-bold text-white transition hover:bg-[#0d5957] sm:min-h-10 sm:text-sm">{service.action}<i className="fas fa-arrow-right text-[9px]" aria-hidden="true" /></Link> : <span className="mt-4 inline-flex min-h-9 w-full items-center justify-center rounded-md border border-[#cbd6d8] bg-[#f4f6f7] px-2 text-xs font-semibold text-[#74858c] sm:min-h-10 sm:text-sm">{service.action}</span>}
          </article>)}
        </div>
      </div>
    </section>
  );
}
