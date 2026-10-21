import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AreaIcon, BathIcon, BedIcon, HeartIcon, PinIcon } from '@/features/landing/components/LandingIcons'
import type { SearchFilterOption, SearchProperty } from '@/features/search/types/search'

export function SearchPropertyCard({ property, propertyTypes = [], transactionTypes = [] }: {
  property: SearchProperty
  propertyTypes?: SearchFilterOption[]
  transactionTypes?: SearchFilterOption[]
}) {
  const [saved, setSaved] = useState(false)
  const propertyType = propertyTypes.find(({ value }) => value === property.propertyType)?.label ?? 'Property'
  const transactionType = transactionTypes.find(({ value }) => value === property.transactionType)?.label
    ?? (property.transactionType === 0 ? 'Rent' : 'Sale')

  return (
    <article className="overflow-hidden rounded-search-card bg-white shadow-1">
      <div className="relative h-search-card-image bg-brand-50 max-search-mobile:h-search-card-image-mobile">
        {property.image && <img alt={property.title} className="size-full object-cover" src={property.image} />}
        <span className="absolute left-search-card-inset top-search-card-inset rounded-button bg-white/90 px-4 py-2 text-label-14 font-medium text-brand-700">{property.isFeatured ? 'Featured' : transactionType}</span>
        <button aria-label={saved ? `Remove ${property.title} from favorites` : `Add ${property.title} to favorites`} className={`absolute right-search-card-inset top-search-card-inset flex size-search-card-heart items-center justify-center rounded-full bg-white ${saved ? 'text-error-dark' : 'text-brand-700'}`} onClick={() => setSaved((value) => !value)} type="button">
          <HeartIcon className="size-landing-heart-icon" />
        </button>
        <span className="absolute bottom-search-card-inset left-search-card-inset rounded-button bg-brand-50 px-4 py-2 text-label-14 text-brand-700">• {propertyType}</span>
      </div>
      <div className="p-search-card-content max-search-mobile:p-4">
        <h2 className="text-search-card-title font-bold text-black">{property.title}</h2>
        <p className="mt-2 inline-flex items-center gap-1 text-label-14 text-neutral-600"><PinIcon className="size-search-meta-icon" />{[property.location.area, property.location.city].filter(Boolean).join(', ')}</p>
        <p className="mt-search-card-price text-search-card-price font-semibold text-brand-700">{property.currency} {property.price.toLocaleString('en-US')}</p>
        <div className="mt-3 flex items-center justify-between gap-2 border-t border-border-grey-light pt-3 text-search-feature text-icon-grey-shade">
          <span className="inline-flex items-center gap-1.5"><BedIcon className="size-search-meta-icon" />{property.bedrooms} Beds</span>
          <span className="inline-flex items-center gap-1.5"><BathIcon className="size-search-meta-icon" />{property.bathrooms} Baths</span>
          <span className="inline-flex items-center gap-1.5"><AreaIcon className="size-search-meta-icon" />{property.area} m²</span>
        </div>
        <Link to={`/property-details/${property._id}`} className="mt-4 flex h-search-card-button w-full items-center justify-center rounded-button bg-brand-700 text-label-14 font-medium text-white transition-colors hover:bg-brand-800">View Details</Link>
      </div>
    </article>
  )
}
