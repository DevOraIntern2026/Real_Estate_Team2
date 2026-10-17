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
import { useLandingPage } from '@/features/landing/hooks/useLandingPage'

export default function LandingPage() {
  const { data } = useLandingPage()

  return (
    <div className="min-h-screen overflow-hidden bg-bg-surface">
      <LandingHeader />
      <main>
        <HeroSection totalProperties={data?.totalProperties} />
        <PropertySearch filters={data?.filters} />
        <PromoBanners />
        <PropertyCategories propertyTypes={data?.filters.propertyTypes} />
        <FeaturedCities cities={data?.cities} />
        <RecommendedProperties properties={data?.discoverProperties} propertyTypes={data?.filters.propertyTypes} transactionTypes={data?.filters.transactionTypes} title="Discover Properties" />
        <RecommendedProperties properties={data?.topRecommended} propertyTypes={data?.filters.propertyTypes} transactionTypes={data?.filters.transactionTypes} />
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
