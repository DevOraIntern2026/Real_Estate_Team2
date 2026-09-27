import signupHouse from '@/assets/images/signup-house.png'

type AuthHeroProps = {
  alt?: string
}

export function AuthHero({ alt = 'Modern home with a swimming pool' }: AuthHeroProps) {
  return <img className="block h-auth-hero-height w-auth-hero-width basis-auth-hero-width object-contain max-auth-tablet:hidden" src={signupHouse} alt={alt} />
}
