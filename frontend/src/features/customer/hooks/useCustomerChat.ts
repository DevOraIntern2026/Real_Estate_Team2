import { useCallback, useEffect, useState } from 'react'
import { inquiryChatService, type CustomerChat } from '../notifications/inquiryChat.service'

export function useCustomerChat(chatId?: string) {
  const [chat, setChat] = useState<CustomerChat | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    if (!chatId) {
      setError('The inquiry ID is missing.')
      setLoading(false)
      return
    }
    setLoading(true)
    setError('')
    try {
      setChat(await inquiryChatService.getChat(chatId))
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not load this conversation.')
    } finally {
      setLoading(false)
    }
  }, [chatId])

  useEffect(() => { void load() }, [load])

  const sendMessage = async (text: string) => {
    if (!chatId || !text.trim() || sending) return
    setSending(true)
    setError('')
    try {
      const message = await inquiryChatService.sendMessage(chatId, text.trim())
      setChat((current) => current ? { ...current, messages: [...current.messages, message] } : current)
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : 'Could not send this message.'
      setError(message)
      throw requestError
    } finally {
      setSending(false)
    }
  }

  return { chat, loading, sending, error, load, sendMessage }
}
