import clsx from 'clsx'
import {
  LogOut,
  MessageSquareText,
  Pencil,
  User as UserIcon,
} from 'lucide-react'
import { useEffect } from 'react'
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import { CustomerHeader } from './CustomerHeader'
import Footer from './Footer'
import { useProfileStore } from '../hooks/useprofile'
import { useLogout } from '@/features/auth/hooks/useLogout'

const roleLabel = {
  customer: 'Property Seeker',
  owner: 'Owner',
  agent: 'Agent',
  admin: 'Admin',
} as const

const meta: Record<string, { title: string; subtitle: string }> = {
  '/profile': { title: 'Profile', subtitle: 'Manage your personal details.' },
  '/profile/inquiries': {
    title: 'My Inquiries',
    subtitle: 'Track all your property inquiries and replies from owners',
  },
  '/': { title: 'Profile', subtitle: 'Manage your personal details.' },
}

const nav = [
  { to: '/profile', label: 'Profile Setting', icon: UserIcon, end: true },
  {
    to: '/profile/inquiries',
    label: 'My Inquiries',
    icon: MessageSquareText,
    end: false,
  },
]

interface ProfileLayoutProps {
  children?: React.ReactNode
}

export function ProfileLayout({ children }: ProfileLayoutProps) {
  const { user, fetchUser } = useProfileStore()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const logoutMutation = useLogout()
  const header = meta[pathname] ?? meta['/profile']

  useEffect(() => {
    if (!user) void fetchUser()
  }, [user, fetchUser])

  const handleLogout = () => {
    logoutMutation.mutate(
      { flag: 1 },
      {
        onSettled: () => navigate('/login', { replace: true }),
      },
    )
  }

  return (
    <div className="bg-bg-light min-h-screen flex flex-col justify-between">
      <div>
        <CustomerHeader />
        <div className="max-w-search-page lg:px-grid-margin mx-auto grid gap-6 px-4 py-8 md:px-6 lg:grid-cols-[320px_1fr]">
          {/* Left Column: Sidebar Profile Card & Navigation */}
          <aside className="flex flex-col gap-6 lg:self-start">
            <div className="rounded-outer bg-main-white flex flex-col items-center p-8 text-center">
              {user ? (
                <>
                  <img
                    src={user.avatar}
                    alt=""
                    className="h-40 w-40 rounded-full object-cover"
                  />
                  <button className="text-label-14 text-text-grey-dark mt-2 flex items-center gap-2">
                    <Pencil className="text-main-primary h-4 w-4" /> Edit Profile
                  </button>
                  <h2 className="text-title-22 mt-6 font-medium text-[#0f1a3a]">
                    {user.firstName} {user.lastName}
                  </h2>
                  <p className="text-label-14 text-text-grey-shade">
                    {user.email}
                  </p>
                  <span className="bg-main-shade-01 text-caption-12 mt-2 flex items-center gap-2 rounded-full px-3 py-1">
                    <span className="bg-main-primary h-1.5 w-1.5 rounded-full" />
                    {roleLabel[user.role]}
                  </span>
                </>
              ) : (
                <div className="bg-skeleton rounded-inner h-72 w-full animate-pulse" />
              )}
            </div>

            <nav className="rounded-outer bg-main-white flex flex-col gap-2 p-5">
              {nav.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) => {
                    const active =
                      isActive || (to === '/profile' && pathname === '/')
                    return clsx(
                      'rounded-button text-title-18 flex items-center gap-3 px-6 py-4 transition-colors',
                      active
                        ? 'bg-main-primary text-main-white'
                        : 'text-text-grey-dark hover:bg-brand-50',
                    )
                  }}
                >
                  <Icon className="h-6 w-6" strokeWidth={1.5} /> {label}
                </NavLink>
              ))}
              <hr className="border-border-grey-shade my-2" />
              <button
                type="button"
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
                className="text-error-dark text-title-18 rounded-button flex w-full items-center gap-3 px-6 py-3 text-left transition-colors hover:bg-error-lighter disabled:opacity-50"
              >
                <LogOut className="h-6 w-6" strokeWidth={1.5} />{' '}
                {logoutMutation.isPending ? 'Logging out…' : 'Log out'}
              </button>
            </nav>
          </aside>

          {/* Right Column: Title Header & Content */}
          <main className="flex flex-col gap-6">
            <div className="rounded-outer bg-main-white flex items-start justify-between p-8">
              <div>
                <h1 className="text-display-40 text-[#0f1a3a]">{header.title}</h1>
                <p className="text-body-sm text-text-grey-shade">
                  {header.subtitle}
                </p>
              </div>
              <Link
                to="/customer-home"
                className="text-main-primary border-main-primary border-b font-medium"
              >
                Go to home
              </Link>
            </div>
            {children ?? <Outlet />}
          </main>
        </div>
      </div>
      <Footer />
    </div>
  )
}

