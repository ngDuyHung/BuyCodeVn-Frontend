import HeroSection from "@/components/client/features/HeroSection";
import dynamic from "next/dynamic";
import SearchBar from "@/components/client/features/CustomDevBar";
import ServicesSection from "@/components/client/features/ServicesSection";

const FeaturedProducts = dynamic(
  () => import("@/components/client/features/FeaturedProducts"),
  { loading: () => <SectionSkeleton /> },
);
const HostingPlans = dynamic(
  () => import("@/components/client/features/HostingPlans"),
  { loading: () => <SectionSkeleton /> },
);

function SectionSkeleton() {
  return (
    <div className="mx-auto min-h-72 max-w-[1350px] animate-pulse px-5 py-12" aria-hidden="true">
      <div className="h-6 w-48 rounded bg-gray-200" />
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => <div key={index} className="h-48 rounded-lg bg-gray-100" />)}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <>
      <HeroSection />
      <SearchBar />
      <ServicesSection />
      <FeaturedProducts />
      <HostingPlans />
    </>
  );
}
