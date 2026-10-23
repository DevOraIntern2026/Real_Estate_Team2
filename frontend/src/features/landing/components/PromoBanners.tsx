import rentBanner from '@/assets/images/landing-rent-banner.png'
import loanPercentage from '@/assets/images/loan-percentage.svg'
import { ArrowUpRightIcon } from '@/features/landing/components/LandingIcons'

export function PromoBanners() {
  return (
    <section aria-label="Homli offers" className="w-full px-landing-section-x pt-landing-section-gap max-landing-tablet:px-6 max-landing-mobile:px-4">
      <div className="mx-auto grid w-full max-w-landing grid-cols-2 gap-4 max-landing-tablet:grid-cols-1">
        <article className="relative flex min-h-landing-banner items-center overflow-hidden rounded-inner bg-brand-800 bg-cover bg-center p-7 text-white max-landing-mobile:p-5" style={{ backgroundImage: `url(${rentBanner})` }}>
          <div className="relative z-1 max-w-landing-banner-copy">
            <p className="text-landing-banner-title font-black max-landing-mobile:text-landing-banner-title-mobile"><span className="text-brand-50">RENT</span> YOUR DREAM HOME</p>
            <p className="mt-3 text-body-20 font-medium">Explore, rent &amp; move in right away</p>
            <a className="mt-8 inline-flex items-center gap-1 text-label-14 font-medium text-white" href="#search">Explore More <ArrowUpRightIcon className="size-landing-icon" /></a>
          </div>
        </article>
        <article className="flex min-h-landing-banner items-center justify-between gap-4 overflow-hidden rounded-inner bg-brand-900 p-6 text-white max-landing-mobile:p-5">
          <div>
            <h2 className="text-landing-offer-title font-black leading-none max-landing-mobile:text-display-36">Homli<br />Exclusive Offers</h2>
            <a className="mt-5 inline-flex items-center gap-1 rounded-md bg-brand-yellow px-2 py-1 text-label-14 font-medium text-brand-700" href="#recommended">Explore More <ArrowUpRightIcon className="size-landing-icon" /></a>
          </div>
          <img alt="" className="w-landing-offer-icon shrink-0 max-landing-mobile:w-landing-offer-icon-mobile" src={loanPercentage} />
        </article>
      </div>
    </section>
  )
}
