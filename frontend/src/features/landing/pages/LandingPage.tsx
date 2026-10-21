import {
  FeaturedCities,
  HeroSection,
  LandingFooter,
  LandingHeader,
  PropertyCategories,
  PropertySearch,
  PromoBanners,
  RecommendedProperties,
} from '@/features/landing/components'
import { ChatbotWidget } from '@/features/chatbot/components'
import { useLandingPage } from '@/features/landing/hooks/useLandingPage'
import { CustomerAgentBanner } from '@/features/customer/components/CustomerAgentBanner'
import { CustomerHeader } from '@/features/customer/components/CustomerHeader'
import { getAuthSession } from '@/services/api/tokenStorage'

export default function LandingPage() {
  const { data } = useLandingPage()
  const isCustomer = getAuthSession()?.role === 'customer'

  return (
    <div className="min-h-screen overflow-hidden bg-bg-surface">
      {isCustomer ? <CustomerHeader /> : <LandingHeader />}
      <main>
        <HeroSection totalProperties={data?.totalProperties} />
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
