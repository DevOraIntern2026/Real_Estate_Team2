import { Download, FileText } from 'lucide-react'

export function MessageAttachmentCard({ fileName, mine }: { fileName: string; mine: boolean }) {
  return (
    <div className={`flex w-fit max-w-full items-center gap-3 rounded-inner border border-border-grey-shade bg-white px-2 py-2 ${mine ? 'ml-auto' : ''}`}>
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-700 text-white">
        <FileText aria-hidden="true" className="size-4" />
      </span>
      <span className="max-w-message-file truncate text-caption-12 font-medium text-text-grey-dark">{fileName}</span>
      <Download aria-hidden="true" className="size-4 shrink-0 text-icon-grey-dark" />
    </div>
  )
}
