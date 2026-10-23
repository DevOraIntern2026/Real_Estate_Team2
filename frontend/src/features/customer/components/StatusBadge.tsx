import clsx from 'clsx'
import type { InquiryStatus } from '../schema/inquiry.schema'

const styles: Record<
  InquiryStatus,
  { label: string; wrap: string; dot: string }
> = {
  pending: {
    label: 'Pending',
    wrap: 'bg-attention-lighter text-attention-dark',
    dot: 'bg-attention-dark',
  },
  replied: {
    label: 'Replied',
    wrap: 'bg-success-light text-success-dark',
    dot: 'bg-success-dark',
  },
  closed: {
    label: 'Closed',
    wrap: 'bg-bg-surface-variant text-text-grey-light',
    dot: 'bg-icon-grey-light',
  },
}

export function StatusBadge({ status }: { status: InquiryStatus }) {
  const s = styles[status]
  return (
    <span
      className={clsx(
        'rounded-button text-label-14 inline-flex items-center gap-1.5 px-3 py-1',
        s.wrap,
      )}
    >
      <span className={clsx('h-1.5 w-1.5 rounded-full', s.dot)} />
      {s.label}
    </span>
  )
}
