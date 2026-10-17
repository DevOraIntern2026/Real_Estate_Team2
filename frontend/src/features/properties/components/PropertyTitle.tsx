import { Heart, MapPin, Share2 } from 'lucide-react'
import type { Property } from '../types/types'
import { formatLocation, formatPrice, getListingBadge } from '../utils/utils'
import ListingBadge from './ListingBadge'

interface PropertyHeaderProps {
  property: Property
  isFavorite: boolean
  onToggleFavorite: () => void
}

export default function PropertyTitle({
  property,
  isFavorite,
  onToggleFavorite,
}: PropertyHeaderProps) {
  const handleShare = async () => {
    const url = window.location.href
    try {
      if (navigator.share) await navigator.share({ title: property.title, url })
      else await navigator.clipboard.writeText(url)
    } catch {
      /* user cancelled share */
    }
  }

  return (
    <section className="rounded-outer border-border-grey-shade bg-main-white border p-6">
      <div className="flex items-start justify-between gap-4">
        <ListingBadge
          badge={getListingBadge(property.transactionType, property.status)}
        />
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleShare}
            aria-label="Share property"
            className="bg-bg-surface-variant text-icon-grey-dark flex size-10 items-center justify-center rounded-full"
          >
            <Share2 size={18} />
          </button>
          <button
            type="button"
            onClick={onToggleFavorite}
            aria-pressed={isFavorite}
            className="bg-main-primary text-main-white text-label-14 flex h-10 items-center gap-2 rounded-full px-4 font-medium"
          >
            <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
            {isFavorite ? 'Saved' : 'Add to favorite'}
          </button>
        </div>
      </div>

      <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-display-36 font-bold text-[#0f0f3d]">
            {property.title}
          </h1>
          <p className="text-label-14 text-text-grey-shade mt-1 flex items-center gap-1.5">
            <MapPin size={16} /> {formatLocation(property.location)}
          </p>
        </div>
        <p className="text-display-36 font-bold text-[#0f0f3d]">
          {formatPrice(
            property.price,
            property.currency,
            property.transactionType,
          )}
        </p>
      </div>
    </section>
  )
}
