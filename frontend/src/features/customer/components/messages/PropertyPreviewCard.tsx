import propertyPreview from '@/assets/images/property-available.png'

export function PropertyPreviewCard() {
  return (
    <article className="flex w-fit max-w-full items-center gap-3 rounded-inner border border-border-grey-shade bg-white p-2">
      <img alt="Apartment exterior" className="size-message-property-image shrink-0 rounded-button object-cover" src={propertyPreview} />
      <div className="min-w-0">
        <p className="truncate text-label-14 font-semibold text-text-input">EGP 25,000</p>
        <p className="mt-1 truncate text-caption-12 text-text-grey-shade">Cozy Apartment</p>
      </div>
    </article>
  )
}
