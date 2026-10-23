import { AuthBrand } from '@/features/auth/components/shared/AuthBrand'
import facebook from '@/assets/images/elements.svg'
import linkedin from '@/assets/images/footer-linkedin.svg'
import instagram from '@/assets/images/footer-instagram.svg'
import youtube from '@/assets/images/footer-youtube.svg'
import copyright from '@/assets/images/footer-copyright.svg'

const footerLinks = ['Home', 'Search', 'Sell', 'About', 'Contact', 'Terms & Conditions', 'Privacy Policy']

export function LandingFooter() {
  return (
    <footer className="w-full bg-bg-white px-landing-section-x py-landing-footer-y max-landing-tablet:px-6 max-landing-mobile:px-4" id="about">
      <div className="mx-auto flex w-full max-w-landing flex-wrap items-start justify-between gap-12">
        <div className="max-w-landing-footer-brand">
          <AuthBrand />
          <p className="mt-5 max-w-landing-footer-copy text-body-20 text-text-grey-shade">Your trusted partner for finding the perfect home.</p>
          <div aria-label="Social media" className="mt-6 flex items-center gap-3 text-brand-700">
            <a aria-label="Facebook" className="flex size-12 items-center justify-center rounded-full border-2 border-brand-700" href="#about"><img alt="" src={facebook} /></a>
            <a aria-label="LinkedIn" className="flex size-12 items-center justify-center rounded-full border-2 border-brand-700" href="#about"><img alt="" src={linkedin} /></a>
            <a aria-label="Instagram" className="flex size-12 items-center justify-center rounded-full border-2 border-brand-700" href="#about"><img alt="" src={instagram} /></a>
            <a aria-label="YouTube" className="flex size-12 items-center justify-center" href="#about"><img alt="" src={youtube} /></a>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <h2 className="text-title-18 font-medium text-text-grey-dark">Download Our Application</h2>
          <div className="flex flex-wrap gap-3">
            <a aria-label="Download on the App Store" className="flex h-landing-store-badge min-w-landing-store-badge items-center gap-3 rounded-inner bg-neutral-900 px-4 text-white" href="#about">
              <svg aria-hidden="true" className="size-landing-icon" fill="currentColor" viewBox="0 0 24 24"><path d="M16.7 12.8c0-2.1 1.7-3.1 1.8-3.2a3.9 3.9 0 0 0-3.1-1.7c-1.3-.1-2.5.8-3.2.8-.7 0-1.7-.8-2.8-.8a4.2 4.2 0 0 0-3.5 2.1c-1.5 2.6-.4 6.4 1.1 8.5.7 1 1.5 2.1 2.6 2.1 1 0 1.4-.7 2.7-.7s1.6.7 2.7.7c1.1 0 1.8-1 2.5-2 .8-1.1 1.1-2.2 1.1-2.3-.1 0-2-.8-2-3.5ZM14.6 6.5c.6-.7 1-1.6.9-2.5-.8 0-1.8.5-2.4 1.2-.5.6-1 1.6-.9 2.4.9.1 1.8-.4 2.4-1.1Z" /></svg>
              <span className="flex flex-col leading-tight"><span className="text-caption-10">Download on the</span><span className="text-label-14 font-medium">App Store</span></span>
            </a>
            <a aria-label="Get it on Google Play" className="flex h-landing-store-badge min-w-landing-store-badge items-center gap-3 rounded-inner bg-neutral-900 px-4 text-white" href="#about">
              <svg aria-hidden="true" className="size-landing-icon" fill="currentColor" viewBox="0 0 24 24"><path d="M4 3.8c-.3.3-.5.8-.5 1.4v13.6c0 .6.2 1.1.5 1.4L12 12 4 3.8Zm1.2-.8L14 10.3l2.6-2.5L7 2.4c-.7-.4-1.3-.3-1.8.1Zm12.5 5.7L15 11.2l3.3 3.2 2.6-1.4c.9-.5.9-1.3 0-1.8l-3.2-2.5Zm-12.5 13c.5.4 1.1.5 1.8.1l9.6-5.4-2.6-2.5-8.8 7.8Z" /></svg>
              <span className="flex flex-col leading-tight"><span className="text-caption-10">GET IT ON</span><span className="text-label-14 font-medium">Google Play</span></span>
            </a>
          </div>
        </div>
      </div>
      <div className="mx-auto mt-12 flex w-full max-w-landing flex-wrap items-center justify-between gap-5 border-t border-border-grey-light pt-6 text-body-sm text-text-grey-light">
        <div className="flex items-center gap-2"><img alt="" src={copyright} /><span>Homli Properties. All rights reserved.</span></div>
        <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-8 gap-y-3 text-label-14 font-medium text-text-grey-dark">
          {footerLinks.map((label) => <a className="hover:text-brand-700" href={label === 'Home' ? '#home' : label === 'Search' ? '#search' : label === 'Sell' ? '#sell' : '#about'} key={label}>{label}</a>)}
        </nav>
      </div>
    </footer>
  )
}
