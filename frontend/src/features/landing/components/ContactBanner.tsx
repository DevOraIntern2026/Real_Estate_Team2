import { Link } from 'react-router-dom'
import { HeroArtwork } from '@/features/landing/components/HeroArtwork'

export function ContactBanner() {
  return (
    <section className="relative mx-auto mt-landing-section-gap flex min-h-landing-contact w-full max-w-landing items-center overflow-hidden rounded-contact bg-landing-contact-bg px-landing-contact-x py-12 max-landing-tablet:px-8 max-landing-mobile:min-h-landing-contact-mobile max-landing-mobile:px-6" id="contact">
      <div className="relative z-1 max-w-landing-contact-copy">
        <h2 className="text-display-40 font-bold text-landing-text-heading max-landing-mobile:text-title-28">Find your best Real Estate by Homli</h2>
        <p className="mt-3 text-body-20 text-landing-contact-copy">We provide a complete service for the sale, purchase or rental of real estate.</p>
        <Link className="mt-10 inline-flex h-12 items-center justify-center rounded-button bg-brand-700 px-6 text-label-14 font-medium text-white hover:bg-brand-800" to="/signup">Get Started</Link>
      </div>
      <HeroArtwork className="absolute bottom-landing-contact-art-bottom right-landing-contact-art-right h-landing-contact-art-height w-landing-contact-art object-fill max-landing-tablet:right-landing-tablet-art-offset max-landing-tablet:opacity-60 max-landing-mobile:bottom-landing-contact-art-mobile-bottom max-landing-mobile:right-landing-contact-art-mobile-right max-landing-mobile:h-landing-contact-art-mobile-height max-landing-mobile:w-landing-contact-art-mobile max-landing-mobile:opacity-35" />
    </section>
  )
}
