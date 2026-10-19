import clsx from 'clsx'
import {
  LogOut,
  MessageSquareText,
  Pencil,
  User as UserIcon,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Camera, LoaderCircle, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'
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
import { getApiErrorMessage } from '@/features/auth/utils/getApiErrorMessage'
import ProfileSettingPage from '../pages/ProfileSettingPage'

const roleLabel = {
  customer: 'Property Seeker',
  owner: 'Owner',
  agent: 'Agent',
  admin: 'Admin',
} as const

const meta: Record<string, { title: string; subtitle: string }> = {
  '/profile/settings': { title: 'Profile', subtitle: 'Manage your personal details.' },
  '/profile/inquiries': {
    title: 'My Inquiries',
    subtitle: 'Track all your property inquiries and replies from owners',
  },
  '/': { title: 'Profile', subtitle: 'Manage your personal details.' },
}

const nav = [
  { to: '/profile/settings', label: 'Profile Setting', icon: UserIcon, end: true },
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
  const { user, fetchUser, uploadAvatar, removeAvatar } = useProfileStore()
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [avatarBusy, setAvatarBusy] = useState(false)
  const avatarInput = useRef<HTMLInputElement>(null)
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const logoutMutation = useLogout()
  const header = meta[pathname] ?? meta['/profile']

  useEffect(() => {
    if (!user) void fetchUser().catch(() => undefined)
  }, [user, fetchUser])

  const handleLogout = () => {
    logoutMutation.mutate(
      { flag: 1 },
      {
        onSettled: () => navigate('/login', { replace: true }),
      },
    )
  }

  const handleAvatarSelected = async (file?: File) => {
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Choose a JPG, PNG, or WebP image.')
      if (avatarInput.current) avatarInput.current.value = ''
      return
    }

    setAvatarBusy(true)
    try {
      await uploadAvatar(file)
      toast.success('Profile photo updated')
    } catch (error) {
      toast.error(error instanceof Error ? getApiErrorMessage(error) : 'Could not upload photo.')
    } finally {
      setAvatarBusy(false)
      if (avatarInput.current) avatarInput.current.value = ''
    }
  }

  const handleRemoveAvatar = async () => {
    if (!user?.avatar) return
    setAvatarBusy(true)
    try {
      await removeAvatar()
      toast.success('Profile photo removed')
      setIsDeleteConfirmOpen(false)
    } catch (error) {
      toast.error(error instanceof Error ? getApiErrorMessage(error) : 'Could not remove photo.')
    } finally {
      setAvatarBusy(false)
    }
  }

  return (
    <div className="bg-bg-light min-h-screen flex flex-col justify-between">
      <div>
        <CustomerHeader />
        <div className="max-w-search-page lg:px-grid-margin mx-auto grid gap-6 px-4 py-8 md:px-6 lg:grid-cols-[320px_1fr]">
          {/* Left Column: Sidebar Profile Card & Navigation */}
          <aside className="flex flex-col gap-6 lg:self-start">
            <div className="rounded-outer bg-main-white flex flex-col items-center p-6 text-center shadow-1">
              {user ? (
                <>
                  <input
                    ref={avatarInput}
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    type="file"
                    onChange={(event) => void handleAvatarSelected(event.target.files?.[0])}
                  />
                  <div className="group/avatar relative size-[120px]">
                    <button
                      type="button"
                      disabled={avatarBusy}
                      onClick={() => avatarInput.current?.click()}
                      aria-label="Change profile photo"
                      title="Change profile photo"
                      className="group relative size-full overflow-hidden rounded-full disabled:cursor-wait"
                    >
                      {user.avatar ? (
                        <img src={user.avatar} alt="" className="size-full object-cover" />
                      ) : (
                        <span aria-hidden="true" className="bg-brand-50 text-main-primary flex size-full items-center justify-center text-title-24 font-semibold">
                          {[user.firstName, user.lastName].filter(Boolean).map((part) => part[0]).join('').toUpperCase()}
                        </span>
                      )}
                      <span className="absolute inset-0 flex items-center justify-center bg-black/45 text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                        {avatarBusy ? <LoaderCircle className="size-6 animate-spin" /> : <Camera className="size-6" />}
                      </span>
                    </button>
                    {user.avatar && (
                      <button
                        type="button"
                        disabled={avatarBusy}
                        onClick={() => setIsDeleteConfirmOpen(true)}
                        aria-label="Delete profile photo"
                        title="Delete profile photo"
                        className="absolute -right-1 -top-1 flex size-8 items-center justify-center rounded-full border-2 border-white bg-error-dark text-white opacity-0 shadow-1 transition-opacity group-hover/avatar:opacity-100 group-focus-within/avatar:opacity-100 disabled:cursor-wait"
                      >
                        {avatarBusy ? <LoaderCircle className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                      </button>
                    )}
                  </div>
                  <button type="button" onClick={() => setIsEditProfileOpen(true)} className="text-label-14 text-text-grey-dark mt-2 flex items-center gap-2">
                    <Pencil className="text-main-primary h-4 w-4" /> Edit Profile
                  </button>
                  <h2 className="mt-4 text-[18px] font-medium text-[#0a2540]">
                    {user.firstName} {user.lastName}
                  </h2>
                  <p className="text-label-14 text-[#43474d]">
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
                    return clsx(
                      'rounded-button text-title-18 flex items-center gap-3 px-6 py-4 transition-colors',
                      isActive
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
            <div className="rounded-outer bg-main-white flex items-start justify-between p-6 shadow-1">
              <div>
                <h1 className="text-[42px] leading-[1.2] font-bold text-[#100e2c]">{header.title}</h1>
                <p className="text-label-14 text-text-grey-shade">
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
      {isEditProfileOpen && <ProfileSettingPage isModal onClose={() => setIsEditProfileOpen(false)} />}
      {isDeleteConfirmOpen && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-[#252c32]/50 p-4 backdrop-blur-[2px]"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !avatarBusy) setIsDeleteConfirmOpen(false)
          }}
        >
          <section
            aria-labelledby="delete-photo-title"
            aria-describedby="delete-photo-description"
            aria-modal="true"
            className="relative w-full max-w-[440px] rounded-[24px] bg-white p-7 shadow-2"
            role="alertdialog"
          >
            <button
              type="button"
              aria-label="Close confirmation"
              disabled={avatarBusy}
              onClick={() => setIsDeleteConfirmOpen(false)}
              className="absolute right-4 top-4 rounded-full p-2 text-text-grey-shade transition-colors hover:bg-bg-surface disabled:opacity-50"
            >
              <X className="size-5" />
            </button>
            <div className="mb-5 flex size-12 items-center justify-center rounded-full bg-error-light text-error-dark">
              <Trash2 className="size-6" />
            </div>
            <h2 id="delete-photo-title" className="text-title-22 font-semibold text-text-grey-dark">
              Delete profile photo?
            </h2>
            <p id="delete-photo-description" className="mt-2 text-label-14 leading-6 text-text-grey-shade">
              Your photo will be removed from your profile. You can upload a new one any time.
            </p>
            <div className="mt-7 flex justify-end gap-3">
              <button
                type="button"
                disabled={avatarBusy}
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="rounded-button border border-border-grey-shade px-5 py-3 text-label-14 font-medium text-text-grey-shade transition-colors hover:bg-bg-surface disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={avatarBusy}
                onClick={() => void handleRemoveAvatar()}
                className="rounded-button flex min-w-32 items-center justify-center gap-2 bg-error-dark px-5 py-3 text-label-14 font-medium text-white transition-colors hover:bg-error-darker disabled:opacity-60"
              >
                {avatarBusy && <LoaderCircle className="size-4 animate-spin" />}
                {avatarBusy ? 'Deleting…' : 'Delete photo'}
              </button>
            </div>
          </section>
        </div>
      )}
      <Footer />
    </div>
  )
}

