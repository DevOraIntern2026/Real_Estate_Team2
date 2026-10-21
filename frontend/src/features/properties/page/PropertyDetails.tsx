import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Header from '../components/Header'
import { CustomerHeader } from '@/features/customer/components/CustomerHeader'
import { LandingFooter } from '@/features/landing/components/LandingFooter'
import { getAuthSession } from '@/services/api/tokenStorage'
import { usePropertyDetails } from '../hooks/usePropertyDetails'
import PropertyTitle from '../components/PropertyTitle'
import PropertyGallery from '../components/PropertyGallery'
import PropertyAbout from '../components/PropertyAbout'
import { RecommendedProperties } from '../components/RecommendedProperties'
import AmenitiesGrid from '../components/AmenitiesGrid'
import ContactAgentCard from '../components/ContactAgentCard'
import ReviewsSection from '../components/ReviewsSection'

const PropertyDetails = () => {
  const [isFavorite, setIsFavorite] = useState(false)
  const { id } = useParams<{ id: string }>()
  const state = usePropertyDetails(id ?? '')
  const showCustomerChrome = getAuthSession()?.role === 'customer'

  return (
    <div className="flex min-h-screen flex-col gap-4 bg-bg-surface">
      {showCustomerChrome ? <CustomerHeader /> : <Header />}
      <main className="mx-auto flex w-full max-w-landing flex-1 flex-col gap-6 px-landing-section-x max-landing-tablet:px-6 max-landing-mobile:px-4">
        {state.status === 'loading' && (
          <div className="flex flex-col gap-6" aria-busy="true" aria-label="Loading property details">
            <div className="h-105 animate-pulse rounded-outer bg-skeleton" />
            <div className="h-36 animate-pulse rounded-outer bg-skeleton" />
            <div className="h-80 animate-pulse rounded-outer bg-skeleton" />
          </div>
        )}

        {state.status === 'error' && (
          <section role="alert" className="mx-auto my-12 max-w-lg rounded-outer border border-border-grey-shade bg-main-white p-8 text-center">
            <h1 className="text-title-24 font-semibold text-[#0f0f3d]">Property details unavailable</h1>
            <p className="mt-3 text-label-14 text-text-grey-shade">{state.message}</p>
            <Link to="/search" className="mt-6 inline-block rounded-button bg-main-primary px-6 py-3 text-label-14 font-medium text-main-white">Back to search</Link>
          </section>
        )}

        {state.status === 'success' && (() => {
          const property = state.data
          const locationLabel = [property.location.city, property.location.area, property.location.state, property.location.country]
            .filter(Boolean)
            .join(', ')

          return (
            <>
              <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-label-14 text-text-grey-shade">
                <Link to="/">Home</Link>
                <span aria-hidden>›</span>
                <Link to="/search">{property.location.city || 'Search'}</Link>
                <span aria-hidden>›</span>
                <span className="font-medium text-text-accent">{property.title}</span>
              </nav>

              <PropertyGallery images={property.images} title={property.title} locationLabel={locationLabel} />
              <PropertyTitle property={property} isFavorite={isFavorite} onToggleFavorite={() => setIsFavorite((saved) => !saved)} />

              <div className="items-start gap-6 lg:grid lg:grid-cols-3 lg:grid-rows-2">
                <PropertyAbout property={property} about={property.about} />
                <AmenitiesGrid amenities={property.amenities} />
                <ContactAgentCard propertyId={id || property._id} agent={property.agent} />
              </div>

              {property.reviews.items && <ReviewsSection reviews={property.reviews.items} />}
              <RecommendedProperties properties={property.related} />
            </>
          )
        })()}
      </main>
      <LandingFooter />
    </div>
  )
}

export default PropertyDetails
