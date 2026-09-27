import homliMark from '@/assets/icons/homli-mark.svg'

export function AuthBrand() {
  return (
    <a className="flex h-auth-brand-height w-auth-brand items-center gap-2 overflow-hidden px-auth-brand-padding-x py-auth-brand-padding-y no-underline max-auth-mobile:h-20 max-auth-mobile:origin-left max-auth-mobile:scale-auth-brand" href="/" aria-label="Homli Properties home">
      <img className="h-auth-brand-mark-height w-auth-brand-mark-width shrink-0" src={homliMark} alt="" />
      <span className="flex flex-col items-start">
        <span className="font-poppins text-auth-brand font-black text-brand-700"><span className="text-brand-yellow">Hom</span>li</span>
        <span className="font-poppins text-auth-brand-caption font-medium text-text-brand-muted">PROPERTIES</span>
      </span>
    </a>
  )
}
