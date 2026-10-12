import { useState } from 'react'
import { AreaIcon, BathIcon, BedIcon, HeartIcon, PinIcon, StarIcon } from '@/features/landing/components/LandingIcons'
import type { SearchProperty } from '@/features/search/data/searchProperties'

export function SearchPropertyCard({ property }: { property: SearchProperty }) {
  const [saved, setSaved] = useState(false)

  return (
    <article className="overflow-hidden rounded-search-card bg-white shadow-1">
      <div className="relative h-search-card-image max-search-mobile:h-search-card-image-mobile">
        <img alt={property.title} className="size-full object-cover" src={property.image} />
        <span className={`absolute left-search-card-inset top-search-card-inset rounded-button px-4 py-2 text-label-14 font-medium ${property.status === 'Available' ? 'bg-success-light text-success-dark' : 'bg-attention-lighter text-attention-darker'}`}>{property.status}</span>
        <button aria-label={saved ? `Remove ${property.title} from favorites` : `Add ${property.title} to favorites`} className={`absolute right-search-card-inset top-search-card-inset flex size-search-card-heart items-center justify-center rounded-full bg-white ${saved ? 'text-error-dark' : 'text-brand-700'}`} onClick={() => setSaved((value) => !value)} type="button">
          <HeartIcon className="size-landing-heart-icon" />
        </button>
        <span className="absolute bottom-search-card-inset left-search-card-inset rounded-button bg-brand-50 px-4 py-2 text-label-14 text-brand-700">• {property.type}</span>
      </div>
      <div className="p-search-card-content max-search-mobile:p-4">
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-search-card-title font-bold text-black">{property.title}</h2>
          <span className="inline-flex shrink-0 items-center gap-1 text-caption-12 text-text-grey-light"><StarIcon className="size-search-rating fill-brand-yellow text-brand-yellow" />4.8</span>
        </div>
        <p className="mt-2 inline-flex items-center gap-1 text-label-14 text-neutral-600"><PinIcon className="size-search-meta-icon" />{property.location}</p>
        <p className="mt-search-card-price text-search-card-price font-semibold text-brand-700">EGP {property.price.toLocaleString('en-US')}</p>
        <div className="mt-3 flex items-center justify-between gap-2 border-t border-border-grey-light pt-3 text-search-feature text-icon-grey-shade">
          <span className="inline-flex items-center gap-1.5"><BedIcon className="size-search-meta-icon" />{property.beds} Beds</span>
          <span className="inline-flex items-center gap-1.5"><BathIcon className="size-search-meta-icon" />{property.baths} Baths</span>
          <span className="inline-flex items-center gap-1.5"><AreaIcon className="size-search-meta-icon" />6x8 m²</span>
        </div>
        <button className="mt-4 h-search-card-button w-full rounded-button bg-brand-700 text-label-14 font-medium text-white transition-colors hover:bg-brand-800" type="button">View Details</button>
      </div>
    </article>
  )
}
