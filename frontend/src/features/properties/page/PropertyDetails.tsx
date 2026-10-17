import Footer from '../components/Footer'
import Header from '../components/Header'
import { useParams } from 'react-router-dom'
import React, { useState } from 'react'
import { usePropertyDetails } from '../hooks/usePropertyDetails'
import PropertyTitle from '../components/PropertyTitle'
import PropertyGallery from '../components/PropertyGallery'
import PropertyAbout from '../components/PropertyAbout'
import { RecommendedProperties } from '../components/RecommendedProperties'
import AmenitiesGrid from '../components/AmenitiesGrid'
import ContactAgentCard from '../components/ContactAgentCard'
import { mockPropertyDetails } from '../mocks/mockData'

const PropertyDetails: React.FC = () => {
  const [isFavorite, setIsFavorite] = useState(false)
  const { id } = useParams<{ id: string }>()
  const state = usePropertyDetails(id || '6ac53c82eca41412fe09fe03')
  if (state.status === 'loading') {
    return
    ;<div className="flex flex-col gap-6" aria-busy="true">
      <div className="bg-skeleton rounded-outer h-105 animate-pulse" />
      <div className="bg-skeleton rounded-outer h-36 animate-pulse" />
    </div>
  }
  if (state.status === 'error') {
    return
    ;<div
      role="alert"
      className="rounded-outer bg-main-white border-border-grey-shade mx-auto mt-10 max-w-lg border p-8 text-center"
    >
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
  }
  if (state.status === 'success') {
    const property = state.data

    return (
      <div className="flex flex-col gap-4">
        <Header />
        <nav
          aria-label="Breadcrumb"
          className="text-label-14 text-text-grey-shade flex items-center gap-2"
        >
          <a href="/">Home</a>
          <span aria-hidden>›</span>
          <a href="/search">
            {property.location.city || mockPropertyDetails.location.city}
          </a>
          <span aria-hidden>›</span>
          <span className="text-text-accent font-medium">
            {property.title || mockPropertyDetails.title}
          </span>
        </nav>
        <PropertyGallery
          images={property.images || mockPropertyDetails.images}
          title={property.title || mockPropertyDetails.title}
          locationLabel={`${property.location.city || mockPropertyDetails.location.city}, ${property.location.state || mockPropertyDetails.location.state}`}
        />
        <PropertyTitle
          property={property || mockPropertyDetails}
          isFavorite={isFavorite}
          onToggleFavorite={() => setIsFavorite((f) => !f)}
        />

        <div className="items-start gap-6 lg:grid lg:grid-cols-3 lg:grid-rows-2">
          <PropertyAbout
            property={property || mockPropertyDetails}
            about={property.about || mockPropertyDetails.about}
          />
          <AmenitiesGrid
            amenities={property.amenities || mockPropertyDetails.amenities}
          />
          <ContactAgentCard
            propertyId={property._id || mockPropertyDetails._id}
            agent={property.agent || mockPropertyDetails.agent}
          />
        </div>

        <RecommendedProperties />

        <Footer />
      </div>
    )
  }
}

export default PropertyDetails
