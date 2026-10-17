import { useEffect, useRef, useState } from 'react'
import arrowForward from '@/assets/images/arrow-forward.svg'
import newCairo from '@/assets/images/city-new-cairo.png'
import futureCity from '@/assets/images/city-future-city.png'
import ainSokhna from '@/assets/images/city-ain-sokhna.png'
import heliopolis from '@/assets/images/city-new-heliopolis.png'
import type { LandingPageData } from '@/features/landing/types/landingPage'

const fallbackCityImages = [newCairo, futureCity, ainSokhna, heliopolis]

function getFallbackCityImage(cityName: string, index: number) {
  const normalizedName = cityName.toLowerCase()

  if (normalizedName.includes('cairo')) return newCairo
  if (normalizedName.includes('sokhna')) return ainSokhna
  if (normalizedName.includes('future')) return futureCity
  if (normalizedName.includes('heliopolis')) return heliopolis

  return fallbackCityImages[index % fallbackCityImages.length]
}

export function FeaturedCities({ cities: apiCities }: { cities?: LandingPageData['cities'] }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [isPaused, setIsPaused] = useState(false)
  const displayedCities = apiCities?.map((city, index) => ({
    ...city,
    properties: `${city.propertiesCount} Properties Available`,
    image: city.image || getFallbackCityImage(city.name, index),
  })) ?? []

  useEffect(() => {
    if (isPaused || displayedCities.length < 2) return

    const intervalId = window.setInterval(() => {
      const track = trackRef.current
      if (!track) return

      const firstCard = track.querySelector<HTMLElement>('[data-city-card]')
      if (!firstCard) return

      const cardStep = firstCard.offsetWidth + 24
      const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2
      track.scrollTo({ left: atEnd ? 0 : track.scrollLeft + cardStep, behavior: 'smooth' })
    }, 3500)

    return () => window.clearInterval(intervalId)
  }, [displayedCities.length, isPaused])

  const moveCarousel = (direction: -1 | 1) => {
    const track = trackRef.current
    const firstCard = track?.querySelector<HTMLElement>('[data-city-card]')
    if (!track || !firstCard) return

    const cardStep = firstCard.offsetWidth + 24
    const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2
    const nextLeft = direction === 1 && atEnd
      ? 0
      : Math.max(0, track.scrollLeft + direction * cardStep)

    track.scrollTo({ left: nextLeft, behavior: 'smooth' })
  }

  return (
    <section className="w-full overflow-hidden px-landing-section-x py-6 max-landing-tablet:px-6 max-landing-mobile:px-4">
      <div className="flex items-start justify-between gap-6 max-landing-mobile:flex-col">
        <div>
          <h2 className="text-landing-section font-bold text-neutral-900 max-landing-mobile:text-title-28">Find Properties In These Cities</h2>
          <p className="mt-4 text-body-sm text-text-grey-shade">Now, you can find Properties in Your Favourite cities</p>
        </div>
        <a className="inline-flex h-12 shrink-0 items-center gap-2 rounded-button border border-brand-700 px-4 text-label-14 font-medium text-brand-700" href="#cities">See All Cities <img alt="" src={arrowForward} /></a>
      </div>
      <div className="relative mt-10">
        <button aria-label="Previous cities" className="absolute left-0 top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-200/70 bg-white/85 text-neutral-400 shadow-sm transition-colors hover:bg-white hover:text-neutral-600" onClick={() => moveCarousel(-1)} type="button">
          <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" className="size-5"><path d="m15 18-6-6 6-6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
        </button>
        <button aria-label="Next cities" className="absolute right-0 top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-200/70 bg-white/85 text-neutral-400 shadow-sm transition-colors hover:bg-white hover:text-neutral-600" onClick={() => moveCarousel(1)} type="button">
          <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" className="size-5"><path d="m9 18 6-6-6-6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
        </button>
        <div className="landing-carousel-track flex gap-6 overflow-x-auto scroll-smooth" id="cities" onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)} onTouchStart={() => setIsPaused(true)} onTouchEnd={() => setIsPaused(false)} ref={trackRef}>
          {displayedCities.map((city) => (
            <article className="relative flex min-h-landing-city-card w-landing-city-card-width shrink-0 flex-col justify-start overflow-hidden rounded-inner p-7 text-white max-landing-tablet:w-[calc(50%-12px)] max-landing-mobile:w-[85%]" data-city-card key={city.name}>
              <img alt="" className="absolute inset-0 size-full object-cover" src={city.image} />
              <div aria-hidden="true" className="absolute inset-0 bg-brand-900/70" />
              <div className="relative z-1">
                <h3 className="text-title-24 font-semibold">{city.name}</h3>
                <p className="mt-2 text-label-14">{city.properties}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
