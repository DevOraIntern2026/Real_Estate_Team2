import { Link } from 'react-router-dom'
import { AuthBrand } from '@/features/auth/components/shared/AuthBrand'

const navigation = [
  { label: 'Home', href: '/' },
  { label: 'Search', href: '/search' },
  { label: 'Sell', href: '/#contact' },
  { label: 'About', href: '/#about' },
]

export default function Header({
  activePage = 'Home',
}: {
  activePage?: string
}) {
  return (
    <header className="min-h-landing-customer-header max-w-landing rounded-b-landing-header bg-bg-white px-landing-header-x shadow-1 max-landing-tablet:gap-4 max-landing-tablet:px-6 max-landing-mobile:gap-2 max-landing-mobile:px-4 relative z-10 mx-auto flex w-full items-center justify-between gap-6">
      <AuthBrand variant="landing" />
      <nav
        aria-label="Main navigation"
        className="gap-landing-nav hidden items-center lg:flex"
      >
        {navigation.map((item) =>
          item.href.startsWith('/') ? (
            <Link
              className={`text-landing-nav hover:text-brand-700 font-medium whitespace-nowrap transition-colors ${item.label === activePage ? 'text-brand-700' : 'text-text-grey-dark'}`}
              key={item.label}
              to={item.href}
            >
              {item.label}
            </Link>
          ) : (
            <a
              className={`text-landing-nav hover:text-brand-700 font-medium whitespace-nowrap transition-colors ${item.label === activePage ? 'text-brand-700' : 'text-text-grey-dark'}`}
              href={item.href}
              key={item.label}
            >
              {item.label}
            </a>
          ),
        )}
      </nav>
      <div className="max-landing-mobile:gap-2 flex shrink-0 items-center gap-2.5">
        <Link
          className="min-w-landing-nav-button rounded-button bg-brand-700 text-body-sm text-main-white hover:bg-brand-800 max-landing-mobile:h-10 max-landing-mobile:min-w-landing-mobile-nav-button max-landing-mobile:px-2 max-landing-mobile:text-caption-12 inline-flex h-12 items-center justify-center px-4 font-medium transition-colors"
          to="/signup"
        >
          Sign up
        </Link>
        <Link
          className="min-w-landing-nav-button rounded-button border-brand-700 bg-bg-white text-body-sm text-brand-700 hover:bg-brand-50 max-landing-mobile:h-10 max-landing-mobile:min-w-landing-mobile-nav-button max-landing-mobile:px-2 max-landing-mobile:text-caption-12 inline-flex h-12 items-center justify-center border-2 px-4 font-medium transition-colors"
          to="/login"
        >
          Login
        </Link>
      </div>
    </header>
  )
}
