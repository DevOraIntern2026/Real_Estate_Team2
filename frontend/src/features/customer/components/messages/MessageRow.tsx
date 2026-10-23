import type { ReactNode } from 'react'
import { MessageAvatar } from './MessageAvatar'
import { MessageAttachmentCard } from './MessageAttachmentCard'

export type ConversationMessage = {
  id: string
  sender: string
  text: string
  sentAt: string
  mine: boolean
  avatar?: string
  attachments?: string[]
}

export function MessageRow({ message, children }: { message: ConversationMessage; children?: ReactNode }) {
  return (
    <article className={`flex items-start gap-2 ${message.mine ? 'justify-end' : 'justify-start'}`}>
      {!message.mine && <MessageAvatar name={message.sender} image={message.avatar} />}
      <div className={`flex min-w-0 max-w-message-bubble flex-col gap-3 ${message.mine ? 'items-end' : 'items-start'}`}>
        <div className="flex items-center gap-2">
          <span className="text-body-16 font-medium text-text-grey-dark">{message.sender}</span>
          {message.mine && <MessageAvatar name={message.sender} image={message.avatar} side="right" />}
        </div>
        <p className={`whitespace-pre-wrap break-words text-body-sm text-text-grey-dark ${message.mine ? 'text-right' : ''}`}>{message.text}</p>
        {children}
        {message.attachments?.map((fileName) => <MessageAttachmentCard key={fileName} fileName={fileName} mine={message.mine} />)}
      </div>
      {message.mine && <span className="hidden size-message-avatar shrink-0 sm:block" aria-hidden="true" />}
    </article>
  )
}
