import { Link } from 'react-router-dom'
import buildingImage from '@/assets/images/customer-agent-building.png'

export function CustomerAgentBanner() {
  return (
    <section className="relative mx-auto mb-landing-section-bottom mt-landing-section-gap flex min-h-landing-contact w-full max-w-landing-search-panel items-center overflow-hidden rounded-outer bg-customer-agent-bg px-landing-contact-x max-landing-tablet:mx-6 max-landing-tablet:px-10 max-landing-mobile:mx-4 max-landing-mobile:min-h-landing-contact-mobile max-landing-mobile:px-6" id="contact">
      <img alt="Modern property available for sale" className="pointer-events-none absolute top-customer-agent-art-top right-customer-agent-art-right z-0 h-customer-agent-art-height w-customer-agent-art-width object-contain opacity-50 max-landing-tablet:right-customer-agent-art-tablet max-landing-tablet:opacity-35 max-landing-mobile:top-0 max-landing-mobile:right-customer-agent-art-mobile max-landing-mobile:h-customer-agent-art-mobile max-landing-mobile:w-customer-agent-art-mobile max-landing-mobile:opacity-25" src={buildingImage} />
      <div className="relative z-1 max-w-customer-agent-copy">
        <p className="text-customer-agent-intro font-semibold leading-customer-agent-intro text-brand-700 max-landing-mobile:text-title-28">Become a Agent.</p>
        <h2 className="mt-4 max-w-customer-agent-title text-customer-agent-title font-bold leading-customer-agent-title text-landing-text-heading max-landing-tablet:text-display-40 max-landing-mobile:text-customer-agent-title-mobile">
          Ready to Sell Your Property?
        </h2>
        <p className="mt-5 max-w-customer-agent-description text-body-20 text-text-grey-shade">
          List your property, reach potential buyers, and manage your listings with ease.
        </p>
        <Link className="mt-8 inline-flex h-landing-customer-cta-height w-landing-customer-cta-width items-center justify-center rounded-button bg-brand-700 text-label-14 font-medium text-white transition-colors hover:bg-brand-800" to="/signup">
          Register Now
        </Link>
      </div>
    </section>
  )
}
