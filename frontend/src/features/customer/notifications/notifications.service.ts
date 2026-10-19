import { apiClient } from '@/services/api/apiClient'
import { normalizePaginated } from '@/features/dashboard/api/pagination'

export type CustomerNotification = {
  id: string
  type: string
  title: string
  message: string
  createdAt: string
  read: boolean
}

type NotificationDto = {
  _id?: string
  id?: string
  type?: string
  title?: string
  body?: string
  isRead?: boolean
  createdAt?: string
}

type ApiEnvelope<T> = { message?: string; data: T }
export type NotificationPage = { items: CustomerNotification[]; total: number; page: number; totalPages: number }

function mapNotification(dto: NotificationDto): CustomerNotification {
  return {
    id: dto.id ?? dto._id ?? '',
    type: dto.type ?? 'system',
    title: dto.title ?? '',
    message: dto.body ?? '',
    createdAt: dto.createdAt ?? '',
    read: Boolean(dto.isRead),
  }
}

export const customerNotificationsService = {
  async list(page: number, limit = 5): Promise<NotificationPage> {
    const response = await apiClient.get<ApiEnvelope<unknown>>('/notifications', { params: { page, limit } })
    const result = normalizePaginated<NotificationDto>(response.data.data, { page, limit })
    return { ...result, items: result.items.map(mapNotification) }
  },

  async markAllAsRead() {
    await apiClient.patch('/notifications/read-all')
  },

  async markAsRead(id: string) {
    await apiClient.patch(`/notifications/${id}/read`)
  },
}
