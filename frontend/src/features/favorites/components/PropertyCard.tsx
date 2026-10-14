import { Bath, BedDouble, Heart, MapPin, Ruler, Star } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { cn, formatPrice, capitalize } from '../utils/utils'
import type { Property } from '../schema/property.schema'

interface PropertyCardProps {
  property: Property
  isFavorite: boolean
  onToggleFavorite: (property: Property) => void
}

/** Status badge: sold/rented override the transaction type */
function statusBadge(p: Property) {
  if (p.status === 'sold')
    return {
      label: 'Sold',
      tone: 'bg-error-lighter text-error-dark',
      dot: 'bg-error-dark',
    }
  if (p.status === 'rented')
    return {
      label: 'Rented',
      tone: 'bg-error-lighter text-error-dark',
      dot: 'bg-error-dark',
    }
  return p.transactionType === 'rent'
    ? {
        label: 'For Rent',
        tone: 'bg-info-lighter text-info-dark',
        dot: 'bg-info-dark',
      }
    : {
        label: 'For Buy',
        tone: 'bg-info-lighter text-info-dark',
        dot: 'bg-info-dark',
      }
}

export function PropertyCard({
  property: p,
  isFavorite,
  onToggleFavorite,
}: PropertyCardProps) {
  const [imgFailed, setImgFailed] = useState(false)
  const badge = statusBadge(p)
  const cover = p.images[0]
  const stats = [
    { Icon: BedDouble, label: `${p.bedrooms} Beds` },
    { Icon: Bath, label: `${p.bathrooms} Baths` },
    { Icon: Ruler, label: `${p.area} m²` },
  ]

  return (
    <article className="rounded-outer bg-bg-white shadow-1 flex flex-col overflow-hidden">
      <div className="bg-placeholder relative h-60 sm:h-64 xl:h-72">
        {cover && !imgFailed ? (
          <img
            src={cover}
            alt={p.title}
            loading="lazy"
            onError={() => setImgFailed(true)}
            className="size-full object-cover"
          />
        ) : (
          <div
            className="from-brand-100 to-brand-300 size-full bg-linear-to-br"
            aria-hidden
          />
        )}

        <span
          className={cn(
            'rounded-button text-title-18 absolute top-6 left-6 inline-flex items-center gap-1.5 px-4 py-2',
            badge.tone,
          )}
        >
          <span className={cn('size-1.5 rounded-full', badge.dot)} />
          {badge.label}
        </span>

        <button
          type="button"
          onClick={() => onToggleFavorite(p)}
          aria-pressed={isFavorite}
          aria-label={
            isFavorite
              ? `Remove ${p.title} from favorites`
              : `Add ${p.title} to favorites`
          }
          className="bg-main-white text-icon-primary shadow-1 absolute top-6 right-6 grid size-12 place-items-center rounded-full transition-transform active:scale-90"
        >
          <Heart className={cn('size-6', isFavorite && 'fill-current')} />
        </button>

        <span className="rounded-button bg-main-shade-01 text-title-18 text-text-accent absolute bottom-4 left-6 inline-flex items-center gap-1.5 px-4 py-2">
          <span className="bg-brand-700 size-1.5 rounded-full" />
          {capitalize(p.propertyType)}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-6">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-title-22 text-text-grey-dark font-bold">
            {p.title}
          </h3>
          {p.rating !== undefined && (
            <span className="text-label-14 text-text-grey-light flex shrink-0 items-center gap-1.5 pt-1">
              <Star
                className="fill-brand-yellow text-brand-yellow size-5"
                aria-hidden
              />
              <span className="sr-only">Rating</span>
              {p.rating.toFixed(1)}
            </span>
          )}
        </div>

        <p className="text-label-14 text-text-grey-shade flex items-center gap-2">
          <MapPin className="text-icon-primary size-4" aria-hidden />
          {p.location.city}, {p.location.country}
        </p>

        <p className="text-title-24 text-text-accent font-medium">
          {formatPrice(p.price, p.currency, p.transactionType === 'rent')}
        </p>

        <ul className="border-border-grey-shade text-caption-12 text-text-grey-shade mt-1 flex items-center justify-between border-t pt-5">
          {stats.map(({ Icon, label }) => (
            <li key={label} className="flex items-center gap-2">
              <Icon className="text-icon-primary size-5" aria-hidden />
              {label}
            </li>
          ))}
        </ul>

        <Link
          to={`/properties/${p.slug}`}
          className="rounded-button bg-main-primary text-title-18 text-main-white hover:bg-main-shade-04 mt-auto grid h-14 place-items-center font-medium transition-colors"
        >
          View Details
        </Link>
      </div>
    </article>
  )
}

export function PropertyCardSkeleton() {
  return (
    <div
      className="rounded-outer bg-bg-white shadow-1 overflow-hidden"
      aria-hidden
    >
      <div className="bg-skeleton h-60 animate-pulse sm:h-64 xl:h-72" />
      <div className="flex flex-col gap-4 p-6">
        <div className="bg-skeleton h-6 w-2/3 animate-pulse rounded" />
        <div className="bg-skeleton h-4 w-1/3 animate-pulse rounded" />
        <div className="bg-skeleton h-7 w-1/2 animate-pulse rounded" />
        <div className="rounded-button bg-skeleton mt-6 h-14 animate-pulse" />
      </div>
    </div>
  )
}
