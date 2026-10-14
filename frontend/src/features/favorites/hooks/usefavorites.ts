import { create } from 'zustand'
import { toast } from 'sonner'
import { propertyService } from '../components/property-service'
import type { Property } from '../schema/property.schema'

type Status = 'idle' | 'loading' | 'error' | 'ready'

interface FavoritesState {
  items: Property[]
  recommended: Property[]
  status: Status
  load: () => Promise<void>
  isFavorite: (id: string) => boolean
  toggle: (property: Property) => Promise<void>
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  items: [],
  recommended: [],
  status: 'idle',

  load: async () => {
    set({ status: 'loading' })
    try {
      const [items, recommended] = await Promise.all([
        propertyService.getFavorites(),
        propertyService.getRecommended(),
      ])
      set({ items, recommended, status: 'ready' })
    } catch {
      set({ status: 'error' })
    }
  },

  isFavorite: (id) => get().items.some((p) => p._id === id),

  // Optimistic update with rollback on failure
  toggle: async (property) => {
    const previous = get().items
    const removing = get().isFavorite(property._id)
    set({
      items: removing
        ? previous.filter((p) => p._id !== property._id)
        : [property, ...previous],
    })
    try {
      if (removing) await propertyService.removeFavorite(property._id)
      else await propertyService.addFavorite(property._id)
      toast.success(removing ? 'Removed from favorites' : 'Added to favorites')
    } catch {
      set({ items: previous })
      toast.error('Could not update favorites. Try again.')
    }
  },
}))
