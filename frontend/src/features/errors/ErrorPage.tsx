import { Link } from 'react-router-dom'
import unauthorizedBackground from '@/assets/images/errors/401-background.svg'
import unauthorizedNumber from '@/assets/images/errors/401-number.svg'
import unauthorizedCharacter from '@/assets/images/errors/401-character.svg'
import unauthorizedLabel from '@/assets/images/errors/401-unauthorized.svg'
import fenceIllustration from '@/assets/images/errors/403-fence.svg'
import stopSignIllustration from '@/assets/images/errors/403-sign.svg'
import forbiddenNumber from '@/assets/images/errors/403-number.svg'
import missingPageBackground from '@/assets/images/errors/404-background.svg'
import missingPageAccent from '@/assets/images/errors/404-simple.svg'
import illustrationFloor from '@/assets/images/errors/404-floor.svg'
import missingPageCharacter from '@/assets/images/errors/404-character.svg'
import missingPageNumber from '@/assets/images/errors/404-number.svg'

type ErrorCode = 401 | 403 | 404

const errorCopy: Record<ErrorCode, { title: string; description: string; action: string; href: string }> = {
  401: { title: 'Unauthorized', description: 'Please sign in to continue.', action: 'Sign in', href: '/login' },
  403: { title: 'Access denied', description: 'You don’t have permission to view this page.', action: 'Go to home page', href: '/' },
  404: { title: 'Page not found', description: 'The page you’re looking for may have moved or no longer exists.', action: 'Go to home page', href: '/' },
}

function ErrorIllustration({ code }: { code: ErrorCode }) {
  if (code === 401) {
    return (
      <div className="relative aspect-[530/421.35] w-[min(530px,82vw)] flex-none overflow-hidden rounded-[50%] bg-brand-50" aria-hidden="true">
        <img className="absolute left-[10.88%] top-[47.98%] block h-auto w-[75.4%]" src={unauthorizedBackground} alt="" />
        <img className="absolute left-[15.71%] top-[4.16%] block h-auto w-[57.3%]" src={unauthorizedNumber} alt="" />
        <img className="absolute left-[35.6%] top-[1.77%] block h-auto w-[31.3%]" src={unauthorizedCharacter} alt="" />
        <img className="absolute left-[16.01%] top-[33.16%] block h-auto w-[28.73%]" src={unauthorizedLabel} alt="" />
      </div>
    )
  }

  if (code === 403) {
    return (
      <div className="relative h-[min(634px,76vh)] min-h-landing-footer-copy w-[min(530px,82vw)] flex-none border-b-[3px] border-solid border-[#e0e0e0]" aria-hidden="true">
        <img className="absolute left-[37.52%] top-0 block max-w-none" src={forbiddenNumber} alt="" />
        <img className="absolute left-0 top-[calc(17.87%+0.54px)] block max-w-none" src={stopSignIllustration} alt="" />
        <img className="absolute left-[38.44%] top-[calc(59.92%+1.8px)] block max-w-none" src={fenceIllustration} alt="" />
      </div>
    )
  }

  return (
    <div className="relative aspect-[552.218/551.241] w-[min(552.218px,82vw)] flex-none" aria-hidden="true">
      <img className="absolute left-[11.3%] top-[3.09%] block max-w-none" src={missingPageBackground} alt="" />
      <img className="absolute left-[13.68%] top-[21.03%] block max-w-none" src={missingPageAccent} alt="" />
      <img className="absolute left-0 top-[35.64%] block max-w-none" src={missingPageCharacter} alt="" />
      <img className="absolute left-[18.7%] top-[4%] block max-w-none" src={missingPageNumber} alt="" />
      <img className="absolute bottom-[3.82%] left-[1.34%] block max-w-none" src={illustrationFloor} alt="" />
    </div>
  )
}

export default function ErrorPage({ code }: { code: ErrorCode }) {
  const copy = errorCopy[code]

  return (
    <main className="grid min-h-screen place-items-center overflow-hidden bg-bg-surface px-6 py-10 font-sans text-brand-700 max-[600px]:px-5 max-[600px]:py-6" data-error-code={code}>
      <section className="flex w-full max-w-223 flex-col items-center gap-5.75 text-center max-[600px]:gap-7" aria-labelledby="error-title">
        <ErrorIllustration code={code} />
        <div className="flex flex-col items-center gap-2">
          <h1 id="error-title" className="m-0 text-[58px] leading-customer-agent-titlemer-agent-title font-bold text-brand-700 max-[600px]:text-[clamp(38px,10vw,48px)]">{copy.title}</h1>
          <p className="m-0 max-w-[36ch] text-2xl leading-[1.3] font-semibold text-text-grey-light max-[600px]:text-[17px]">{copy.description}</p>
          <Link className="mt-5 grid min-h-12 w-[min(368px,84vw)] place-items-center rounded-full bg-brand-700 px-4 py-3 text-base font-medium text-white no-underline transition duration-200 hover:-translate-y-px hover:bg-brand-600 focus-visible:outline-3 focus-visible:outline-offset-[3px] focus-visible:outline-brand-400 max-[600px]:mt-3.5" to={copy.href}>{copy.action}</Link>
        </div>
      </section>
    </main>
  )
}
