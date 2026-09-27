type AuthFooterLinkProps = {
  href: string
  linkLabel: string
  prompt: string
}

export function AuthFooterLink({ href, linkLabel, prompt }: AuthFooterLinkProps) {
  return (
    <p className="m-0 text-center font-inter text-label-14 text-text-input">
      {prompt}{' '}
      <a className="font-sans font-medium text-brand-700 no-underline hover:underline" href={href}>
        {linkLabel}
      </a>
    </p>
  )
}
