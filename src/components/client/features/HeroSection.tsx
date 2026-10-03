"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { PresentationCta, PresentationSlide } from "@/types/presentation";

const fallbackSlide: PresentationSlide = {
  id: 0,
  placement: "home_hero",
  eyebrow: "NỀN TẢNG UY TÍN HÀNG ĐẦU VIỆT NAM",
  title: "BUYCODE.VN",
  description: "Mã nguồn, hosting, VPS và tên miền trong một nền tảng quản lý tập trung, thanh toán trực tiếp bằng số dư ví.",
  desktop_image_url: "/images/banner_hero.webp",
  mobile_image_url: null,
  image_alt: "Giao diện dịch vụ BUYCODE.VN",
  primary_cta: { label: "Khám phá ngay", url: "/source-code" },
  secondary_cta: { label: "Xem gói hosting", url: "/hosting" },
  highlights: [
    { icon: "fa-award", label: "Chất lượng đảm bảo" },
    { icon: "fa-tachometer-alt", label: "Tốc độ vượt trội" },
    { icon: "fa-shield-alt", label: "Bảo mật an toàn" },
    { icon: "fa-headset", label: "Hỗ trợ 24/7" },
  ],
  layout: "split",
  content_alignment: "left",
  theme: "light",
  overlay_opacity: 20,
};

function ActionLink({ action, primary, dark }: { action: PresentationCta; primary?: boolean; dark: boolean }) {
  const className = primary
    ? "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--color-blue-primary)] px-5 py-2.5 text-sm font-bold text-white shadow-[0_8px_22px_rgba(17,105,102,.24)] transition hover:bg-[var(--color-blue-primary-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-blue-primary)]"
    : `inline-flex min-h-11 items-center justify-center rounded-md border px-5 py-2.5 text-sm font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 ${dark ? "border-white/55 bg-black/15 text-white hover:bg-white/15 focus-visible:outline-white" : "border-[#b8c8cc] bg-white text-[#174452] hover:border-[var(--color-blue-primary)] hover:text-[var(--color-blue-primary)] focus-visible:outline-[var(--color-blue-primary)]"}`;
  const content = <>{action.label}{primary && <i className="fas fa-arrow-right text-xs" aria-hidden="true" />}</>;
  return action.url.startsWith("/") ? <Link href={action.url} className={className}>{content}</Link> : <a href={action.url} className={className}>{content}</a>;
}

function SlideImage({ slide, cover }: { slide: PresentationSlide; cover?: boolean }) {
  return <picture className={cover ? "absolute inset-0" : "block h-full w-full"}>
    {slide.mobile_image_url && <source media="(max-width: 639px)" srcSet={slide.mobile_image_url} />}
    {/* Slide URLs are managed at runtime and cannot be statically allowlisted for next/image. */}
    <img src={slide.desktop_image_url} alt={slide.image_alt} fetchPriority="high" className={cover ? "h-full w-full object-cover" : "h-full w-full object-contain"} />
  </picture>;
}

export default function HeroSection({ slides = [], preview = false }: { slides?: PresentationSlide[]; preview?: boolean }) {
  const items = slides.length ? slides : [fallbackSlide];
  const [activeIndex, setActiveIndex] = useState(0);
  const safeActiveIndex = activeIndex % items.length;
  const activeSlide = items[safeActiveIndex] ?? fallbackSlide;
  const highlights = activeSlide.highlights ?? [];

  useEffect(() => {
    if (items.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const interval = window.setInterval(() => setActiveIndex((current) => (current + 1) % items.length), 7000);
    return () => window.clearInterval(interval);
  }, [items.length]);

  const dark = activeSlide.theme === "dark";
  const alignment = activeSlide.content_alignment;
  const alignClass = alignment === "center" ? "text-center items-center" : alignment === "right" ? "text-right items-end" : "text-left items-start";
  const actionsClass = alignment === "center" ? "justify-center" : alignment === "right" ? "justify-end" : "justify-start";
  const overlay = activeSlide.overlay_opacity / 100;
  const select = (index: number) => setActiveIndex((index + items.length) % items.length);

  const coverHeight = preview ? "min-h-[360px]" : "min-h-[500px] sm:min-h-[540px] lg:min-h-[570px]";
  const contentHeight = preview ? "min-h-[360px] px-5 py-8" : "min-h-[500px] px-5 py-16 sm:min-h-[540px] lg:min-h-[570px] lg:py-12";
  return <section aria-roledescription="carousel" aria-label={preview ? "Xem trước nội dung nổi bật" : "Nội dung nổi bật"} className={`relative isolate overflow-hidden ${activeSlide.layout === "cover" ? coverHeight : dark ? "bg-[#102c35]" : "bg-[#f5f8f8]"}`}>
    {activeSlide.layout === "cover" && <><SlideImage slide={activeSlide} cover /><div className="absolute inset-0" style={{ backgroundColor: `rgba(5, 20, 27, ${overlay})` }} /></>}
    {activeSlide.layout === "split" && <div className="absolute inset-0 opacity-35 [background-image:radial-gradient(#91a5aa_1px,transparent_1px)] [background-size:24px_24px]" aria-hidden="true" />}
    <div className={`relative z-[1] mx-auto flex max-w-[1350px] ${activeSlide.layout === "cover" ? `${contentHeight} ${alignment === "center" ? "justify-center" : alignment === "right" ? "justify-end" : "justify-start"}` : preview ? "min-h-[360px] items-center gap-5 px-5 py-7" : "flex-col items-center gap-8 px-5 py-9 lg:min-h-[500px] lg:flex-row lg:gap-8 lg:py-12"}`}>
      <div className={`flex flex-col ${alignClass} ${activeSlide.layout === "cover" ? "w-full max-w-2xl justify-center" : "w-full lg:w-[48%]"}`}>
        {activeSlide.eyebrow && <span className={`mb-5 inline-flex max-w-full rounded px-3 py-1.5 text-xs font-bold uppercase ${dark || activeSlide.layout === "cover" ? "bg-white/15 text-white ring-1 ring-white/25" : "bg-[var(--color-blue-primary-soft)] text-blue-primary"}`}>{activeSlide.eyebrow}</span>}
        <h1 className={`max-w-[760px] font-extrabold leading-[1.12] ${preview ? "text-3xl" : "text-4xl sm:text-5xl lg:text-[56px]"} ${dark || activeSlide.layout === "cover" ? "text-white" : "text-[#112f3a]"}`}>{activeSlide.title}</h1>
        {activeSlide.description && <p className={`mt-5 max-w-2xl text-base leading-7 sm:text-lg ${dark || activeSlide.layout === "cover" ? "text-white/85" : "text-[#526870]"}`}>{activeSlide.description}</p>}
        {(activeSlide.primary_cta || activeSlide.secondary_cta) && <div className={`mt-8 flex flex-wrap gap-3 ${actionsClass}`}>{activeSlide.primary_cta && <ActionLink action={activeSlide.primary_cta} primary dark={dark || activeSlide.layout === "cover"} />}{activeSlide.secondary_cta && <ActionLink action={activeSlide.secondary_cta} dark={dark || activeSlide.layout === "cover"} />}</div>}
        {highlights.length > 0 && <ul aria-label="Điểm nổi bật" className={`mt-8 grid w-full max-w-2xl grid-cols-2 gap-x-4 gap-y-3 ${alignment === "right" ? "self-end" : alignment === "center" ? "self-center" : "self-start"}`}>
          {highlights.map((highlight, index) => <li key={`${highlight.icon}-${highlight.label}-${index}`} className={`flex min-w-0 items-center gap-2 text-sm font-semibold ${alignment === "right" ? "justify-end" : alignment === "center" ? "justify-center" : "justify-start"} ${dark || activeSlide.layout === "cover" ? "text-white/90" : "text-[#35535d]"}`}>
            <span className={`flex size-8 shrink-0 items-center justify-center rounded-full ${dark || activeSlide.layout === "cover" ? "bg-white/15 text-white" : "bg-[var(--color-blue-primary-soft)] text-blue-primary"}`}><i className={`fas ${highlight.icon}`} aria-hidden="true" /></span>
            <span>{highlight.label}</span>
          </li>)}
        </ul>}
      </div>
      {activeSlide.layout === "split" && <div className={preview ? "h-[260px] min-w-0 flex-1" : "h-[260px] w-full sm:h-[340px] lg:h-[420px] lg:min-w-0 lg:flex-1"}><SlideImage slide={activeSlide} /></div>}
    </div>
    {items.length > 1 && <div className="absolute inset-x-0 bottom-4 z-[2] mx-auto flex max-w-[1350px] items-center justify-center gap-3 px-5 lg:justify-end">
      <button type="button" aria-label="Slide trước" onClick={() => select(safeActiveIndex - 1)} className={`size-9 rounded-full border ${dark || activeSlide.layout === "cover" ? "border-white/40 bg-black/20 text-white" : "border-[#b8c8cc] bg-white text-[#174452]"}`}><i className="fas fa-chevron-left text-xs" aria-hidden="true" /></button>
      <div className="flex gap-2">{items.map((slide, index) => <button key={slide.id} type="button" aria-label={`Hiển thị slide ${index + 1}`} aria-current={index === safeActiveIndex ? "true" : undefined} onClick={() => select(index)} className={`h-2.5 rounded-full transition-[width,background-color] ${index === safeActiveIndex ? "w-7 bg-blue-primary" : dark || activeSlide.layout === "cover" ? "w-2.5 bg-white/60" : "w-2.5 bg-[#9aabad]"}`} />)}</div>
      <button type="button" aria-label="Slide tiếp theo" onClick={() => select(safeActiveIndex + 1)} className={`size-9 rounded-full border ${dark || activeSlide.layout === "cover" ? "border-white/40 bg-black/20 text-white" : "border-[#b8c8cc] bg-white text-[#174452]"}`}><i className="fas fa-chevron-right text-xs" aria-hidden="true" /></button>
    </div>}
  </section>;
}
