import arrowForward from '@/assets/images/arrow-forward.svg'
import type { LandingPageData } from '@/features/landing/types/landingPage'

export function FeaturedCities({ cities: apiCities }: { cities?: LandingPageData['cities'] }) {
  const displayedCities = apiCities?.map((city) => ({
        ...city,
        properties: `${city.propertiesCount} Properties Available`,
      })) ?? []
  return (
    <section className="w-full overflow-hidden px-landing-section-x py-6 max-landing-tablet:px-6 max-landing-mobile:px-4">
      <div className="flex items-start justify-between gap-6 max-landing-mobile:flex-col">
        <div>
          <h2 className="text-landing-section font-bold text-neutral-900 max-landing-mobile:text-title-28">Find Properties In These Cities</h2>
          <p className="mt-4 text-body-sm text-text-grey-shade">Now, you can find Properties in Your Favourite cities</p>
        </div>
        <a className="inline-flex h-12 shrink-0 items-center gap-2 rounded-button border border-brand-700 px-4 text-label-14 font-medium text-brand-700" href="#cities">See All Cities <img alt="" src={arrowForward} /></a>
      </div>
      <div className="mt-10 flex gap-10 overflow-x-auto max-landing-tablet:grid max-landing-tablet:grid-cols-2 max-landing-mobile:grid-cols-1" id="cities">
        {displayedCities.map((city) => (
          <article className="relative flex min-h-landing-city-card w-landing-city-card-width shrink-0 flex-col justify-start overflow-hidden rounded-inner p-7 text-white max-landing-tablet:w-full" key={city.name}>
            {city.image && <img alt="" className="absolute inset-0 size-full object-cover" src={city.image} />}
            <div aria-hidden="true" className="absolute inset-0 bg-brand-900/70" />
            <div className="relative z-1">
              <h3 className="text-title-24 font-semibold">{city.name}</h3>
              <p className="mt-2 text-label-14">{city.properties}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
