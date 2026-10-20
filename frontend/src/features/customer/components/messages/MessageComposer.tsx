import { useState, type FormEvent } from 'react'
import { LoaderCircle, Link2, Send } from 'lucide-react'

export function MessageComposer({ onSend, sending = false }: { onSend: (text: string) => Promise<void>; sending?: boolean }) {
  const [text, setText] = useState('')

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!text.trim() || sending) return
    try {
      await onSend(text.trim())
      setText('')
    } catch {
      // Keep the draft in the input so the customer can retry.
    }
  }

  return (
    <form onSubmit={submit} className="mt-5">
      <div className="flex min-h-message-composer items-center gap-3 rounded-full border border-border-grey-shade bg-white px-4 py-2 transition-colors focus-within:border-brand-500">
        <button type="button" aria-label="Attachments are not supported yet" title="File attachments are not supported yet" disabled className="flex size-8 shrink-0 items-center justify-center rounded-full text-icon-grey-shade opacity-60"><Link2 aria-hidden="true" className="size-5" /></button>
        <input value={text} onChange={(event) => setText(event.target.value)} placeholder="Typing..." aria-label="Write a message" disabled={sending} className="min-w-0 flex-1 bg-transparent text-body-sm text-text-grey-dark outline-none placeholder:text-text-grey-light" />
        <button type="submit" aria-label="Send message" disabled={!text.trim() || sending} className="flex size-8 shrink-0 items-center justify-center rounded-full text-icon-grey-shade transition-colors hover:bg-brand-50 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-50">{sending ? <LoaderCircle aria-hidden="true" className="size-5 animate-spin" /> : <Send aria-hidden="true" className="size-5" />}</button>
      </div>
    </form>
  )
}
