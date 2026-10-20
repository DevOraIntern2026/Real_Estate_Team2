import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
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
  const trackRef = useRef<HTMLDivElement>(null)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    if (isPaused || properties.length < 2) return

    const intervalId = window.setInterval(() => {
      const track = trackRef.current
      const firstCard = track?.querySelector<HTMLElement>('[data-property-card]')
      if (!track || !firstCard) return

      const cardStep = firstCard.offsetWidth + 24
      const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2
      track.scrollTo({ left: atEnd ? 0 : track.scrollLeft + cardStep, behavior: 'smooth' })
    }, 3500)

    return () => window.clearInterval(intervalId)
  }, [isPaused, properties.length])

  const moveCarousel = (direction: -1 | 1) => {
    const track = trackRef.current
    const firstCard = track?.querySelector<HTMLElement>('[data-property-card]')
    if (!track || !firstCard) return

    const cardStep = firstCard.offsetWidth + 24
    const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2
    const nextLeft = direction === 1 && atEnd
      ? 0
      : Math.max(0, track.scrollLeft + direction * cardStep)
    track.scrollTo({ left: nextLeft, behavior: 'smooth' })
  }

  return (
    <section className="w-full px-landing-recommended-x pb-landing-section-bottom pt-6 max-landing-tablet:px-6 max-landing-mobile:px-4" id="recommended">
      <div className="flex items-center justify-between gap-6 max-landing-mobile:items-start">
        <h2 className="text-landing-section font-bold text-neutral-900 max-landing-mobile:text-title-28">{title}</h2>
        <a className="inline-flex h-12 shrink-0 items-center gap-2 rounded-button bg-brand-700 px-4 text-label-14 font-medium text-white" href="#recommended">View All <img alt="" src={arrowForward} /></a>
      </div>
      <div className="relative mt-10">
        <button aria-label={`Previous ${title.toLowerCase()}`} className="absolute left-0 top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-200/70 bg-white/85 text-neutral-400 shadow-sm transition-colors hover:bg-white hover:text-neutral-600" onClick={() => moveCarousel(-1)} type="button">
          <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" className="size-5"><path d="m15 18-6-6 6-6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
        </button>
        <button aria-label={`Next ${title.toLowerCase()}`} className="absolute right-0 top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-200/70 bg-white/85 text-neutral-400 shadow-sm transition-colors hover:bg-white hover:text-neutral-600" onClick={() => moveCarousel(1)} type="button">
          <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" className="size-5"><path d="m9 18 6-6-6-6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
        </button>
        <div className="landing-carousel-track flex gap-6 overflow-x-auto scroll-smooth" onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)} onTouchStart={() => setIsPaused(true)} onTouchEnd={() => setIsPaused(false)} ref={trackRef}>
        {properties.map((property) => (
          <article className="w-[calc(33.333%-16px)] shrink-0 overflow-hidden rounded-inner bg-white shadow-1 max-landing-tablet:w-[calc(50%-12px)] max-landing-mobile:w-[85%]" data-property-card key={property._id}>
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
                <Link to={`/property-details/${property._id}`} className="mt-5 flex h-landing-detail-button w-full items-center justify-center rounded-button bg-brand-700 text-label-14 font-medium text-white transition-colors hover:bg-brand-800">
                  View Details
                </Link>
              )}
            </div>
          </article>
        ))}
        </div>
      </div>
    </section>
  )
}
