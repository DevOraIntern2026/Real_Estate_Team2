type AuthIntroProps = {
  description: string
  titleId?: string
  title: string
}

export function AuthIntro({ description, title, titleId = 'auth-title' }: AuthIntroProps) {
  return (
    <header>
      <h1 className="m-0 text-auth-heading leading-12 font-semibold text-text-heading max-auth-mobile:text-display-36" id={titleId}>{title}</h1>
      <p className="mt-4 mb-0 text-body-sm font-normal text-text-heading opacity-75 max-auth-mobile:text-label-14">
        {description}
      </p>
    </header>
  )
}
