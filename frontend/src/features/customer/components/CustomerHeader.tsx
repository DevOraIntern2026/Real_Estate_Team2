import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthBrand } from '@/features/auth/components/shared/AuthBrand'
import { HeartIcon } from '@/features/landing/components/LandingIcons'
import { clearAuthTokens, getAuthSession } from '@/services/api/tokenStorage'
import {
  ChevronDownIcon,
  CustomerAvatarIcon,
  MenuIcon,
  NotificationIcon,
} from '@/features/customer/components/CustomerIcons'

const navigation = [
  { label: 'Home', href: '#home' },
  { label: 'Search', href: '#search' },
  { label: 'Sell', href: '#contact' },
  { label: 'About', href: '#about' },
]

export function CustomerHeader() {
  const navigate = useNavigate()
  const authSession = getAuthSession()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)

  const closeMenus = () => {
    setIsMenuOpen(false)
    setIsProfileOpen(false)
    setIsNotificationsOpen(false)
  }

  const handleLogout = () => {
    clearAuthTokens()
    navigate('/login', { replace: true })
  }

  const navigationLinks = navigation.map((item) => (
    <a
      className="whitespace-nowrap text-landing-nav font-medium text-text-grey-dark transition-colors hover:text-brand-700 first:text-brand-700"
      href={item.href}
      key={item.label}
      onClick={closeMenus}
    >
      {item.label}
    </a>
  ))

  return (
    <header className="relative z-20 mx-auto flex min-h-landing-customer-header w-full max-w-landing items-center justify-between gap-6 rounded-b-landing-header bg-bg-white px-landing-header-x shadow-1 max-landing-tablet:gap-4 max-landing-tablet:px-6 max-landing-mobile:gap-2 max-landing-mobile:px-4">
      <AuthBrand href="/customer-home" variant="landing" />

      <nav aria-label="Main navigation" className="hidden items-center gap-landing-nav lg:flex">
        {navigationLinks}
      </nav>

      <div className="flex shrink-0 items-center gap-5 text-brand-700 max-landing-tablet:gap-3 max-landing-mobile:gap-2">
        <a aria-label="View featured properties" className="flex size-landing-action-icon items-center justify-center" href="#recommended" onClick={closeMenus}>
          <HeartIcon className="size-landing-action-icon" />
        </a>

        <div className="relative">
          <button
            aria-expanded={isNotificationsOpen}
            aria-label="Notifications"
            className="relative flex size-landing-action-icon items-center justify-center"
            onClick={() => {
              setIsNotificationsOpen((open) => !open)
              setIsProfileOpen(false)
            }}
            type="button"
          >
            <NotificationIcon className="size-landing-action-icon" />
            <span aria-hidden="true" className="absolute right-0 top-0 size-2 rounded-full bg-brand-yellow" />
          </button>
          {isNotificationsOpen && (
            <div className="absolute right-0 top-full z-30 mt-3 w-landing-header-menu rounded-inner border border-border-grey-shade bg-white p-4 text-label-14 text-text-grey-shade shadow-2">
              You’re all caught up.
            </div>
          )}
        </div>

        <div className="relative">
          <button
            aria-expanded={isProfileOpen}
            className="flex items-center gap-2 rounded-button text-text-grey-dark"
            onClick={() => {
              setIsProfileOpen((open) => !open)
              setIsNotificationsOpen(false)
            }}
            type="button"
          >
            <CustomerAvatarIcon className="size-landing-avatar-icon text-brand-700" />
            <span className="hidden max-w-40 truncate text-label-14 font-medium sm:inline">
              {authSession?.name || 'Customer'}
            </span>
            <ChevronDownIcon className="size-landing-small-icon text-icon-grey-shade" />
          </button>
          {isProfileOpen && (
            <div className="absolute right-0 top-full z-30 mt-3 w-landing-header-menu rounded-inner border border-border-grey-shade bg-white p-3 shadow-2">
              <div className="border-b border-border-grey-light px-2 pb-3">
                <p className="text-body-sm font-medium text-text-grey-dark">
                  {authSession?.name || 'Customer account'}
                </p>
                <p className="mt-1 text-caption-12 text-text-grey-shade">Your Homli account</p>
              </div>
              <button className="mt-2 w-full rounded-button px-2 py-2 text-left text-label-14 text-brand-700 hover:bg-brand-50" onClick={handleLogout} type="button">
                Log out
              </button>
            </div>
          )}
        </div>

        <button
          aria-expanded={isMenuOpen}
          aria-label="Open navigation menu"
          className="flex size-landing-action-icon items-center justify-center lg:hidden"
          onClick={() => setIsMenuOpen((open) => !open)}
          type="button"
        >
          <MenuIcon className="size-landing-action-icon" />
        </button>
      </div>

      {isMenuOpen && (
        <nav aria-label="Mobile navigation" className="absolute left-4 right-4 top-full z-30 flex flex-col gap-5 rounded-inner border border-border-grey-light bg-white p-5 shadow-2 lg:hidden">
          {navigationLinks}
          <Link className="text-landing-nav font-medium text-brand-700" onClick={closeMenus} to="/customer-home">
            My home
          </Link>
        </nav>
      )}
    </header>
  )
}
