const blocks = (count: number) => Array.from({ length: count }, (_, index) => index);

export function HeroSkeleton() {
  return (
    <section className="min-h-[500px] bg-[#f5f8f8] sm:min-h-[540px] lg:min-h-[570px]" aria-label="Đang tải nội dung nổi bật" role="status">
      <span className="sr-only">Đang tải nội dung nổi bật...</span>
      <div className="mx-auto flex min-h-[500px] max-w-[1350px] flex-col items-center gap-8 px-5 py-9 sm:min-h-[540px] lg:min-h-[570px] lg:flex-row lg:py-12">
        <div className="w-full lg:w-[48%]">
          <div className="skeleton-shimmer h-7 w-52 rounded" />
          <div className="skeleton-shimmer mt-6 h-12 w-4/5 rounded sm:h-16" />
          <div className="skeleton-shimmer mt-3 h-12 w-full max-w-xl rounded" />
          <div className="mt-7 flex gap-3"><div className="skeleton-shimmer h-11 w-36 rounded-md" /><div className="skeleton-shimmer h-11 w-36 rounded-md" /></div>
          <div className="mt-8 grid max-w-xl grid-cols-2 gap-3">{blocks(4).map((index) => <div key={index} className="flex items-center gap-2"><div className="skeleton-shimmer size-8 shrink-0 rounded-full" /><div className="skeleton-shimmer h-4 w-28 rounded" /></div>)}</div>
        </div>
        <div className="skeleton-shimmer h-[260px] w-full rounded-lg sm:h-[340px] lg:h-[420px] lg:min-w-0 lg:flex-1" />
      </div>
    </section>
  );
}

export function HomeSectionSkeleton() {
  return (
    <section className="border-y border-[#e8edef] bg-[#f6f9f9] py-12" aria-label="Đang tải danh sách" role="status">
      <span className="sr-only">Đang tải danh sách...</span>
      <div className="mx-auto max-w-[1350px] px-5">
        <div className="skeleton-shimmer h-3 w-36 rounded" />
        <div className="skeleton-shimmer mt-3 h-8 w-60 rounded" />
        <div className="skeleton-shimmer mt-3 h-4 w-full max-w-xl rounded" />
        <div className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {blocks(4).map((index) => <div key={index} className="overflow-hidden rounded-lg border border-[#dce3e5] bg-white"><div className="skeleton-shimmer aspect-[16/9]" /><div className="space-y-3 p-4"><div className="skeleton-shimmer h-3 w-24 rounded" /><div className="skeleton-shimmer h-5 w-4/5 rounded" /><div className="skeleton-shimmer h-10 w-full rounded" /></div></div>)}
        </div>
      </div>
    </section>
  );
}

export function PageContentSkeleton() {
  return <main className="min-h-[65vh] bg-[#f7f9f9] py-10" role="status" aria-label="Đang chuẩn bị nội dung"><span className="sr-only">Đang chuẩn bị nội dung...</span><div className="mx-auto max-w-[1250px] px-5"><div className="skeleton-shimmer h-4 w-48 rounded" /><div className="skeleton-shimmer mt-6 h-10 w-72 max-w-full rounded" /><div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]"><div className="skeleton-shimmer min-h-80 rounded-lg" /><div className="space-y-4"><div className="skeleton-shimmer h-28 rounded-lg" /><div className="skeleton-shimmer h-48 rounded-lg" /></div></div></div></main>;
}
