import {
  ChatbotWidget,
  FeaturedCities,
  HeroSection,
  LandingFooter,
  PropertyCategories,
  PropertySearch,
  PromoBanners,
  RecommendedProperties,
} from '@/features/landing/components'
import { CustomerAgentBanner } from '@/features/customer/components/CustomerAgentBanner'
import { CustomerHeader } from '@/features/customer/components/CustomerHeader'

export default function CustomerHomePage() {
  return (
    <div className="min-h-screen overflow-hidden bg-bg-surface">
      <CustomerHeader />
      <main>
        <HeroSection showExploreButton={false} />
        <PropertySearch />
        <PromoBanners />
        <PropertyCategories />
        <FeaturedCities />
        <RecommendedProperties customerView />
        <CustomerAgentBanner />
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
