import signupHouse from '@/assets/images/signup-house.png'

type AuthHeroProps = {
  alt?: string
  size?: 'signup' | 'login' | 'reset'
}

export function AuthHero({
  alt = 'Modern home with a swimming pool',
  size = 'signup',
}: AuthHeroProps) {
  return (
    <img
      className={`${size === 'login' ? 'h-auth-login-hero-height w-auth-login-hero-width basis-auth-login-hero-width' : size === 'reset' ? 'h-auth-hero-height w-auth-reset-hero-width basis-auth-reset-hero-width' : 'h-auth-hero-height w-auth-hero-width basis-auth-hero-width'} max-auth-tablet:hidden block object-contain`}
      src={signupHouse}
      alt={alt}
    />
  )
}
