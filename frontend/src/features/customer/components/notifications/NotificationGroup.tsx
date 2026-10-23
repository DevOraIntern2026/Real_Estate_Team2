import type { CustomerNotification } from '../../notifications/notifications.service'
import { NotificationCard } from './NotificationCard'

export function NotificationGroup({ label, items, onRead, onDelete, deletingIds }: { label: string; items: CustomerNotification[]; onRead: (id: string) => void; onDelete: (id: string) => void; deletingIds: string[] }) {
  const latest = items[0]?.createdAt
  const latestTime = latest ? new Date(latest) : null
  const showTime = latestTime && Number.isFinite(latestTime.getTime())

  return (
    <section className="mb-5 last:mb-0">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-title-18 font-medium text-text-grey-dark">{label}</h2>
        {showTime && <time className="text-title-18 text-text-grey-shade" dateTime={latestTime.toISOString()}>{latestTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</time>}
      </div>
      <ul className="space-y-4">{items.map((item) => <NotificationCard key={item.id} notification={item} onRead={onRead} onDelete={onDelete} deleting={deletingIds.includes(item.id)} />)}</ul>
    </section>
  )
}
