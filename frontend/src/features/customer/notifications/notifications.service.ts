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
export const CUSTOMER_NOTIFICATIONS_UPDATED = 'customer-notifications-updated'

export function notifyCustomerNotificationsUpdated() {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(CUSTOMER_NOTIFICATIONS_UPDATED))
}

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

  async delete(id: string) {
    await apiClient.delete(`/notifications/${id}`)
  },

  async getUnreadCount(): Promise<number> {
    const response = await apiClient.get<ApiEnvelope<{ count: number }>>('/notifications/unread-count')
    return response.data.data.count ?? 0
  },
}
