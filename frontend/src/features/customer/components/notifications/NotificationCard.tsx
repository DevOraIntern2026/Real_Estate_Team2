import { Bell } from 'lucide-react'
import type { CustomerNotification } from '../../notifications/notifications.service'

export function NotificationCard({ notification, onRead }: { notification: CustomerNotification; onRead: (id: string) => void }) {
  const time = new Date(notification.createdAt)
  const validTime = Number.isFinite(time.getTime())

  return (
    <li className={`flex min-h-notification-card items-center gap-5 rounded-notification-card border border-notification-border bg-white px-6 py-4 ${notification.read ? '' : 'shadow-card'}`}>
      <span className="relative flex size-7 shrink-0 items-center justify-center text-icon-grey-dark">
        <Bell aria-hidden="true" className="size-6 stroke-2" />
        {!notification.read && <span aria-hidden="true" className="absolute -right-1 -top-1 size-2.5 rounded-full bg-danger" />}
      </span>
      <button type="button" onClick={() => !notification.read && onRead(notification.id)} className="min-w-0 flex-1 text-left" aria-label={`${notification.read ? 'Read' : 'Mark as read'}: ${notification.title}`}>
        <span className={`block text-body-20 font-bold ${notification.read ? 'text-text-grey-dark' : 'text-brand-700'}`}>{notification.title}</span>
        <span className="mt-1 block text-body-16 font-normal text-text-grey-shade">{notification.message}</span>
      </button>
      {validTime && <time className="hidden shrink-0 text-label-14 text-text-grey-shade sm:block" dateTime={time.toISOString()}>{time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</time>}
    </li>
  )
}
