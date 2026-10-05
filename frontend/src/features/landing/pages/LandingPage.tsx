import {
  ChatbotWidget,
  ContactBanner,
  FeaturedCities,
  HeroSection,
  LandingFooter,
  LandingHeader,
  PropertyCategories,
  PropertySearch,
  PromoBanners,
  RecommendedProperties,
} from '@/features/landing/components'

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-hidden bg-bg-surface">
      <LandingHeader />
      <main>
        <HeroSection />
        <PropertySearch />
        <PromoBanners />
        <PropertyCategories />
        <FeaturedCities />
        <RecommendedProperties />
        <ContactBanner />
      </main>
      <div className="-mt-landing-chatbot-overlap">
        <ChatbotWidget />
      </div>
      <div className="mt-landing-footer-gap">
        <LandingFooter />
      </div>
    </div>
  )
}
