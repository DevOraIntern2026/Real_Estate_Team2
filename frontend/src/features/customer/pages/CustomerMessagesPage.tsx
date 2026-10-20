import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CustomerHeader } from '../components/CustomerHeader'
import Footer from '../components/Footer'
import { MessageComposer } from '../components/messages/MessageComposer'
import { MessageRow, type ConversationMessage } from '../components/messages/MessageRow'
import { PropertyPreviewCard } from '../components/messages/PropertyPreviewCard'

const previewMessages: ConversationMessage[] = [
  {
    id: 'message-customer-preview',
    sender: 'Ahmed Zeyad',
    text: 'Hello, I’m interested in this property for Rent. I’d like to know more details about it. Thank you.',
    sentAt: '2026-10-11T12:00:00',
    mine: false,
    property: true,
  },
  {
    id: 'message-agent-preview',
    sender: 'Ahmed Hassan',
    text: 'Hello Ahmed! The villa is available for a private viewing this Saturday afternoon…',
    sentAt: '2026-10-12T09:00:00',
    mine: true,
    attachment: 'Cozy Apartment.PNG',
  },
]

function dateLabel(value: string) {
  return new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function CustomerMessagesPage() {
  const [messages, setMessages] = useState(previewMessages)

  const sendMessage = (text: string, file?: File) => {
    setMessages((current) => [...current, {
      id: `message-${Date.now()}`,
      sender: 'Ahmed Hassan',
      text: text || `Shared ${file?.name ?? 'an attachment'}`,
      sentAt: new Date().toISOString(),
      mine: true,
      attachment: file?.name,
    }])
  }

  return (
    <div className="flex min-h-screen flex-col justify-between bg-bg-light">
      <div>
        <CustomerHeader />
        <main className="mx-auto w-full max-w-landing px-landing-section-x pb-message-page-bottom pt-message-page-top max-landing-tablet:px-6 max-landing-mobile:px-4">
          <section className="mb-6 rounded-outer bg-white p-6 shadow-card sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div>
                <h1 className="text-display-40 text-landing-text-heading">Ahmed Hassan</h1>
                <p className="mt-1 text-label-14 text-text-grey-shade">Verified Agent</p>
              </div>
              <Link className="mt-2 border-b border-brand-700 pb-1 text-title-18 font-medium text-brand-700" to="/customer-home">Go to home</Link>
            </div>
          </section>

          <section aria-label="Conversation with Ahmed Hassan" className="flex min-h-message-panel flex-col rounded-inner bg-white p-5 shadow-card sm:p-6">
            <div className="flex-1 space-y-6 overflow-y-auto pb-2">
              {messages.map((message, index) => {
                const previous = messages[index - 1]
                const isNewDate = !previous || dateLabel(previous.sentAt) !== dateLabel(message.sentAt)
                return <div className="space-y-5" key={message.id}>
                  {isNewDate && <p className="py-1 text-center text-label-14 text-text-grey-dark">{dateLabel(message.sentAt)}</p>}
                  <MessageRow message={message}>{message.property && <PropertyPreviewCard />}</MessageRow>
                </div>
              })}
            </div>
            <MessageComposer onSend={sendMessage} />
          </section>
        </main>
      </div>
      <Footer />
    </div>
  )
}
