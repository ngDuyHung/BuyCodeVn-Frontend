import HeroSection from "@/components/client/features/HeroSection";
import SearchBar from "@/components/client/features/CustomDevBar";
import ServicesSection from "@/components/client/features/ServicesSection";
import StatsBar from "@/components/client/features/StatsBar";
import FeaturedProducts from "@/components/client/features/FeaturedProducts";
import WhyChooseUs from "@/components/client/features/WhyChooseUs";
import HostingPlans from "@/components/client/features/HostingPlans";
import VpsPlans from "@/components/client/features/VpsPlans";
import BlogPosts from "@/components/client/features/BlogPosts";
import Partners from "@/components/client/features/Partners";
import Newsletter from "@/components/client/features/Newsletter";

export default function Home() {
  return (
    <>
      <HeroSection />
      <SearchBar />
      <ServicesSection />
      <StatsBar />
      <FeaturedProducts />
      <WhyChooseUs />
      <HostingPlans />
      <VpsPlans />
      <BlogPosts />
      <Partners />
      <Newsletter />
    </>
  );
}