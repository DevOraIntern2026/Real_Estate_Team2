import {
  FeaturedCities,
  HeroSection,
  LandingFooter,
  PropertyCategories,
  PropertySearch,
  PromoBanners,
  RecommendedProperties,
} from '@/features/landing/components'
import { ChatbotWidget } from '@/features/chatbot/components'
import { CustomerAgentBanner } from '@/features/customer/components/CustomerAgentBanner'
import { CustomerHeader } from '@/features/customer/components/CustomerHeader'
import { useLandingPage } from '@/features/landing/hooks/useLandingPage'

export default function CustomerHomePage() {
  const { data } = useLandingPage()

  return (
    <div className="min-h-screen overflow-hidden bg-bg-surface">
      <CustomerHeader />
      <main>
        <HeroSection showExploreButton={false} totalProperties={data?.totalProperties} />
        <PropertySearch filters={data?.filters} />
        <PromoBanners />
        <PropertyCategories propertyTypes={data?.filters.propertyTypes} />
        <FeaturedCities cities={data?.cities} />
        <RecommendedProperties properties={data?.discoverProperties} propertyTypes={data?.filters.propertyTypes} transactionTypes={data?.filters.transactionTypes} title="Discover Properties" />
        <RecommendedProperties properties={data?.topRecommended} propertyTypes={data?.filters.propertyTypes} transactionTypes={data?.filters.transactionTypes} />
        <CustomerAgentBanner />
      </main>
      <ChatbotWidget />
      <div className="mt-landing-footer-gap">
        <LandingFooter />
      </div>
    </div>
  )
}
