import signupHouse from '@/assets/images/signup-house.png'

type AuthHeroProps = {
  alt?: string
}

export function AuthHero({
  alt = 'Modern home with a swimming pool',
}: AuthHeroProps) {
  return (
    <img
      className="h-auth-hero-height w-auth-hero-width basis-auth-hero-width max-auth-tablet:hidden block object-contain"
      src={signupHouse}
      alt={alt}
    />
  )
}
