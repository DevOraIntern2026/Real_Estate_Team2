import { apiClient } from '@/services/api/apiClient'
import { mockInquiries } from '../mocks/mock-data'
import type { Inquiry, InquiryQuery, Paginated } from '../schema/inquiry.schema'
import type { User } from '../types/user'

type ApiEnvelope<T> = { message?: string; data?: T }
type ApiProfile = Partial<User> & {
  id?: string
  _id?: string
  profileImage?: string | null
  avatar?: string | null
  role?: User['role'] | number
}

function mapProfile(profile: ApiProfile, previous?: User): User {
  const name = profile.name?.trim()
    || [profile.firstName, profile.lastName].filter(Boolean).join(' ')
    || previous?.name
    || ''
  const [firstName = '', ...lastNameParts] = name.split(/\s+/).filter(Boolean)

  return {
    _id: profile._id ?? profile.id ?? previous?._id ?? '',
    name,
    firstName: profile.firstName ?? firstName,
    lastName: profile.lastName ?? (lastNameParts.join(' ') || ''),
    email: profile.email ?? previous?.email ?? '',
    phone: profile.phone ?? previous?.phone ?? '',
    phoneCode: previous?.phoneCode,
    gender: profile.gender ?? previous?.gender,
    location: profile.location ?? previous?.location ?? '',
    bio: profile.bio ?? previous?.bio ?? '',
    licenseNumber: profile.licenseNumber ?? previous?.licenseNumber,
    agencyName: profile.agencyName ?? previous?.agencyName,
    role: typeof profile.role === 'number'
      ? ({ 0: 'owner', 1: 'customer', 2: 'admin' } as const)[profile.role] ?? 'customer'
      : profile.role ?? previous?.role ?? 'customer',
    avatar: profile.profileImage || profile.avatar || previous?.avatar || '',
  }
}

async function profileFrom(response: Promise<{ data: ApiEnvelope<ApiProfile> }>, previous?: User) {
  const { data } = await response
  if (!data.data) throw new Error(data.message || 'The profile response was empty.')
  return mapProfile(data.data, previous)
}

export const profileService = {
  async getMe(): Promise<User> {
    return profileFrom(apiClient.get<ApiEnvelope<ApiProfile>>('/user'))
  },

  async updateMe(user: User, changes: Partial<User>): Promise<User> {
    const name = [changes.firstName ?? user.firstName, changes.lastName ?? user.lastName]
      .filter(Boolean)
      .join(' ')
    const payload = {
      name,
      email: changes.email ?? user.email,
      phone: changes.phone ?? user.phone,
      location: changes.location ?? user.location,
      bio: changes.bio ?? user.bio,
      ...(changes.licenseNumber !== undefined ? { licenseNumber: changes.licenseNumber } : {}),
      ...(changes.agencyName !== undefined ? { agencyName: changes.agencyName } : {}),
    }
    return profileFrom(apiClient.patch<ApiEnvelope<ApiProfile>>('/user', payload), user)
  },

  async uploadAvatar(user: User, file: File): Promise<User> {
    const form = new FormData()
    form.append('avatar', file)
    const { data } = await apiClient.post<ApiEnvelope<{ avatar?: string; profileImage?: string }>>(
      '/user/avatar', form, { headers: { 'Content-Type': 'multipart/form-data' } },
    )
    const avatar = data.data?.avatar ?? data.data?.profileImage
    if (!avatar) throw new Error(data.message || 'The uploaded avatar URL was not returned.')
    return { ...user, avatar }
  },

  async removeAvatar(user: User): Promise<User> {
    const { data } = await apiClient.delete<ApiEnvelope<{ avatar?: string | null; profileImage?: string | null }>>('/user/avatar')
    if (!data.data) throw new Error(data.message || 'The avatar removal response was empty.')
    return { ...user, avatar: data.data.avatar ?? data.data.profileImage ?? '' }
  },

  // Inquiry APIs were not included in the supplied endpoint documentation yet.
  async getInquiries(q: InquiryQuery): Promise<Paginated<Inquiry>> {
    const term = q.search.trim().toLowerCase()
    let list = mockInquiries.filter(
      (i) =>
        (q.status === 'all' || i.status === q.status) &&
        (!term || i.property.title.toLowerCase().includes(term) || i.owner.name.toLowerCase().includes(term)),
    )
    list = [...list].sort((a, b) => {
      switch (q.sort) {
        case 'oldest': return +new Date(a.createdAt) - +new Date(b.createdAt)
        case 'price_high': return b.property.price - a.property.price
        case 'price_low': return a.property.price - b.property.price
        default: return +new Date(b.createdAt) - +new Date(a.createdAt)
      }
    })
    const start = (q.page - 1) * q.limit
    return { items: list.slice(start, start + q.limit), total: list.length, page: q.page, limit: q.limit }
  },
}
