import { mockFavoriteIds, mockProperties } from '../mocks/properties.mock'
import type { Property } from '../schema/property.schema'

const USE_MOCK = true
const delay = (ms = 450) => new Promise<void>((r) => setTimeout(r, ms))

export const propertyService = {
  async getFavorites(): Promise<Property[]> {
    if (USE_MOCK) {
      await delay()
      return mockProperties.filter((p) => mockFavoriteIds.includes(p._id))
    }
    // const { data } = await api.get<{ data }>('/favorites');
    // return data.data.map((p) => PropertySchema.parse(p));
    return []
  },

  async getRecommended(): Promise<Property[]> {
    if (USE_MOCK) {
      await delay(600)
      return mockProperties.slice(3, 6)
    }
    // const { data } = await api.get('/properties', { params: { isFeatured: true, limit: 4} });
    return []
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async addFavorite(_id: string): Promise<void> {
    if (USE_MOCK) return delay(200)
    // await api.post(`/favorites/${_id}`);
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async removeFavorite(_id: string): Promise<void> {
    if (USE_MOCK) return delay(200)
    // await api.delete(`/favorites/${_id}`);
  },
}
