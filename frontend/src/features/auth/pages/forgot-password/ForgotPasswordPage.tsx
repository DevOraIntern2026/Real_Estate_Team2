import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  AuthBrand,
  AuthHero,
  AuthIntro,
} from '@/features/auth/components/shared'
import type { ForgotPasswordFormValues } from '@/features/auth/schemas/forgotPasswordSchema'
import { ForgotPasswordForm } from './components/ForgotPasswordForm'

type ForgotPasswordPageProps = {
  onSubmit?: (values: ForgotPasswordFormValues) => void
}

function ForgotPasswordPage({ onSubmit }: ForgotPasswordPageProps) {
  return (
    <main className="bg-bg-white text-text-heading max-auth-tablet:px-6 max-auth-tablet:py-8 max-auth-mobile:px-5 max-auth-mobile:py-6 flex min-h-screen items-center px-8 py-12">
      <div className="max-w-auth-forgot-layout mx-auto w-full">
        <AuthBrand />
        <div className="mt-auth-forgot-brand-gap gap-auth-forgot-columns max-auth-tablet:justify-center flex items-center">
          <section
            aria-labelledby="auth-title"
            className="w-auth-login-panel basis-auth-login-panel gap-auth-forgot-section max-auth-tablet:w-full max-auth-tablet:max-w-auth-panel max-auth-tablet:flex-auto flex flex-col"
          >
            <div className="flex flex-col gap-4">
              <Link
                className="text-label-14 text-text-heading hover:text-brand-700 inline-flex w-fit items-center gap-1 no-underline"
                to="/login"
              >
                <ArrowLeft aria-hidden="true" className="h-5 w-5" />
                <span>Back to login</span>
              </Link>
              <AuthIntro
                description="Don’t worry, happens to all of us. Enter your email below to recover your password"
                title="Forgot your password?"
              />
            </div>
            <ForgotPasswordForm onSubmit={onSubmit} />
          </section>
          <AuthHero />
        </div>
      </div>
    </main>
  )
}

export default ForgotPasswordPage
