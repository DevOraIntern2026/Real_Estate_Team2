import { apiClient } from '@/services/api/apiClient'

type ApiEnvelope<T> = { message?: string; data?: T }
type ApiMessage = {
  id?: string
  _id?: string
  senderRole?: string
  senderName?: string
  text?: string
  createdAt?: string
  timestamp?: string
  attachments?: Array<string | { name?: string; fileName?: string; url?: string }>
}
type ApiProperty = {
  id?: string
  _id?: string
  title?: string
  price?: number
  currency?: string
  location?: string
  thumbnail?: string
  transactionType?: string
}
type ApiChat = {
  chat_id?: string
  inquiry_id?: string
  owner?: { name?: string; avatar?: string; role?: string }
  customer?: { name?: string; avatar?: string }
  property?: ApiProperty
  messages?: ApiMessage[]
  timeline?: Array<{ date?: string; messages?: ApiMessage[] }>
}

export type CustomerChatMessage = {
  id: string
  senderRole: string
  senderName: string
  text: string
  createdAt: string
  attachments: string[]
}

export type CustomerChat = {
  id: string
  owner: { name: string; avatar: string; role: string }
  customer: { name: string; avatar: string }
  property: { id: string; title: string; price: number; currency: string; location: string; thumbnail: string; transactionType: string }
  messages: CustomerChatMessage[]
}

function mapMessage(message: ApiMessage): CustomerChatMessage {
  return {
    id: message.id ?? message._id ?? `${message.senderRole ?? 'message'}-${message.createdAt ?? ''}`,
    senderRole: message.senderRole ?? 'agent',
    senderName: message.senderName ?? '',
    text: message.text ?? '',
    createdAt: message.createdAt ?? message.timestamp ?? '',
    attachments: (message.attachments ?? []).map((attachment) => {
      if (typeof attachment === 'string') return attachment
      return attachment.name ?? attachment.fileName ?? attachment.url ?? ''
    }).filter(Boolean),
  }
}

function mapChat(chat: ApiChat): CustomerChat {
  const property = chat.property ?? {}
  const owner = chat.owner ?? {}
  const customer = chat.customer ?? {}
  const messages = chat.messages?.length
    ? chat.messages
    : (chat.timeline ?? []).flatMap((group) => group.messages ?? [])

  return {
    id: chat.chat_id ?? chat.inquiry_id ?? '',
    owner: { name: owner.name ?? 'Property agent', avatar: owner.avatar ?? '', role: owner.role ?? 'owner' },
    customer: { name: customer.name ?? '', avatar: customer.avatar ?? '' },
    property: {
      id: property.id ?? property._id ?? '',
      title: property.title ?? 'Property',
      price: property.price ?? 0,
      currency: property.currency ?? 'EGP',
      location: property.location ?? '',
      thumbnail: property.thumbnail ?? '',
      transactionType: property.transactionType ?? '',
    },
    messages: messages.map(mapMessage),
  }
}

export const inquiryChatService = {
  async getChat(chatId: string): Promise<CustomerChat> {
    const response = await apiClient.get<ApiEnvelope<ApiChat>>(`/customer/chats/${chatId}`)
    if (!response.data.data) throw new Error(response.data.message ?? 'The conversation response was empty.')
    return mapChat(response.data.data)
  },

  async sendMessage(chatId: string, text: string): Promise<CustomerChatMessage> {
    const response = await apiClient.post<ApiEnvelope<{ data?: ApiMessage } & ApiMessage>>(
      `/customer/chats/${chatId}/messages`, { text },
    )
    const payload = response.data.data
    if (!payload) throw new Error(response.data.message ?? 'The message response was empty.')
    return mapMessage(payload.data ?? payload)
  },
}
