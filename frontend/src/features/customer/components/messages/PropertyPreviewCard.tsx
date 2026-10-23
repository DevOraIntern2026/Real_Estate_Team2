import propertyPreview from '@/assets/images/property-available.png'

type PropertyPreview = { title: string; price: number; currency: string; location: string; thumbnail: string }

export function PropertyPreviewCard({ property }: { property: PropertyPreview }) {
  return (
    <article className="flex w-fit max-w-full items-center gap-3 rounded-inner border border-border-grey-shade bg-white p-2">
      <img alt="" className="size-message-property-image shrink-0 rounded-button object-cover" src={property.thumbnail || propertyPreview} />
      <div className="min-w-0">
        <p className="truncate text-label-14 font-semibold text-text-input">{property.currency} {property.price.toLocaleString('en-US')}</p>
        <p className="mt-1 truncate text-caption-12 text-text-grey-shade">{property.title}</p>
      </div>
    </article>
  )
}
