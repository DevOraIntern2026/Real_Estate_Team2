import homliMark from '@/assets/icons/homli-mark.svg'

type AuthBrandProps = {
  variant?: 'default' | 'landing'
}

export function AuthBrand({ variant = 'default' }: AuthBrandProps) {
  const isLanding = variant === 'landing'

  return (
    <a
      className={isLanding
        ? 'flex h-landing-nav-logo w-landing-nav-logo shrink-0 items-center gap-landing-logo-gap overflow-hidden no-underline max-landing-mobile:h-landing-nav-logo-mobile max-landing-mobile:w-landing-nav-logo-mobile'
        : 'flex h-auth-brand-height w-auth-brand items-center gap-2 overflow-hidden px-auth-brand-padding-x py-auth-brand-padding-y no-underline max-auth-mobile:h-20 max-auth-mobile:origin-left max-auth-mobile:scale-auth-brand'}
      href="/"
      aria-label="Homli Properties home"
    >
      <img
        className={isLanding
          ? 'h-landing-logo-mark-height w-landing-logo-mark-width shrink-0 max-landing-mobile:h-landing-logo-mark-height-mobile max-landing-mobile:w-landing-logo-mark-width-mobile'
          : 'h-auth-brand-mark-height w-auth-brand-mark-width shrink-0'}
        src={homliMark}
        alt=""
      />
      <span className="flex flex-col items-start">
        <span className={isLanding
          ? 'font-poppins text-landing-brand font-black text-brand-700 max-landing-mobile:text-landing-brand-mobile'
          : 'font-poppins text-auth-brand font-black text-brand-700'}>
          <span className="text-brand-yellow">Hom</span>li
        </span>
        <span className={isLanding
          ? 'font-poppins text-landing-brand-caption font-medium text-text-brand-muted max-landing-mobile:text-landing-brand-caption-mobile'
          : 'font-poppins text-auth-brand-caption font-medium text-text-brand-muted'}>
          PROPERTIES
        </span>
      </span>
    </a>
  )
}
