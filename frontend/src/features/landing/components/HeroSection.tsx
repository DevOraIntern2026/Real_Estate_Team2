import { Link } from 'react-router-dom'
import heroImage from '@/assets/images/landing-hero.png'
import { ArrowUpRightIcon } from '@/features/landing/components/LandingIcons'
import { HeroArtwork } from '@/features/landing/components/HeroArtwork'
type HeroSectionProps = { showExploreButton?: boolean; totalProperties?: number }

export function HeroSection({ showExploreButton = true, totalProperties }: HeroSectionProps) {
  return (
    <section className="relative mx-auto mt-landing-hero-top flex min-h-landing-hero w-full max-w-landing items-center overflow-hidden rounded-outer bg-brand-900 bg-cover bg-center px-landing-hero-x py-16 max-landing-tablet:min-h-landing-hero-tablet max-landing-tablet:px-10 max-landing-mobile:mt-4 max-landing-mobile:min-h-landing-hero-mobile max-landing-mobile:px-6" id="home">
      <img alt="" aria-hidden="true" className="pointer-events-none absolute inset-0 size-full object-cover" src={heroImage} />
      <HeroArtwork className="pointer-events-none absolute right-landing-hero-art-right top-landing-hero-art-top z-0 h-landing-home-art-height w-landing-home-art-width max-landing-tablet:right-landing-tablet-art-offset max-landing-tablet:opacity-75 max-landing-mobile:right-landing-mobile-art-offset max-landing-mobile:h-landing-home-art-mobile max-landing-mobile:w-landing-home-art-mobile max-landing-mobile:opacity-50" />
      <div className="relative z-1 max-w-landing-hero-copy text-white">
        <p className="mb-6 text-landing-welcome font-normal text-brand-yellow">Welcome to Homli</p>
        <h1 className="text-landing-hero font-semibold leading-tight max-landing-tablet:text-display-40 max-landing-mobile:text-display-36">
          Discover Your Next Home
        </h1>
        <p className="mt-6 text-body-20 text-white">Search and compare among {totalProperties?.toLocaleString() ?? '—'} properties</p>
        {showExploreButton && (
          <Link className="mt-8 inline-flex items-center gap-2 rounded-button bg-brand-yellow px-6 py-3 text-label-14 font-medium text-brand-900 transition-colors hover:bg-main-shade-01" to="/signup">
            Explore properties <ArrowUpRightIcon className="size-landing-icon" />
          </Link>
        )}
      </div>
    </section>
  )
}
