import comingSoon from '@/assets/images/property-coming-soon.png'
import sold from '@/assets/images/property-sold.png'
import available from '@/assets/images/property-available.png'
import arrowForward from '@/assets/images/arrow-forward-light.svg'
import { AreaIcon, BathIcon, BedIcon, HeartIcon, PinIcon, StarIcon } from '@/features/landing/components/LandingIcons'

const properties = [
  { title: 'Modern Downtown Apartment', status: 'Coming Soon', kind: 'Apartment', location: 'New Cairo, Egypt', price: 'EGP 500,000', image: comingSoon, rating: '4.8', beds: '2', baths: '2', area: '120' },
  { title: 'Cozy Family Home', status: 'Sold', kind: 'House', location: 'Ain Sokhna, Egypt', price: 'EGP 1,000,000', image: sold, rating: '4.7', beds: '3', baths: '2', area: '180' },
  { title: 'Luxury Townhouse', status: 'Available', kind: 'Townhouse', location: 'Future City, Egypt', price: 'EGP 5,000,000', image: available, rating: '4.9', beds: '4', baths: '3', area: '250' },
]

export function RecommendedProperties({ customerView = false }: { customerView?: boolean }) {
  const displayedProperties = customerView
    ? [properties[2], properties[0], properties[1]]
    : properties
  return (
    <section className="w-full px-landing-recommended-x pb-landing-section-bottom pt-6 max-landing-tablet:px-6 max-landing-mobile:px-4" id="recommended">
      <div className="flex items-center justify-between gap-6 max-landing-mobile:items-start">
        <h2 className="text-landing-section font-bold text-neutral-900 max-landing-mobile:text-title-28">Top Recommended</h2>
        <a className="inline-flex h-12 shrink-0 items-center gap-2 rounded-button bg-brand-700 px-4 text-label-14 font-medium text-white" href="#recommended">View All <img alt="" src={arrowForward} /></a>
      </div>
      <div className="mt-10 grid grid-cols-3 gap-6 max-landing-tablet:grid-cols-2 max-landing-mobile:grid-cols-1">
        {displayedProperties.map((property) => (
          <article className="overflow-hidden rounded-inner bg-white shadow-1" key={property.title}>
            <div className="relative h-landing-property-image">
              <img alt={property.title} className="size-full object-cover" src={property.image} />
              <span className="absolute left-6 top-6 rounded-button bg-brand-50 px-3 py-2 text-label-14 font-medium text-brand-700">{property.status}</span>
              <button aria-label={`Save ${property.title}`} className="absolute right-6 top-6 flex size-12 items-center justify-center rounded-full bg-white text-brand-700" type="button"><HeartIcon className="size-landing-heart-icon" /></button>
              <span className="absolute bottom-6 left-6 rounded-button bg-brand-50 px-3 py-2 text-label-14 text-brand-700">{property.kind}</span>
            </div>
            <div className="p-6">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-landing-card-title font-bold text-text-grey-dark">{property.title}</h3>
                <span className="inline-flex shrink-0 items-center gap-1 text-caption-12 text-text-grey-shade"><StarIcon className="size-landing-small-icon fill-attention-dark text-attention-dark" />{property.rating}</span>
              </div>
              <p className="mt-3 inline-flex items-center gap-2 text-label-14 text-neutral-600"><PinIcon className="size-landing-small-icon" />{property.location}</p>
              <p className="mt-5 text-title-24 font-semibold text-brand-700">{property.price}</p>
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border-grey-light pt-4 text-caption-12 text-icon-grey-shade">
                <span className="inline-flex items-center gap-2"><BedIcon className="size-landing-icon" />{property.beds} Beds</span>
                <span className="inline-flex items-center gap-2"><BathIcon className="size-landing-icon" />{property.baths} Baths</span>
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
