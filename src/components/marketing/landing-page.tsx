"use client";

import { MarketingNav } from "@/components/marketing/marketing-nav";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { LoadingScreen } from "@/components/marketing/loading-screen";
import { HeroSection } from "@/components/marketing/hero-section";
import { TrustedBySection } from "@/components/marketing/trusted-by-section";
import { FeaturesSection } from "@/components/marketing/features-section";
import { HowItWorksSection } from "@/components/marketing/how-it-works-section";
import { StatsSection } from "@/components/marketing/stats-section";
import { TestimonialsSection } from "@/components/marketing/testimonials-section";
import { ClubShowcaseSection } from "@/components/marketing/club-showcase-section";
import { OpportunitiesSection } from "@/components/marketing/opportunities-section";
import { WhyScholarNetSection } from "@/components/marketing/why-scholarnet-section";
import { FaqSection } from "@/components/marketing/faq-section";
import { ProjectsSection } from "@/components/marketing/projects-section";
import { ScreenshotsSection, DemoVideoSection } from "@/components/marketing/product-preview-section";
import { FinalCtaSection } from "@/components/marketing/final-cta-section";

export function LandingPage() {
  return (
    <>
      <LoadingScreen />
      <MarketingNav />
      <main>
        <HeroSection />
        <TrustedBySection />
        <FeaturesSection />
        <HowItWorksSection />
        <StatsSection />
        <ScreenshotsSection />
        <DemoVideoSection />
        <ProjectsSection />
        <TestimonialsSection />
        <ClubShowcaseSection />
        <OpportunitiesSection />
        <WhyScholarNetSection />
        <FaqSection />
        <FinalCtaSection />
      </main>
      <MarketingFooter />
    </>
  );
}
