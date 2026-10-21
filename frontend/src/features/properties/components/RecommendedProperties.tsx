import { Link } from 'react-router-dom'
import { AreaIcon, BathIcon, BedIcon, PinIcon } from '@/features/landing/components/LandingIcons'
import type { RelatedProperty } from '../types/types'
import { formatPrice } from '../utils/utils'

export function RecommendedProperties({ properties = [] }: { properties?: RelatedProperty[] }) {
  if (!properties.length) return null

  return (
    <section className="w-full px-landing-section-x pb-landing-section-bottom pt-6 max-landing-tablet:px-6 max-landing-mobile:px-4">
      <h2 className="text-landing-section font-bold text-neutral-900 max-landing-mobile:text-title-28">Related properties</h2>
      <div className="mt-8 grid grid-cols-3 gap-6 max-landing-tablet:grid-cols-2 max-landing-mobile:grid-cols-1">
        {properties.map((property) => (
          <article key={property._id} className="overflow-hidden rounded-inner bg-white shadow-1">
            <div className="relative h-landing-property-image bg-bg-surface-variant">
              {property.image && <img alt={property.title} className="size-full object-cover" src={property.image} />}
            </div>
            <div className="p-6">
              <h3 className="text-landing-card-title font-bold text-text-grey-dark">{property.title}</h3>
              <p className="mt-3 inline-flex items-center gap-2 text-label-14 text-neutral-600"><PinIcon className="size-landing-small-icon" />{[property.location.area, property.location.city].filter(Boolean).join(', ')}</p>
              <p className="mt-5 text-title-24 font-semibold text-brand-700">{formatPrice(property.price, property.currency, property.transactionType)}</p>
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border-grey-light pt-4 text-caption-12 text-icon-grey-shade">
                <span className="inline-flex items-center gap-2"><BedIcon className="size-landing-icon" />{property.bedrooms} Beds</span>
                <span className="inline-flex items-center gap-2"><BathIcon className="size-landing-icon" />{property.bathrooms} Baths</span>
                <span className="inline-flex items-center gap-2"><AreaIcon className="size-landing-icon" />{property.area} m²</span>
              </div>
              <Link className="mt-5 flex h-landing-detail-button w-full items-center justify-center rounded-button bg-brand-700 text-label-14 font-medium text-white transition-colors hover:bg-brand-800" to={`/property-details/${property._id}`}>
                View Details
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
