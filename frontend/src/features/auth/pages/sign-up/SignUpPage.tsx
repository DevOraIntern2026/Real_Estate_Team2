import {
  AuthBrand,
  AuthHero,
  AuthIntro,
} from '@/features/auth/components/shared'
import { SignUpForm } from './components/SignUpForm'
import type { SignUpFormValues } from '@/features/auth/schemas/signUpSchema'

type SignUpPageProps = {
  onSubmit?: (values: SignUpFormValues) => void
}

function SignUpPage({ onSubmit }: SignUpPageProps) {
  return (
    <main className="bg-bg-white text-text-heading max-auth-tablet:px-6 max-auth-tablet:pt-6 max-auth-tablet:pb-12 max-auth-mobile:px-5 max-auth-mobile:pt-3 max-auth-mobile:pb-9 min-h-screen px-8 pt-11 pb-16">
      <div className="max-w-auth-layout mx-auto w-full">
        <AuthBrand />
        <div className="gap-auth-layout-gap max-auth-tablet:justify-center flex w-full items-center">
          <section
            aria-labelledby="auth-title"
            className="w-auth-panel basis-auth-panel max-auth-tablet:w-full max-auth-tablet:max-w-auth-panel max-auth-tablet:flex-auto"
          >
            <AuthIntro
              description="Let’s get you all set up so you can access your personal account."
              title="Sign up"
            />
            <SignUpForm onSubmit={onSubmit} />
          </section>
          <AuthHero />
        </div>
      </div>
    </main>
  )
}

export default SignUpPage
