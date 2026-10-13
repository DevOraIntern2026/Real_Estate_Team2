import type { ListingBadge as ListingBadgeData } from '../utils/utils'

const tone: Record<ListingBadgeData['tone'], string> = {
  info: 'bg-info-lighter text-info-dark',
  error: 'bg-error-lighter text-error-dark',
}

export default function ListingBadge({ badge }: { badge: ListingBadgeData }) {
  return (
    <span
      className={`text-label-14 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 ${tone[badge.tone]}`}
    >
      {badge.tone === 'info' && (
        <span className="size-1.5 rounded-full bg-current" />
      )}
      {badge.label}
    </span>
  )
}
