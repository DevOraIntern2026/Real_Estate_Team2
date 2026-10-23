import { useCallback, useEffect, useState } from 'react'
import { Camera, ChevronLeft, ChevronRight, MapPin, X } from 'lucide-react'

interface PropertyGalleryProps {
  images: string[]
  title: string
  locationLabel: string
}

export default function PropertyGallery({
  images,
  title,
  locationLabel,
}: PropertyGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const close = useCallback(() => setLightboxIndex(null), [])
  const step = useCallback(
    (dir: 1 | -1) =>
      setLightboxIndex((i) =>
        i === null ? i : (i + dir + images.length) % images.length,
      ),
    [images.length],
  )

  useEffect(() => {
    if (lightboxIndex === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowRight') step(1)
      if (e.key === 'ArrowLeft') step(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightboxIndex, close, step])

  const [main, second] = images

  return (
    <section
      aria-label="Property photos"
      className="relative gap-4 lg:grid lg:grid-cols-2 lg:grid-rows-2"
    >
      <button
        type="button"
        onClick={() => setLightboxIndex(0)}
        className="rounded-outer bg-placeholder row-span-2 h-100 w-full overflow-hidden sm:h-95 lg:h-105"
        aria-label="Open photo gallery"
      >
        {main && (
          <img src={main} alt={title} className="h-full w-full object-cover" />
        )}
      </button>

      <button
        type="button"
        onClick={() => setLightboxIndex(1)}
        className="rounded-outer bg-placeholder relative h-60 overflow-hidden"
      >
        {second && (
          <img
            src={second}
            alt=""
            aria-hidden
            className="h-full w-full scale-110 object-cover blur-md"
          />
        )}
        <span className="bg-overlay/40 text-main-white absolute inset-0 flex flex-col items-center justify-center gap-1">
          <Camera size={25} />
          <span className="text-title-22 font-medium">Show all</span>
          <span className="text-label-14">{images.length} photos</span>
        </span>
      </button>

      <div
        className="rounded-outer border-border-grey-shade bg-bg-surface-variant relative col-start-2 h-41.5 overflow-hidden border"
        style={{
          backgroundImage:
            'linear-gradient(var(--color-border-grey-shade) 1px, transparent 1px), linear-gradient(90deg, var(--color-border-grey-shade) 1px, transparent 1px)',
          backgroundSize: '36px 36px',
        }}
      >
        <span className="bg-overlay text-main-white text-caption-12 absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 rounded-full px-3 py-1.5 whitespace-nowrap">
          <MapPin size={12} /> {locationLabel}
        </span>
      </div>
      {/* Static map placeholder — replace with Leaflet / Google Maps when ready */}

      {lightboxIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Photo gallery"
          className="bg-overlay/90 fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={close}
        >
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="text-main-white absolute top-4 right-4 p-2"
          >
            <X size={28} />
          </button>
          <button
            type="button"
            aria-label="Previous photo"
            onClick={(e) => {
              e.stopPropagation()
              step(-1)
            }}
            className="text-main-white absolute left-4 p-2"
          >
            <ChevronLeft size={36} />
          </button>
          <img
            src={images[lightboxIndex]}
            alt={`${title} — photo ${lightboxIndex + 1} of ${images.length}`}
            className="rounded-inner max-h-[85vh] max-w-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            type="button"
            aria-label="Next photo"
            onClick={(e) => {
              e.stopPropagation()
              step(1)
            }}
            className="text-main-white absolute right-4 p-2"
          >
            <ChevronRight size={36} />
          </button>
        </div>
      )}
    </section>
  )
}
