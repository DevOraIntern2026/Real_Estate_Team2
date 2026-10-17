import { Link } from 'react-router-dom'
import { AuthBrand } from '@/features/auth/components/shared/AuthBrand'

const navigation = [
  { label: 'Home', href: '/' },
  { label: 'Search', href: '/search' },
  { label: 'Sell', href: '/#sell' },
  { label: 'About', href: '/#about' },
]

export function LandingHeader({ activePage = 'Home' }: { activePage?: string }) {
  return (
    <header className="relative z-10 mx-auto flex min-h-landing-customer-header w-full max-w-landing items-center justify-between gap-6 rounded-b-landing-header bg-bg-white px-landing-header-x shadow-1 max-landing-tablet:gap-4 max-landing-tablet:px-6 max-landing-mobile:gap-2 max-landing-mobile:px-4">
      <AuthBrand variant="landing" />
      <nav aria-label="Main navigation" className="hidden items-center gap-landing-nav lg:flex">
        {navigation.map((item) => item.href.startsWith('/') ? (
          <Link className={`whitespace-nowrap text-landing-nav font-medium transition-colors hover:text-brand-700 ${item.label === activePage ? 'text-brand-700' : 'text-text-grey-dark'}`} key={item.label} to={item.href}>{item.label}</Link>
        ) : (
          <a className={`whitespace-nowrap text-landing-nav font-medium transition-colors hover:text-brand-700 ${item.label === activePage ? 'text-brand-700' : 'text-text-grey-dark'}`} href={item.href} key={item.label}>{item.label}</a>
        ))}
      </nav>
      <div className="flex shrink-0 items-center gap-2.5 max-landing-mobile:gap-2">
        <Link className="inline-flex h-12 min-w-landing-nav-button items-center justify-center rounded-button bg-brand-700 px-4 text-body-sm font-medium text-main-white transition-colors hover:bg-brand-800 max-landing-mobile:h-10 max-landing-mobile:min-w-landing-mobile-nav-button max-landing-mobile:px-2 max-landing-mobile:text-caption-12" to="/signup">
          Sign up
        </Link>
        <Link className="inline-flex h-12 min-w-landing-nav-button items-center justify-center rounded-button border-2 border-brand-700 bg-bg-white px-4 text-body-sm font-medium text-brand-700 transition-colors hover:bg-brand-50 max-landing-mobile:h-10 max-landing-mobile:min-w-landing-mobile-nav-button max-landing-mobile:px-2 max-landing-mobile:text-caption-12" to="/login">
          Login
        </Link>
      </div>
    </header>
  )
}
