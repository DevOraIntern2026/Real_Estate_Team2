import { useRef, useState, type FormEvent } from 'react'
import { Link2, Paperclip, Send, X } from 'lucide-react'

export function MessageComposer({ onSend }: { onSend: (text: string, file?: File) => void }) {
  const [text, setText] = useState('')
  const [file, setFile] = useState<File>()
  const inputRef = useRef<HTMLInputElement>(null)

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!text.trim() && !file) return
    onSend(text.trim(), file)
    setText('')
    setFile(undefined)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <form onSubmit={submit} className="mt-5">
      {file && <div className="mb-2 flex items-center gap-2 text-label-14 text-text-grey-shade"><Paperclip aria-hidden="true" className="size-4" /><span className="max-w-message-file truncate">{file.name}</span><button type="button" aria-label="Remove attachment" onClick={() => { setFile(undefined); if (inputRef.current) inputRef.current.value = '' }} className="rounded-full p-1 hover:bg-bg-surface-variant"><X aria-hidden="true" className="size-4" /></button></div>}
      <div className="flex min-h-message-composer items-center gap-3 rounded-full border border-border-grey-shade bg-white px-4 py-2 transition-colors focus-within:border-brand-500">
        <input ref={inputRef} type="file" className="sr-only" onChange={(event) => setFile(event.target.files?.[0])} />
        <button type="button" aria-label="Attach a file" title="Attach a file" onClick={() => inputRef.current?.click()} className="flex size-8 shrink-0 items-center justify-center rounded-full text-icon-grey-shade transition-colors hover:bg-bg-surface-variant hover:text-brand-700"><Link2 aria-hidden="true" className="size-5" /></button>
        <input value={text} onChange={(event) => setText(event.target.value)} placeholder="Typing..." aria-label="Write a message" className="min-w-0 flex-1 bg-transparent text-body-sm text-text-grey-dark outline-none placeholder:text-text-grey-light" />
        <button type="submit" aria-label="Send message" disabled={!text.trim() && !file} className="flex size-8 shrink-0 items-center justify-center rounded-full text-icon-grey-shade transition-colors hover:bg-brand-50 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-50"><Send aria-hidden="true" className="size-5" /></button>
      </div>
    </form>
  )
}
