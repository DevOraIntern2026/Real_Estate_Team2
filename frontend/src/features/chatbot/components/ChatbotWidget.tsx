import { useState, type FormEvent } from 'react'
import chatbotIcon from '@/assets/images/chatbot.svg'
import { useAIRecommendations } from '@/features/chatbot/hooks/useAIRecommendations'
import type { AIRecommendationResponse, ChatbotMessage } from '@/features/chatbot/types/aiRecommendation'

const suggestedPrompts = [
  'Show me 3 bedrooms option',
  'Any thing with garden',
  'What fits under 1M-EGP?',
]

export function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<ChatbotMessage[]>([])
  const recommendationMutation = useAIRecommendations()

  const createMessage = (role: ChatbotMessage['role'], text: string, recommendations?: ChatbotMessage['recommendations']): ChatbotMessage => ({
    id: `${Date.now()}-${Math.random()}`,
    role,
    text,
    recommendations,
  })

  const getAssistantMessage = (response: AIRecommendationResponse) => {
    const recommendations = response.recommendations ?? []
    if (response.unsupportedAction) return response.actionMessage || 'I can help you find a property. Tell me what you are looking for.'
    if (response.needsClarification) return response.clarificationQuestion || 'Could you share a little more about the property you need?'
    if (!response.success) return response.actionMessage || 'I could not find a suitable match. Try adjusting your requirements.'
    if (recommendations.length > 0) return `I found ${response.meta?.count ?? recommendations.length} properties that may suit you.`
    return 'I could not find a matching property. Try changing some of your requirements.'
  }

  const handleSend = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmedMessage = message.trim()
    if (!trimmedMessage || recommendationMutation.isPending) return

    setMessages((current) => [...current, createMessage('user', trimmedMessage)])
    setMessage('')

    try {
      const response = await recommendationMutation.mutateAsync({ message: trimmedMessage })
      setMessages((current) => [...current, createMessage('assistant', getAssistantMessage(response), response.recommendations ?? [])])
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Something went wrong. Please try again.'
      setMessages((current) => [...current, createMessage('assistant', errorMessage)])
    }
  }

  if (!isOpen) {
    return (
      <button
        aria-label="Open Homli chatbot"
        className="fixed bottom-6 right-6 z-50 flex size-16 items-center justify-center rounded-full bg-brand-700 shadow-2 transition-transform duration-200 ease-out hover:scale-105 active:scale-95 max-landing-mobile:bottom-4 max-landing-mobile:right-4"
        onClick={() => setIsOpen(true)}
        type="button"
      >
        <img alt="" src={chatbotIcon} />
      </button>
    )
  }

  return (
    <section
      aria-label="Homli chatbot"
      className="chatbot-panel-enter fixed bottom-6 right-6 z-50 flex h-chatbot-panel max-h-[calc(100dvh-3rem)] w-chatbot-panel max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-3xl bg-brand-800 text-brand-50 shadow-2 max-landing-mobile:bottom-4 max-landing-mobile:right-4 max-landing-mobile:h-[calc(100dvh-2rem)] max-landing-mobile:max-h-[calc(100dvh-2rem)] max-landing-mobile:w-[calc(100vw-2rem)] max-landing-mobile:max-w-[calc(100vw-2rem)] max-landing-mobile:rounded-2xl"
      role="dialog"
    >
      <header className="shrink-0 bg-brand-700 px-5 py-4 max-landing-mobile:px-4">
        <div className="flex items-center gap-3">
          <span className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-50">
            <img alt="" src={chatbotIcon} />
          </span>
          <h2 className="flex-1 text-title-18 font-semibold text-white">Homli Bot</h2>
          <button
            aria-label="Close Homli chatbot"
            className="flex size-9 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            onClick={() => setIsOpen(false)}
            type="button"
          >
            <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24">
              <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
            </svg>
          </button>
        </div>
        <p className="mt-3 max-w-chatbot-intro text-caption-12 leading-5 text-brand-50/90">
          Get helpful guidance and recommendations from Homli generative AI assistant
        </p>
      </header>

      <div aria-live="polite" aria-busy={recommendationMutation.isPending} className="flex-1 overflow-y-auto px-5 py-5 max-landing-mobile:px-4">
        {messages.length === 0 && <>
          <h3 className="text-label-14 font-semibold text-white">What would you like to explore?</h3>
          <p className="mt-1 text-caption-12 text-brand-50/75">Here are some ideas to get you started:</p>

          <div className="mt-4 flex flex-col gap-2.5">
            {suggestedPrompts.map((prompt) => (
              <button
                className="w-full rounded-full bg-brand-50 px-4 py-2.5 text-left text-caption-12 text-brand-900 transition-transform duration-150 hover:-translate-y-0.5 hover:bg-white active:scale-[0.99]"
                key={prompt}
                onClick={() => setMessage(prompt)}
                type="button"
              >
                {prompt}
              </button>
            ))}
          </div>
        </>}

        <div className="mt-5 flex flex-col gap-4">
          {messages.map((chatMessage) => (
            <div className={`flex flex-col gap-2 ${chatMessage.role === 'user' ? 'items-end' : 'items-start'}`} key={chatMessage.id}>
              <p className={`max-w-[88%] rounded-2xl px-4 py-2.5 text-caption-12 ${chatMessage.role === 'user' ? 'rounded-br-sm bg-brand-600 text-white' : 'rounded-bl-sm bg-brand-50 text-brand-900'}`}>
                {chatMessage.text}
              </p>
              {chatMessage.recommendations?.map((property) => <RecommendationCard key={property._id} property={property} />)}
            </div>
          ))}
        </div>

        {recommendationMutation.isPending && <div aria-label="Homli Bot is responding" className="mt-5 flex w-fit items-center gap-1 rounded-full bg-brand-600 px-3 py-2">
          <span className="size-1.5 animate-bounce rounded-full bg-brand-50" />
          <span className="size-1.5 animate-bounce rounded-full bg-brand-50 [animation-delay:120ms]" />
          <span className="size-1.5 animate-bounce rounded-full bg-brand-50 [animation-delay:240ms]" />
        </div>}
      </div>

      <form className="shrink-0 bg-brand-800 px-5 pb-5 pt-3 max-landing-mobile:px-4 max-landing-mobile:pb-4" onSubmit={handleSend}>
        <label className="flex min-h-12 items-center gap-3 rounded-full bg-brand-50 py-1 pl-4 pr-2 text-brand-700 shadow-inner">
          <span className="sr-only">Message Homli Bot</span>
          <input
            className="min-w-0 flex-1 bg-transparent text-caption-12 text-brand-900 outline-none placeholder:text-brand-500"
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Type your message..."
            value={message}
          />
          <button
            aria-label="Send message"
            className="flex size-9 shrink-0 items-center justify-center rounded-full text-brand-700 transition-colors hover:bg-brand-100 disabled:cursor-not-allowed disabled:opacity-40"
            disabled={!message.trim() || recommendationMutation.isPending}
            type="submit"
          >
            <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24">
              <path d="m4 4 16 8-16 8 2.5-8L4 4Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.7" />
              <path d="M6.5 12H20" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" />
            </svg>
          </button>
        </label>
      </form>
    </section>
  )
}

function RecommendationCard({ property }: { property: NonNullable<ChatbotMessage['recommendations']>[number] }) {
  const image = property.coverImage || property.images?.[0]
  const location = [property.location.area, property.location.city].filter(Boolean).join(', ')

  return (
    <article className="w-full max-w-[95%] overflow-hidden rounded-xl bg-white text-brand-900 shadow-sm">
      {image && <img alt={property.title} className="h-28 w-full object-cover" src={image} />}
      <div className="p-3">
        <h4 className="line-clamp-2 text-caption-12 font-semibold">{property.title}</h4>
        {location && <p className="mt-1 text-caption-10 text-text-grey-shade">{location}</p>}
        <div className="mt-2 flex items-center justify-between gap-2 text-caption-10 text-text-grey-shade">
          <span>{property.bedrooms} beds · {property.bathrooms} baths · {property.area} m²</span>
          <span className="shrink-0 font-semibold text-brand-700">{property.currency} {property.price.toLocaleString()}</span>
        </div>
      </div>
    </article>
  )
}
