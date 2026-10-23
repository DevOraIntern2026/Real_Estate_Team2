type AuthIntroProps = {
  description: string
  titleId?: string
  title: string
}

export function AuthIntro({
  description,
  title,
  titleId = 'auth-title',
}: AuthIntroProps) {
  return (
    <header>
      <h1
        className="text-auth-heading text-text-heading max-auth-mobile:text-display-36 m-0 leading-12 font-semibold"
        id={titleId}
      >
        {title}
      </h1>
      <p className="text-body-sm text-text-heading max-auth-mobile:text-label-14 mt-4 mb-0 font-normal opacity-75">
        {description}
      </p>
    </header>
  )
}
