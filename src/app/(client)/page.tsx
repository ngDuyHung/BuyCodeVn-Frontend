import HeroSection from "@/components/client/features/HeroSection";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import SearchBar from "@/components/client/features/CustomDevBar";
import ServicesSection from "@/components/client/features/ServicesSection";
import { HeroSkeleton, HomeSectionSkeleton } from "@/components/client/features/HomeSkeletons";
import { getHomePresentationSlides } from "@/services/server/presentationService";

const FeaturedProducts = dynamic(
  () => import("@/components/client/features/FeaturedProducts"),
  { loading: () => <HomeSectionSkeleton /> },
);
const HostingPlans = dynamic(
  () => import("@/components/client/features/HostingPlans"),
  { loading: () => <HomeSectionSkeleton /> },
);
const HomeVpsPlans = dynamic(
  () => import("@/components/client/features/HomeVpsPlans"),
  { loading: () => <HomeSectionSkeleton /> },
);

async function HomeHero() {
  return <HeroSection slides={await getHomePresentationSlides()} />;
}

export default function Home() {
  return (
    <>
      <Suspense fallback={<HeroSkeleton />}><HomeHero /></Suspense>
      <SearchBar />
      <ServicesSection />
      <FeaturedProducts />
      <HostingPlans />
      <HomeVpsPlans />
    </>
  );
}
