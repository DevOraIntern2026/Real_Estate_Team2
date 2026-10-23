type AuthFooterLinkProps = {
  href: string
  linkLabel: string
  prompt: string
}

export function AuthFooterLink({
  href,
  linkLabel,
  prompt,
}: AuthFooterLinkProps) {
  return (
    <p className="font-inter text-label-14 text-text-input m-0 text-center">
      {prompt}{' '}
      <a
        className="text-brand-700 font-sans font-medium no-underline hover:underline"
        href={href}
      >
        {linkLabel}
      </a>
    </p>
  )
}
