import chatbotIcon from '@/assets/images/chatbot.svg'

export function ChatbotWidget() {
  return (
    <div className="relative mx-auto flex h-landing-chatbot-row w-full max-w-landing items-center justify-end pr-landing-chatbot-right max-landing-mobile:pr-4">
      <a aria-label="Chat with Homli" className="flex size-28 items-center justify-center rounded-full bg-brand-700" href="#contact">
        <img alt="" src={chatbotIcon} />
      </a>
    </div>
  )
}
