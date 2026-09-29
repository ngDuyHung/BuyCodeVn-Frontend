export function HeaderSkeleton() {
  return <div role="status" aria-label="Đang tải thanh điều hướng"><span className="sr-only">Đang tải thanh điều hướng...</span><div className="h-8 bg-[#f39a31]" /><div className="border-b border-[#e2e8ea] bg-white"><div className="mx-auto flex h-[58px] max-w-[1350px] items-center justify-between gap-6 px-5"><div className="skeleton-shimmer h-9 w-32 rounded" /><div className="hidden flex-1 justify-center gap-3 md:flex">{Array.from({ length: 5 }, (_, index) => <div key={index} className="skeleton-shimmer h-8 w-20 rounded" />)}</div><div className="skeleton-shimmer h-9 w-24 rounded" /></div></div></div>;
}

export function FooterSkeleton() {
  return <div className="bg-[#102d46] py-10" role="status" aria-label="Đang tải chân trang"><span className="sr-only">Đang tải chân trang...</span><div className="mx-auto grid max-w-[1350px] grid-cols-2 gap-8 px-5 lg:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <div key={index} className="space-y-3"><div className="h-4 w-28 rounded bg-white/15" /><div className="h-3 w-full rounded bg-white/10" /><div className="h-3 w-3/4 rounded bg-white/10" /></div>)}</div></div>;
}
