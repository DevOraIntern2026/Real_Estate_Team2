import comingSoon from '@/assets/images/property-coming-soon.png'
import sold from '@/assets/images/property-sold.png'
import available from '@/assets/images/property-available.png'
import arrowForward from '@/assets/images/arrow-forward-light.svg'
import {
  AreaIcon,
  BathIcon,
  BedIcon,
  HeartIcon,
  PinIcon,
  StarIcon,
} from '@/features/landing/components/LandingIcons'

const properties = [
  {
    title: 'Modern Downtown Apartment',
    status: 'Coming Soon',
    kind: 'Apartment',
    location: 'New Cairo, Egypt',
    price: 'EGP 500,000',
    image: comingSoon,
    rating: '4.8',
    beds: '2',
    baths: '2',
    area: '120',
  },
  {
    title: 'Cozy Family Home',
    status: 'Sold',
    kind: 'House',
    location: 'Ain Sokhna, Egypt',
    price: 'EGP 1,000,000',
    image: sold,
    rating: '4.7',
    beds: '3',
    baths: '2',
    area: '180',
  },
  {
    title: 'Luxury Townhouse',
    status: 'Available',
    kind: 'Townhouse',
    location: 'Future City, Egypt',
    price: 'EGP 5,000,000',
    image: available,
    rating: '4.9',
    beds: '4',
    baths: '3',
    area: '250',
  },
]

export function RecommendedProperties({
  customerView = false,
}: {
  customerView?: boolean
}) {
  const displayedProperties = customerView
    ? [properties[2], properties[0], properties[1]]
    : properties
  return (
    <section
      className="px-landing-recommended-x pb-landing-section-bottom max-landing-tablet:px-6 max-landing-mobile:px-4 w-full pt-6"
      id="recommended"
    >
      <div className="max-landing-mobile:items-start flex w-full flex-wrap items-center justify-between gap-6">
        <h2 className="text-landing-section max-landing-mobile:text-title-28 font-bold text-neutral-900">
          Top Recommended
        </h2>
        <a
          className="rounded-button bg-brand-700 text-label-14 inline-flex h-12 shrink-0 items-center gap-2 px-4 font-medium text-white"
          href="#recommended"
        >
          View All <img alt="" src={arrowForward} />
        </a>
      </div>
      <div className="max-landing-tablet:grid-cols-2 max-landing-mobile:grid-cols-1 mt-10 grid grid-cols-3 gap-6">
        {displayedProperties.map((property) => (
          <article
            className="rounded-inner shadow-1 overflow-hidden bg-white"
            key={property.title}
          >
            <div className="h-landing-property-image relative">
              <img
                alt={property.title}
                className="size-full object-cover"
                src={property.image}
              />
              <span className="rounded-button bg-brand-50 text-label-14 text-brand-700 absolute top-6 left-6 px-3 py-2 font-medium">
                {property.status}
              </span>
              <button
                aria-label={`Save ${property.title}`}
                className="text-brand-700 absolute top-6 right-6 flex size-12 items-center justify-center rounded-full bg-white"
                type="button"
              >
                <HeartIcon className="size-landing-heart-icon" />
              </button>
              <span className="rounded-button bg-brand-50 text-label-14 text-brand-700 absolute bottom-6 left-6 px-3 py-2">
                {property.kind}
              </span>
            </div>
            <div className="p-6">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-landing-card-title text-text-grey-dark font-bold">
                  {property.title}
                </h3>
                <span className="text-caption-12 text-text-grey-shade inline-flex shrink-0 items-center gap-1">
                  <StarIcon className="size-landing-small-icon fill-attention-dark text-attention-dark" />
                  {property.rating}
                </span>
              </div>
              <p className="text-label-14 mt-3 inline-flex items-center gap-2 text-neutral-600">
                <PinIcon className="size-landing-small-icon" />
                {property.location}
              </p>
              <p className="text-title-24 text-brand-700 mt-5 font-semibold">
                {property.price}
              </p>
              <div className="border-border-grey-light text-caption-12 text-icon-grey-shade mt-5 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
                <span className="inline-flex items-center gap-2">
                  <BedIcon className="size-landing-icon" />
                  {property.beds} Beds
                </span>
                <span className="inline-flex items-center gap-2">
                  <BathIcon className="size-landing-icon" />
                  {property.baths} Baths
                </span>
                <span className="inline-flex items-center gap-2">
                  <AreaIcon className="size-landing-icon" />
                  {property.area} m²
                </span>
              </div>
              {customerView && (
                <button
                  className="h-landing-detail-button rounded-button bg-brand-700 text-label-14 hover:bg-brand-800 mt-5 w-full font-medium text-white transition-colors"
                  type="button"
                >
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
