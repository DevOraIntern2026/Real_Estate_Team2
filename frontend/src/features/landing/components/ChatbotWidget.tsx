import chatbotIcon from '@/assets/images/chatbot.svg'

export function ChatbotWidget() {
  return (
    <a
      aria-label="Chat with Homli"
      className="fixed bottom-6 right-6 z-50 flex size-14 items-center justify-center rounded-full bg-brand-700 shadow-2 transition-transform duration-200 ease-out hover:scale-105 active:scale-90 max-landing-mobile:bottom-4 max-landing-mobile:right-4"
      href="#contact"
    >
      <img alt="" className="size-8" src={chatbotIcon} />
    </a>
  )
}
