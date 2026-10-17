import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
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
  { label: 'Sell', href: '/customer-home#sell' },
  { label: 'About', href: '/customer-home#about' },
]

export function CustomerHeader({ activePage = 'Home' }: { activePage?: string }) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
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
    logoutMutation.mutate({ flag: 1 }, {
      onSettled: () => navigate('/login', { replace: true }),
    })
  }

  const handleNavigationClick = (event: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    closeMenus()
    const [targetPath, targetHash] = href.split('#')
    if (!targetHash) return

    event.preventDefault()
    const scrollToTarget = (attempt = 0) => {
      const target = document.getElementById(targetHash)
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' })
      } else if (attempt < 20) {
        window.setTimeout(() => scrollToTarget(attempt + 1), 50)
      }
    }

    if (pathname !== targetPath) navigate(href)
    else navigate(href, { replace: true })
    window.setTimeout(() => scrollToTarget(), 0)
  }

  const navigationLinks = navigation.map((item) => item.href.startsWith('/') ? (
    <Link
      className={`whitespace-nowrap text-landing-nav font-medium transition-colors hover:text-brand-700 ${item.label === activePage ? 'text-brand-700' : 'text-text-grey-dark'}`}
      key={item.label}
      onClick={(event) => handleNavigationClick(event, item.href)}
      to={item.href}
    >{item.label}</Link>
  ) : (
    <a
      className={`whitespace-nowrap text-landing-nav font-medium transition-colors hover:text-brand-700 ${item.label === activePage ? 'text-brand-700' : 'text-text-grey-dark'}`}
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

      <div className="flex shrink-0 items-center gap-8 text-brand-700 max-landing-tablet:gap-3 max-landing-mobile:gap-2">
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
            aria-label={`Account menu for ${displayName}`}
            className="flex h-landing-customer-profile items-center gap-2 rounded-button bg-brand-900 py-2 pl-2 pr-4 text-white max-landing-mobile:h-landing-avatar-icon max-landing-mobile:pr-2"
            onClick={() => {
              setIsProfileOpen((open) => !open)
              setIsNotificationsOpen(false)
            }}
            type="button"
          >
            <span aria-hidden="true" className="flex size-landing-customer-avatar shrink-0 items-center justify-center rounded-full bg-brand-50 text-caption-12 font-bold text-brand-700">
              {initials}
            </span>
            <span className="max-w-landing-profile-name truncate text-landing-profile-name font-medium text-white max-landing-mobile:hidden">
              {displayName}
            </span>
            <ChevronDownIcon className="size-landing-small-icon text-brand-200 max-landing-mobile:hidden" />
          </button>
          {isProfileOpen && (
            <div className="absolute right-0 top-full z-30 mt-3 w-landing-header-menu rounded-inner border border-border-grey-shade bg-white p-3 shadow-2">
              <div className="border-b border-border-grey-light px-2 pb-3">
                <p className="text-body-sm font-medium text-text-grey-dark">
                  {authSession?.name || 'Customer account'}
                </p>
                <p className="mt-1 text-caption-12 text-text-grey-shade">Your Homli account</p>
              </div>
              <button className="mt-2 w-full rounded-button px-2 py-2 text-left text-label-14 text-brand-700 hover:bg-brand-50 disabled:opacity-50" disabled={logoutMutation.isPending} onClick={handleLogout} type="button">
                {logoutMutation.isPending ? 'Logging out…' : 'Log out'}
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
        <div className="fixed inset-0 z-50 bg-overlay/40 lg:hidden" onClick={closeMenus}>
          <nav aria-label="Mobile navigation" aria-modal="true" className="absolute inset-y-0 left-0 flex w-[min(20rem,85vw)] flex-col gap-6 rounded-r-2xl bg-white p-6 shadow-2" onClick={(event) => event.stopPropagation()} role="dialog">
            <div className="flex items-center justify-between">
              <AuthBrand href="/customer-home" variant="landing" />
              <button aria-label="Close navigation menu" className="flex size-10 items-center justify-center rounded-full text-xl text-text-grey-dark hover:bg-brand-50" onClick={closeMenus} type="button">×</button>
            </div>
            <div className="flex flex-col gap-5 border-t border-border-grey-light pt-6">
              {navigationLinks}
              <Link className="text-landing-nav font-medium text-brand-700" onClick={closeMenus} to="/customer-home">My home</Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
