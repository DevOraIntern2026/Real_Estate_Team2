import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AuthBrand } from '@/features/auth/components/shared/AuthBrand'
import { MenuIcon } from '@/features/customer/components/CustomerIcons'

const navigation = [
  { label: 'Home', href: '/' },
  { label: 'Search', href: '/search' },
  { label: 'Sell', href: '/#sell' },
  { label: 'About', href: '/#about' },
]

export function LandingHeader({ activePage = 'Home' }: { activePage?: string }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const closeMenu = () => setIsMenuOpen(false)

  return (
    <header className="relative z-10 mx-auto flex min-h-landing-customer-header w-full max-w-landing items-center justify-between gap-6 rounded-b-landing-header bg-bg-white px-landing-header-x shadow-1 max-landing-tablet:flex-wrap max-landing-tablet:gap-4 max-landing-tablet:px-6 max-landing-mobile:gap-2 max-landing-mobile:px-4">
      <AuthBrand variant="landing" />
      <nav aria-label="Main navigation" className="hidden items-center gap-landing-nav lg:flex">
        {navigation.map((item) => item.href.startsWith('/') ? (
          <Link className={`whitespace-nowrap text-landing-nav font-medium transition-colors hover:text-brand-700 ${item.label === activePage ? 'text-brand-700' : 'text-text-grey-dark'}`} key={item.label} to={item.href}>{item.label}</Link>
        ) : (
          <a className={`whitespace-nowrap text-landing-nav font-medium transition-colors hover:text-brand-700 ${item.label === activePage ? 'text-brand-700' : 'text-text-grey-dark'}`} href={item.href} key={item.label}>{item.label}</a>
        ))}
      </nav>
      <div className="order-3 mx-auto flex w-full max-w-[22rem] shrink-0 items-center justify-center gap-3 pb-4 lg:order-none lg:mx-0 lg:w-auto lg:pb-0">
        <Link className="inline-flex h-12 min-w-landing-nav-button items-center justify-center rounded-button bg-brand-700 px-4 text-body-sm font-medium text-main-white transition-colors hover:bg-brand-800 max-landing-tablet:h-10 max-landing-tablet:min-w-0 max-landing-tablet:flex-1 max-landing-tablet:rounded-full max-landing-tablet:px-4 max-landing-tablet:text-caption-12" to="/signup">
          Sign up
        </Link>
        <Link className="inline-flex h-12 min-w-landing-nav-button items-center justify-center rounded-button border-2 border-brand-700 bg-bg-white px-4 text-body-sm font-medium text-brand-700 transition-colors hover:bg-brand-50 max-landing-tablet:h-10 max-landing-tablet:min-w-0 max-landing-tablet:flex-1 max-landing-tablet:rounded-full max-landing-tablet:px-4 max-landing-tablet:text-caption-12" to="/login">
          Login
        </Link>
      </div>
      <button aria-expanded={isMenuOpen} aria-label="Open navigation menu" className="order-2 flex size-landing-action-icon items-center justify-center text-brand-700 lg:hidden" onClick={() => setIsMenuOpen((open) => !open)} type="button">
        <MenuIcon className="size-landing-action-icon" />
      </button>
      {isMenuOpen && <div className="fixed inset-0 z-50 bg-overlay/40 lg:hidden" onClick={closeMenu}>
        <nav aria-label="Mobile navigation" aria-modal="true" className="absolute inset-y-0 left-0 flex w-[min(20rem,85vw)] flex-col gap-6 rounded-r-2xl bg-white p-6 shadow-2" onClick={(event) => event.stopPropagation()} role="dialog">
          <div className="flex items-center justify-between">
            <AuthBrand variant="landing" />
            <button aria-label="Close navigation menu" className="flex size-10 items-center justify-center rounded-full text-xl text-text-grey-dark hover:bg-brand-50" onClick={closeMenu} type="button">×</button>
          </div>
          <div className="flex flex-col gap-5 border-t border-border-grey-light pt-6">
            {navigation.map((item) => <Link className={`text-landing-nav font-medium transition-colors hover:text-brand-700 ${item.label === activePage ? 'text-brand-700' : 'text-text-grey-dark'}`} key={item.label} onClick={closeMenu} to={item.href}>{item.label}</Link>)}
          </div>
          <div className="mt-auto flex flex-col gap-3">
            <Link className="inline-flex h-12 items-center justify-center rounded-button bg-brand-700 px-4 text-body-sm font-medium text-main-white" onClick={closeMenu} to="/signup">Sign up</Link>
            <Link className="inline-flex h-12 items-center justify-center rounded-button border-2 border-brand-700 px-4 text-body-sm font-medium text-brand-700" onClick={closeMenu} to="/login">Login</Link>
          </div>
        </nav>
      </div>}
    </header>
  )
}
