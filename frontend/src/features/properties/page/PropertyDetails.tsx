import Footer from '../components/Footer'
import Header from '../components/Header'
import { useState } from 'react'
import { usePropertyDetails } from '../hooks/usePropertyDetails'
import PropertyTitle from '../components/PropertyTitle'
import PropertyGallery from '../components/PropertyGallery'
import PropertyAbout from '../components/PropertyAbout'
import { RecommendedProperties } from '../components/RecommendedProperties'
import ReviewsSection from '../components/ReviewsSection'
import AmenitiesGrid from '../components/AmenitiesGrid'
import ContactAgentCard from '../components/ContactAgentCard'

const PropertyDetails = () => {
  const state = usePropertyDetails('6ac53c82eca41412fe09fe03')
  const [isFavorite, setIsFavorite] = useState(false)
  return (
    <div className="bg-bg-light min-h-screen">
      <Header />
      <main className="md:px-grid-margin mx-auto w-[80%] pt-7.5">
        {state.status === 'loading' && (
          <div className="flex flex-col gap-6" aria-busy="true">
            <div className="bg-skeleton rounded-outer h-105 animate-pulse" />
            <div className="bg-skeleton rounded-outer h-36 animate-pulse" />
          </div>
        )}

        {state.status === 'error' && (
          <div
            role="alert"
            className="rounded-outer bg-main-white border-border-grey-shade mx-auto mt-10 max-w-lg border p-8 text-center"
          >
            <h1 className="text-title-24 font-semibold">{state.message}</h1>
            <p className="text-label-14 text-text-grey-shade mt-2">
              This property may have been removed or the link is wrong.
            </p>
            <a
              href="/search"
              className="bg-main-primary text-main-white text-label-14 rounded-button mt-6 inline-block px-6 py-3 font-medium"
            >
              Back to search
            </a>
          </div>
        )}

        {state.status === 'success' &&
          (() => {
            const { property, reviews } = state.data
            return (
              <div className="flex flex-col gap-4">
                <nav
                  aria-label="Breadcrumb"
                  className="text-label-14 text-text-grey-shade flex items-center gap-2"
                >
                  <a href="/">Home</a>
                  <span aria-hidden>›</span>
                  <a href="/search">{property.location.city}</a>
                  <span aria-hidden>›</span>
                  <span className="text-text-accent font-medium">
                    {property.title}
                  </span>
                </nav>

                <PropertyGallery
                  images={property.images}
                  title={property.title}
                  locationLabel={`${property.location.city}, ${property.location.country}`}
                />

                <PropertyTitle
                  property={property}
                  isFavorite={isFavorite}
                  onToggleFavorite={() => setIsFavorite((f) => !f)}
                />

                <div className="items-start gap-6 lg:grid lg:grid-cols-3 lg:grid-rows-2">
                  <PropertyAbout property={property} />
                  <AmenitiesGrid amenities={property.amenities} />
                  <ContactAgentCard
                    propertyId={property._id}
                    agent={property.owner}
                  />
                </div>

                <ReviewsSection reviews={reviews} />
                <RecommendedProperties />
              </div>
            )
          })()}
      </main>
      <Footer />
    </div>
  )
}

export default PropertyDetails
