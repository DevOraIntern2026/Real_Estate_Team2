import { apiClient } from '@/services/api/apiClient'
import type { Inquiry, InquiryQuery, Paginated } from '../schema/inquiry.schema'
import type { User } from '../types/user'

type ApiEnvelope<T> = { message?: string; data?: T }
type ApiCustomerInquiry = {
  _id?: string
  id?: string
  inquiry_id?: string
  status?: string
  createdAt?: string
  property?: {
    _id?: string
    id?: string
    slug?: string
    title?: string
    price?: number
    currency?: string
    transactionType?: string
    thumbnail?: string
    images?: string[]
    location?: { city?: string; country?: string }
  }
  owner?: { _id?: string; id?: string; name?: string; title?: string; role?: string; avatar?: string }
}
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

  async getInquiries(q: InquiryQuery): Promise<Paginated<Inquiry>> {
    const { data } = await apiClient.get<ApiEnvelope<{
      inquiries?: ApiCustomerInquiry[]
      pagination?: { page?: number; limit?: number; total?: number; totalPages?: number }
    }>>('/customer/inquiries', {
      params: {
        page: q.page,
        limit: q.limit,
        status: q.status === 'all' ? undefined : q.status,
        search: q.search || undefined,
        sort_by: q.sort,
      },
    })
    const response = data.data
    if (!response) throw new Error(data.message || 'The inquiries response was empty.')

    const items = (response.inquiries ?? []).map((item): Inquiry => {
      const property = item.property ?? {}
      const owner = item.owner ?? {}
      const images = property.images?.filter(Boolean) ?? []
      if (!images.length && property.thumbnail) images.push(property.thumbnail)
      const transactionType = property.transactionType?.toLowerCase() === 'rent' ? 'rent' : 'sale'
      const rawStatus = item.status?.toLowerCase()
      const status = rawStatus === 'replied' || rawStatus === 'responded'
        ? 'replied'
        : rawStatus === 'closed'
          ? 'closed'
          : 'pending'

      return {
        _id: item._id ?? item.inquiry_id ?? item.id ?? '',
        status,
        createdAt: item.createdAt ?? '',
        property: {
          _id: property._id ?? property.id ?? '',
          slug: property.slug ?? '',
          title: property.title ?? 'Property',
          price: Math.max(0, property.price ?? 0),
          currency: property.currency ?? 'EGP',
          transactionType,
          images,
          location: { city: property.location?.city ?? '', country: property.location?.country ?? '' },
        },
        owner: {
          _id: owner._id ?? owner.id ?? '',
          name: owner.name ?? 'Property owner',
          title: owner.title ?? owner.role ?? 'Property owner',
          avatar: owner.avatar ?? '',
        },
      }
    })

    return {
      items,
      total: response.pagination?.total ?? items.length,
      page: response.pagination?.page ?? q.page,
      limit: response.pagination?.limit ?? q.limit,
    }
  },
}
