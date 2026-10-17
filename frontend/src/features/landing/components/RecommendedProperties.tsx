import arrowForward from '@/assets/images/arrow-forward-light.svg'
import { AreaIcon, BathIcon, BedIcon, HeartIcon, PinIcon } from '@/features/landing/components/LandingIcons'
import type { LandingFilterOption, LandingProperty } from '@/features/landing/types/landingPage'

const propertyTypeName = (value: number, propertyTypes: LandingFilterOption[]) =>
  propertyTypes.find((type) => type.value === value)?.label ?? 'Property'

const transactionTypeName = (value: number, transactionTypes: LandingFilterOption[]) =>
  transactionTypes.find((type) => type.value === value)?.label ?? ''

export function RecommendedProperties({
  customerView = false,
  properties = [],
  propertyTypes = [],
  transactionTypes = [],
  title = 'Top Recommended',
}: {
  customerView?: boolean
  properties?: LandingProperty[]
  propertyTypes?: LandingFilterOption[]
  transactionTypes?: LandingFilterOption[]
  title?: string
}) {
  return (
    <section className="w-full px-landing-recommended-x pb-landing-section-bottom pt-6 max-landing-tablet:px-6 max-landing-mobile:px-4" id="recommended">
      <div className="flex items-center justify-between gap-6 max-landing-mobile:items-start">
        <h2 className="text-landing-section font-bold text-neutral-900 max-landing-mobile:text-title-28">{title}</h2>
        <a className="inline-flex h-12 shrink-0 items-center gap-2 rounded-button bg-brand-700 px-4 text-label-14 font-medium text-white" href="#recommended">View All <img alt="" src={arrowForward} /></a>
      </div>
      <div className="mt-10 grid grid-cols-3 gap-6 max-landing-tablet:grid-cols-2 max-landing-mobile:grid-cols-1">
        {properties.map((property) => (
          <article className="overflow-hidden rounded-inner bg-white shadow-1" key={property._id}>
            <div className="relative h-landing-property-image">
              {property.image && <img alt={property.title} className="size-full object-cover" src={property.image} />}
              <span className="absolute left-6 top-6 rounded-button bg-brand-50 px-3 py-2 text-label-14 font-medium text-brand-700">{transactionTypeName(property.transactionType, transactionTypes)}</span>
              <button aria-label={`Save ${property.title}`} className="absolute right-6 top-6 flex size-12 items-center justify-center rounded-full bg-white text-brand-700" type="button"><HeartIcon className="size-landing-heart-icon" /></button>
              <span className="absolute bottom-6 left-6 rounded-button bg-brand-50 px-3 py-2 text-label-14 text-brand-700">{propertyTypeName(property.propertyType, propertyTypes)}</span>
            </div>
            <div className="p-6">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-landing-card-title font-bold text-text-grey-dark">{property.title}</h3>
              </div>
              <p className="mt-3 inline-flex items-center gap-2 text-label-14 text-neutral-600"><PinIcon className="size-landing-small-icon" />{[property.location.area, property.location.city].filter(Boolean).join(', ')}</p>
              <p className="mt-5 text-title-24 font-semibold text-brand-700">{property.currency} {property.price.toLocaleString()}</p>
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border-grey-light pt-4 text-caption-12 text-icon-grey-shade">
                <span className="inline-flex items-center gap-2"><BedIcon className="size-landing-icon" />{property.bedrooms} Beds</span>
                <span className="inline-flex items-center gap-2"><BathIcon className="size-landing-icon" />{property.bathrooms} Baths</span>
                <span className="inline-flex items-center gap-2"><AreaIcon className="size-landing-icon" />{property.area} m²</span>
              </div>
              {customerView && (
                <button className="mt-5 h-landing-detail-button w-full rounded-button bg-brand-700 text-label-14 font-medium text-white transition-colors hover:bg-brand-800" type="button">
                  View Details
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
