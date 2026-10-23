import { useEffect, useMemo, useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, LoaderCircle } from 'lucide-react'
import { CustomerHeader } from '../components/CustomerHeader'
import Footer from '../components/Footer'
import { MessageComposer } from '../components/messages/MessageComposer'
import { MessageRow } from '../components/messages/MessageRow'
import { PropertyPreviewCard } from '../components/messages/PropertyPreviewCard'
import { useCustomerChat } from '../hooks/useCustomerChat'

function dateLabel(value: string) {
  const date = new Date(value)
  if (!Number.isFinite(date.getTime())) return ''
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function CustomerMessagesPage() {
  const { chatId } = useParams<{ chatId: string }>()
  const { chat, loading, sending, error, load, sendMessage } = useCustomerChat(chatId)
  const bottomRef = useRef<HTMLDivElement>(null)
  const messages = chat?.messages ?? []
  const dateGroups = useMemo(() => messages.map((message, index) => ({
    message,
    label: dateLabel(message.createdAt),
    showDate: index === 0 || dateLabel(messages[index - 1]?.createdAt ?? '') !== dateLabel(message.createdAt),
  })), [messages])

  useEffect(() => { bottomRef.current?.scrollIntoView({ block: 'end', behavior: 'smooth' }) }, [messages.length])

  const counterpartName = chat?.owner.name ?? 'Conversation'
  const subtitle = chat?.owner.role.toLowerCase() === 'agent' ? 'Verified Agent' : 'Property Owner'

  return (
    <div className="flex min-h-screen flex-col justify-between bg-bg-light">
      <div>
        <CustomerHeader />
        <main className="mx-auto w-full max-w-landing px-landing-section-x pb-message-page-bottom pt-message-page-top max-landing-tablet:px-6 max-landing-mobile:px-4">
          <section className="mb-6 rounded-outer bg-white p-6 shadow-card sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div>
                <h1 className="text-display-40 text-landing-text-heading">{counterpartName}</h1>
                <p className="mt-1 text-label-14 text-text-grey-shade">{subtitle}</p>
              </div>
              <Link className="mt-2 border-b border-brand-700 pb-1 text-title-18 font-medium text-brand-700" to="/profile/inquiries">Go to inquiries</Link>
            </div>
          </section>

          <section aria-label={`Conversation with ${counterpartName}`} className="flex min-h-message-panel flex-col rounded-inner bg-white p-5 shadow-card sm:p-6">
            {loading ? (
              <div className="flex flex-1 items-center justify-center text-brand-700"><LoaderCircle aria-label="Loading conversation" className="size-7 animate-spin" /></div>
            ) : error && !chat ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
                <p className="text-body-sm text-error-darker" role="alert">{error}</p>
                <button type="button" onClick={() => void load()} className="text-label-14 font-medium text-brand-700 underline">Try again</button>
                <Link to="/profile/inquiries" className="inline-flex items-center gap-2 text-label-14 text-text-grey-shade"><ArrowLeft className="size-4" /> Back to inquiries</Link>
              </div>
            ) : (
              <>
                {error && <p className="mb-3 rounded-button bg-error-lighter px-4 py-2 text-label-14 text-error-darker" role="alert">{error}</p>}
                <div className="flex-1 space-y-6 overflow-y-auto pb-2" role="log" aria-label="Conversation messages" aria-live="polite">
                  {dateGroups.map(({ message, label, showDate }, index) => {
                    const mine = message.senderRole.toLowerCase() === 'customer'
                    const sender = message.senderName || (mine ? chat?.customer.name : chat?.owner.name) || ''
                    const avatar = mine ? chat?.customer.avatar : chat?.owner.avatar
                    return <div className="space-y-5" key={message.id}>
                      {showDate && label && <p className="py-1 text-center text-label-14 text-text-grey-dark">{label}</p>}
                      <MessageRow message={{
                        id: message.id,
                        sender,
                        text: message.text,
                        sentAt: message.createdAt,
                        mine,
                        avatar,
                        attachments: message.attachments,
                      }}>
                        {index === 0 && chat?.property && <PropertyPreviewCard property={chat.property} />}
                      </MessageRow>
                    </div>
                  })}
                  {!messages.length && <p className="py-12 text-center text-body-sm text-text-grey-shade">No messages yet. Start the conversation below.</p>}
                  <div ref={bottomRef} />
                </div>
                <MessageComposer onSend={sendMessage} sending={sending} />
              </>
            )}
          </section>
        </main>
      </div>
      <Footer />
    </div>
  )
}
