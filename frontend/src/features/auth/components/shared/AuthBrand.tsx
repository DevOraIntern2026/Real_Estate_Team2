import homliMark from '@/assets/icons/homli-mark.svg'

export function AuthBrand() {
  return (
    <a
      className="h-auth-brand-height w-auth-brand px-auth-brand-padding-x py-auth-brand-padding-y max-auth-mobile:h-20 max-auth-mobile:origin-left max-auth-mobile:scale-auth-brand flex items-center gap-2 overflow-hidden no-underline"
      href="/"
      aria-label="Homli Properties home"
    >
      <img
        className="h-auth-brand-mark-height w-auth-brand-mark-width shrink-0"
        src={homliMark}
        alt=""
      />
      <span className="flex flex-col items-start">
        <span className="font-poppins text-auth-brand text-brand-700 font-black">
          <span className="text-brand-yellow">Hom</span>li
        </span>
        <span className="font-poppins text-auth-brand-caption text-text-brand-muted font-medium">
          PROPERTIES
        </span>
      </span>
    </a>
  )
}
