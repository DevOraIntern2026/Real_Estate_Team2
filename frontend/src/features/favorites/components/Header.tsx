import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthBrand } from '@/features/auth/components/shared/AuthBrand'
import { useLogout } from '@/features/auth/hooks/useLogout'
import { HeartIcon } from '@/features/landing/components/LandingIcons'
import { getAuthSession } from '@/services/api/tokenStorage'
import {
  ChevronDownIcon,
  MenuIcon,
  NotificationIcon,
} from '@/features/customer/components/CustomerIcons'

const navigation = [
  { label: 'Home', href: '/customer-home' },
  { label: 'Search', href: '/customer-search' },
  { label: 'Sell', href: '/customer-home#contact' },
  { label: 'About', href: '/customer-home#about' },
]

export function Header({ activePage = 'Home' }: { activePage?: string }) {
  const navigate = useNavigate()
  const authSession = getAuthSession()
  const displayName = authSession?.name || 'Customer'
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
  const logoutMutation = useLogout()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)

  const closeMenus = () => {
    setIsMenuOpen(false)
    setIsProfileOpen(false)
    setIsNotificationsOpen(false)
  }

  const handleLogout = () => {
    closeMenus()
    logoutMutation.mutate(
      { flag: 1 },
      {
        onSettled: () => navigate('/login', { replace: true }),
      },
    )
  }

  const navigationLinks = navigation.map((item) =>
    item.href.startsWith('/') ? (
      <Link
        className={`text-landing-nav hover:text-brand-700 font-medium whitespace-nowrap transition-colors ${item.label === activePage ? 'text-brand-700' : 'text-text-grey-dark'}`}
        key={item.label}
        onClick={closeMenus}
        to={item.href}
      >
        {item.label}
      </Link>
    ) : (
      <a
        className={`text-landing-nav hover:text-brand-700 font-medium whitespace-nowrap transition-colors ${item.label === activePage ? 'text-brand-700' : 'text-text-grey-dark'}`}
        href={item.href}
        key={item.label}
        onClick={closeMenus}
      >
        {item.label}
      </a>
    ),
  )

  return (
    <header className="min-h-landing-customer-header max-w-landing rounded-b-landing-header bg-bg-white px-landing-header-x shadow-1 max-landing-tablet:gap-4 max-landing-tablet:px-6 max-landing-mobile:gap-2 max-landing-mobile:px-4 relative z-20 mx-auto flex w-full items-center justify-between gap-6">
      <AuthBrand href="/customer-home" variant="landing" />

      <nav
        aria-label="Main navigation"
        className="gap-landing-nav hidden items-center lg:flex"
      >
        {navigationLinks}
      </nav>

      <div className="text-brand-700 max-landing-tablet:gap-3 max-landing-mobile:gap-2 flex shrink-0 items-center gap-8">
        <a
          aria-label="View featured properties"
          className="size-landing-action-icon flex items-center justify-center"
          href="#recommended"
          onClick={closeMenus}
        >
          <HeartIcon className="size-landing-action-icon" />
        </a>

        <div className="relative">
          <button
            aria-expanded={isNotificationsOpen}
            aria-label="Notifications"
            className="size-landing-action-icon relative flex items-center justify-center"
            onClick={() => {
              setIsNotificationsOpen((open) => !open)
              setIsProfileOpen(false)
            }}
            type="button"
          >
            <NotificationIcon className="size-landing-action-icon" />
            <span
              aria-hidden="true"
              className="bg-brand-yellow absolute top-0 right-0 size-2 rounded-full"
            />
          </button>
          {isNotificationsOpen && (
            <div className="w-landing-header-menu rounded-inner border-border-grey-shade text-label-14 text-text-grey-shade shadow-2 absolute top-full right-0 z-30 mt-3 border bg-white p-4">
              You’re all caught up.
            </div>
          )}
        </div>

        <div className="relative">
          <button
            aria-expanded={isProfileOpen}
            aria-label={`Account menu for ${displayName}`}
            className="h-landing-customer-profile rounded-button bg-brand-900 max-landing-mobile:h-landing-avatar-icon max-landing-mobile:pr-2 flex items-center gap-2 py-2 pr-4 pl-2 text-white"
            onClick={() => {
              setIsProfileOpen((open) => !open)
              setIsNotificationsOpen(false)
            }}
            type="button"
          >
            <span
              aria-hidden="true"
              className="size-landing-customer-avatar bg-brand-50 text-caption-12 text-brand-700 flex shrink-0 items-center justify-center rounded-full font-bold"
            >
              {initials}
            </span>
            <span className="max-w-landing-profile-name text-landing-profile-name max-landing-mobile:hidden truncate font-medium text-white">
              {displayName}
            </span>
            <ChevronDownIcon className="size-landing-small-icon text-brand-200 max-landing-mobile:hidden" />
          </button>
          {isProfileOpen && (
            <div className="w-landing-header-menu rounded-inner border-border-grey-shade shadow-2 absolute top-full right-0 z-30 mt-3 border bg-white p-3">
              <div className="border-border-grey-light border-b px-2 pb-3">
                <p className="text-body-sm text-text-grey-dark font-medium">
                  {authSession?.name || 'Customer account'}
                </p>
                <p className="text-caption-12 text-text-grey-shade mt-1">
                  Your Homli account
                </p>
              </div>
              <button
                className="rounded-button text-label-14 text-brand-700 hover:bg-brand-50 mt-2 w-full px-2 py-2 text-left disabled:opacity-50"
                disabled={logoutMutation.isPending}
                onClick={handleLogout}
                type="button"
              >
                {logoutMutation.isPending ? 'Logging out…' : 'Log out'}
              </button>
            </div>
          )}
        </div>

        <button
          aria-expanded={isMenuOpen}
          aria-label="Open navigation menu"
          className="size-landing-action-icon flex items-center justify-center lg:hidden"
          onClick={() => setIsMenuOpen((open) => !open)}
          type="button"
        >
          <MenuIcon className="size-landing-action-icon" />
        </button>
      </div>

      {isMenuOpen && (
        <nav
          aria-label="Mobile navigation"
          className="rounded-inner border-border-grey-light shadow-2 absolute top-full right-4 left-4 z-30 flex flex-col gap-5 border bg-white p-5 lg:hidden"
        >
          {navigationLinks}
          <Link
            className="text-landing-nav text-brand-700 font-medium"
            onClick={closeMenus}
            to="/customer-home"
          >
            My home
          </Link>
        </nav>
      )}
    </header>
  )
}
