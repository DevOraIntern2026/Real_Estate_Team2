import { useMemo } from 'react'
import { CheckCheck, LoaderCircle, RotateCw } from 'lucide-react'
import { Link } from 'react-router-dom'
import { CustomerHeader } from '../components/CustomerHeader'
import Footer from '../components/Footer'
import { NotificationGroup } from '../components/notifications/NotificationGroup'
import { useCustomerNotifications } from '../hooks/useCustomerNotifications'
import { groupNotifications } from '@/features/dashboard/Pages/Notification/groupNotifications'

export default function CustomerNotificationsPage() {
  const { items, total, loading, loadingMore, error, markingAll, markAllAsRead, markAsRead, loadOlder, retry, canLoadMore } = useCustomerNotifications()
  const groups = useMemo(() => groupNotifications(items), [items])
  const unreadCount = items.filter((item) => !item.read).length

  return (
    <div className="flex min-h-screen flex-col justify-between bg-bg-light">
      <div>
        <CustomerHeader />
        <main className="mx-auto w-full max-w-notifications px-landing-section-x py-notifications-top max-landing-tablet:px-6 max-landing-mobile:px-4">
          <section className="mb-6 rounded-landing-header bg-white px-7 py-6 shadow-card sm:px-8">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div>
                <h1 className="text-display-40 text-landing-text-heading">Notifications</h1>
                <p className="text-body-sm text-text-grey-shade">Stay in the loop, every step of the way</p>
              </div>
              <Link className="mt-2 border-b border-brand-700 pb-1 text-title-18 font-medium text-brand-700" to="/customer-home">Go to home</Link>
            </div>
            <button type="button" disabled={unreadCount === 0 || markingAll || loading} onClick={() => void markAllAsRead()} className="mt-6 inline-flex min-h-9 items-center gap-2 rounded-full bg-brand-700 px-4 py-2 text-body-sm font-medium text-white transition-colors hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-50">
              {markingAll ? <LoaderCircle className="size-4 animate-spin" /> : <CheckCheck className="size-4" />}
              Mark all as read
            </button>
          </section>

          {error && <div className="mb-4 flex items-center justify-between gap-4 rounded-inner border border-danger/30 bg-white px-4 py-3 text-label-14 text-danger-ink" role="alert">{error}<button type="button" className="font-medium underline" onClick={retry}>Try again</button></div>}
          {loading ? (
            <div className="flex min-h-notifications-state items-center justify-center text-brand-700"><LoaderCircle aria-label="Loading notifications" className="size-7 animate-spin" /></div>
          ) : items.length === 0 ? (
            <div className="flex min-h-notifications-state flex-col items-center justify-center text-center">
              <span className="mb-4 flex size-14 items-center justify-center rounded-full bg-brand-50 text-brand-700"><CheckCheck className="size-7" /></span>
              <h2 className="text-title-22 font-semibold text-text-grey-dark">You’re all caught up</h2>
              <p className="mt-2 text-body-sm text-text-grey-shade">New updates about your account and properties will appear here.</p>
            </div>
          ) : (
            <>
              {groups.map((group) => <NotificationGroup key={group.key} label={group.label} items={group.items} onRead={(id) => void markAsRead(id)} />)}
              {canLoadMore && <div className="flex flex-col items-center gap-2 py-5">
                <button type="button" disabled={loadingMore} onClick={loadOlder} className="inline-flex items-center gap-3 rounded-full px-4 py-2 text-body-sm text-text-grey-shade transition-colors hover:bg-bg-surface-variant disabled:opacity-60">
                  {loadingMore ? <LoaderCircle className="size-5 animate-spin" /> : <RotateCw className="size-5" />}
                  Load older notifications
                </button>
                <p className="text-label-14 text-brand-700">Showing {items.length} of {total} total updates</p>
              </div>}
            </>
          )}
        </main>
      </div>
      <Footer />
    </div>
  )
}
