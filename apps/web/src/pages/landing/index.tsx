import { LandingNav, HeroSection } from "./components/hero-section";
import { StatsSection, FeaturesSection } from "./components/features-section";
import { CourseShowcaseSection, ProgressSection } from "./components/course-showcase";
import { TestimonialsSection, CtaSection, LandingFooter } from "./components/cta-section";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <LandingNav />
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <CourseShowcaseSection />
      <ProgressSection />
      <TestimonialsSection />
      <CtaSection />
      <LandingFooter />
    </div>
  );
}
