import { HeartOff } from 'lucide-react'
import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import Footer from '../components/Footer'
import { CustomerHeader } from '@/features/customer/components/CustomerHeader'
import { PropertyCard, PropertyCardSkeleton } from '../components/PropertyCard'
import { useFavoritesStore } from '../hooks/usefavorites'
import { RecommendedProperties } from '../components/RecommendedProperties'

const grid = 'grid gap-6 sm:grid-cols-2 lg:grid-cols-3'

export default function FavoritesPage() {
  const { items, status, load, toggle } = useFavoritesStore()

  useEffect(() => {
    if (status === 'idle') void load()
  }, [status, load])

  const loading = status === 'idle' || status === 'loading'

  return (
    <>
      <CustomerHeader />
      <main className="max-w-search-page mx-auto w-full px-4 md:px-10 lg:px-20">
        {/* Favorites header */}
        <div className="rounded-outer bg-bg-white flex items-center justify-between gap-4 px-6 py-8 md:px-8">
          <h1 className="text-display-36 text-brand-950 max-sm:text-title-28 font-bold">
            Favorite ({String(items.length).padStart(2, '0')})
          </h1>
          <Link
            to="/"
            className="border-border-primary text-title-18 text-text-accent border-b-2 pb-1 font-medium"
          >
            Go to home
          </Link>
        </div>

        {status === 'error' && (
          <div
            role="alert"
            className="rounded-inner bg-error-lighter text-error-darker mt-8 p-6"
          >
            We couldn’t load your favorites.{' '}
            <button
              type="button"
              onClick={() => void load()}
              className="font-medium underline"
            >
              Try again
            </button>
          </div>
        )}

        <section aria-label="Your favorites" className={`mt-8 ${grid}`}>
          {loading &&
            Array.from({ length: 3 }, (_, i) => (
              <PropertyCardSkeleton key={i} />
            ))}
          {!loading &&
            items.map((p) => (
              <PropertyCard
                key={p._id}
                property={p}
                isFavorite
                onToggleFavorite={toggle}
              />
            ))}
        </section>

        {status === 'ready' && items.length === 0 && (
          <div className="rounded-outer bg-bg-white mt-8 flex flex-col items-center gap-4 px-6 py-16 text-center">
            <HeartOff className="text-icon-light size-10" aria-hidden />
            <p className="text-title-22 font-bold">No favorites yet</p>
            <p className="text-text-grey-shade max-w-sm">
              Tap the heart on any property to save it here.
            </p>
            <Link
              to="/search"
              className="rounded-button bg-main-primary text-main-white grid h-12 place-items-center px-8 font-medium"
            >
              Browse properties
            </Link>
          </div>
        )}

        <RecommendedProperties />
      </main>
      <Footer />
    </>
  )
}
