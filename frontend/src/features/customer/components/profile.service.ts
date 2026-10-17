import { mockInquiries, mockUser } from '../mocks/mock-data'
import type { Inquiry, InquiryQuery, Paginated } from '../schema/inquiry.schema'
import type { User } from '../types/user'

const wait = (ms = 400) => new Promise((r) => setTimeout(r, ms))

export const profileService = {
  async getMe(): Promise<User> {
    await wait()
    return mockUser // (await api.get<User>('/users/me')).data
  },

  async updateMe(data: Partial<User>): Promise<User> {
    await wait()
    return { ...mockUser, ...data } // api.patch('/users/me', data)
  },

  async getInquiries(q: InquiryQuery): Promise<Paginated<Inquiry>> {
    await wait()
    const term = q.search.trim().toLowerCase()
    let list = mockInquiries.filter(
      (i) =>
        (q.status === 'all' || i.status === q.status) &&
        (!term ||
          i.property.title.toLowerCase().includes(term) ||
          i.owner.name.toLowerCase().includes(term)),
    )
    list = [...list].sort((a, b) => {
      switch (q.sort) {
        case 'oldest':
          return +new Date(a.createdAt) - +new Date(b.createdAt)
        case 'price_high':
          return b.property.price - a.property.price
        case 'price_low':
          return a.property.price - b.property.price
        default:
          return +new Date(b.createdAt) - +new Date(a.createdAt)
      }
    })
    const start = (q.page - 1) * q.limit
    return {
      items: list.slice(start, start + q.limit),
      total: list.length,
      page: q.page,
      limit: q.limit,
    }
  },
}
