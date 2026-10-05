import homeMask from '@/assets/images/landing-home-mask.png'
import homeRender from '@/assets/images/landing-home-render.png'

type HeroArtworkProps = {
  className: string
}

export function HeroArtwork({ className }: HeroArtworkProps) {
  return (
    <div className={className}>
      <div
        aria-hidden="true"
        className="absolute inset-0 overflow-hidden"
        style={{
          maskImage: `url("${homeMask}")`,
          maskRepeat: 'no-repeat',
          maskSize: '100% 100%',
          WebkitMaskImage: `url("${homeMask}")`,
          WebkitMaskRepeat: 'no-repeat',
          WebkitMaskSize: '100% 100%',
        }}
      >
        <img
          alt=""
          className="absolute left-landing-render-left top-landing-render-top h-landing-render-height w-landing-render-width max-w-none object-fill mix-blend-multiply"
          src={homeRender}
        />
      </div>
    </div>
  )
}
