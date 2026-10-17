import { useEffect, useRef, useState } from 'react'
import apartment from '@/assets/images/category-apartment.png'
import villa from '@/assets/images/category-villa.png'
import duplex from '@/assets/images/category-duplex.png'
import type { LandingFilterOption } from '@/features/landing/types/landingPage'

export function PropertyCategories({ propertyTypes }: { propertyTypes?: LandingFilterOption[] }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [isPaused, setIsPaused] = useState(false)
  const displayedCategories = propertyTypes?.map(({ label, value }) => ({
    name: label.charAt(0).toUpperCase() + label.slice(1),
    value,
    image: [apartment, villa, apartment, duplex][value] ?? apartment,
  })) ?? []

  useEffect(() => {
    if (isPaused || displayedCategories.length < 2) return

    const intervalId = window.setInterval(() => {
      const track = trackRef.current
      const firstCard = track?.querySelector<HTMLElement>('[data-category-card]')
      if (!track || !firstCard) return

      const cardStep = firstCard.offsetWidth + 24
      const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2
      track.scrollTo({ left: atEnd ? 0 : track.scrollLeft + cardStep, behavior: 'smooth' })
    }, 3800)

    return () => window.clearInterval(intervalId)
  }, [displayedCategories.length, isPaused])

  const moveCarousel = (direction: -1 | 1) => {
    const track = trackRef.current
    const firstCard = track?.querySelector<HTMLElement>('[data-category-card]')
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
      <div className="flex items-end justify-between gap-6">
        <div>
          <p className="mb-2 text-label-14 font-medium uppercase tracking-[0.16em] text-brand-700">Find your fit</p>
          <h2 className="text-landing-section font-bold text-text-grey-dark max-landing-mobile:text-title-28">Discover Properties</h2>
        </div>
        <span className="hidden text-label-14 text-text-grey-shade max-landing-mobile:block">Swipe to explore</span>
      </div>
      <div className="relative mt-landing-category-gap">
        <button aria-label="Previous property types" className="absolute -left-4 top-1/2 z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-brand-900 text-white shadow-md transition-transform hover:scale-110 max-landing-mobile:left-1" onClick={() => moveCarousel(-1)} type="button">
          <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 24 24"><path d="m15 18-6-6 6-6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
        </button>
        <button aria-label="Next property types" className="absolute -right-4 top-1/2 z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-brand-900 text-white shadow-md transition-transform hover:scale-110 max-landing-mobile:right-1" onClick={() => moveCarousel(1)} type="button">
          <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 24 24"><path d="m9 18 6-6-6-6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
        </button>
        <div className="landing-carousel-track flex gap-6 overflow-x-auto scroll-smooth" onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)} onTouchStart={() => setIsPaused(true)} onTouchEnd={() => setIsPaused(false)} ref={trackRef}>
          {displayedCategories.map((category, index) => (
            <article className="group relative h-landing-category-card w-[calc(25%-18px)] shrink-0 overflow-hidden rounded-inner bg-brand-900 shadow-1 transition-transform duration-300 hover:-translate-y-1 max-landing-tablet:w-[calc(50%-12px)] max-landing-mobile:w-[78%]" data-category-card key={category.name}>
              <img alt="" className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105" src={category.image} />
              <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-brand-900/85 via-brand-900/15 to-transparent" />
              <span className="absolute left-4 top-4 rounded-full border border-white/30 bg-white/15 px-3 py-1 text-caption-12 font-medium text-white backdrop-blur-sm">{String(index + 1).padStart(2, '0')}</span>
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5 text-white">
                <h3 className="text-title-24 font-semibold">{category.name}</h3>
                <span aria-hidden="true" className="mb-1 flex size-8 items-center justify-center rounded-full border border-white/50 transition-colors group-hover:bg-white group-hover:text-brand-900">
                  <svg className="size-4" fill="none" viewBox="0 0 24 24"><path d="M7 17 17 7M7 7h10v10" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" /></svg>
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
