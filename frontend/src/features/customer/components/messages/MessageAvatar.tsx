export function MessageAvatar({ name, image, side = 'left' }: { name: string; image?: string; side?: 'left' | 'right' }) {
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase()

  return (
    <span aria-hidden="true" className={`flex size-message-avatar shrink-0 items-center justify-center overflow-hidden rounded-full text-caption-10 font-bold ${side === 'right' ? 'bg-brand-700 text-white' : 'bg-brand-100 text-brand-800'}`}>
      {image ? <img alt="" className="size-full object-cover" src={image} /> : initials}
    </span>
  )
}
