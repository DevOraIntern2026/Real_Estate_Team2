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
        <nav aria-label="Footer navigation" className="grid grid-cols-2 gap-x-12 gap-y-5 text-body-sm font-medium text-text-grey-dark sm:grid-cols-3">
          {footerLinks.map((label) => <a className="hover:text-brand-700" href={label === 'Home' ? '#home' : label === 'Search' ? '#search' : label === 'Sell' ? '#contact' : '#about'} key={label}>{label}</a>)}
        </nav>
      </div>
      <div className="mx-auto mt-12 flex w-full max-w-landing items-center gap-2 border-t border-border-grey-light pt-6 text-body-sm text-text-grey-light">
        <img alt="" src={copyright} />
        <span>Homli Properties. All rights reserved.</span>
      </div>
    </footer>
  )
}
