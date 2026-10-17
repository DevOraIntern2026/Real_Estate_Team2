import apartment from '@/assets/images/category-apartment.png'
import villa from '@/assets/images/category-villa.png'
import duplex from '@/assets/images/category-duplex.png'
import type { LandingFilterOption } from '@/features/landing/types/landingPage'

export function PropertyCategories({ propertyTypes }: { propertyTypes?: LandingFilterOption[] }) {
  const displayedCategories = propertyTypes?.map(({ label, value }) => ({
        name: label.charAt(0).toUpperCase() + label.slice(1),
        value,
        image: [apartment, villa, apartment, duplex][value] ?? apartment,
      })) ?? []

  return (
    <section className="w-full px-landing-section-x py-6 max-landing-tablet:px-6 max-landing-mobile:px-4">
      <h2 className="text-landing-section font-bold text-text-grey-dark max-landing-mobile:text-title-28">Discover Properties</h2>
      <div className="mt-landing-category-gap grid grid-cols-4 gap-landing-category-gap max-landing-tablet:grid-cols-2 max-landing-mobile:grid-cols-1 max-landing-mobile:justify-items-center">
        {displayedCategories.map((category) => (
          <article className="flex flex-col items-center text-center" key={category.name}>
            <img alt="" className="size-landing-category-card rounded-inner object-cover" src={category.image} />
            <h3 className="mt-2 text-title-24 font-semibold text-neutral-800">{category.name}</h3>
            <p className="mt-1 text-body-sm text-neutral-800">Property type</p>
          </article>
        ))}
      </div>
    </section>
  )
}
