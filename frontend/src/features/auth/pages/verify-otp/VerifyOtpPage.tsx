import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  AuthBrand,
  AuthHero,
  AuthIntro,
} from '@/features/auth/components/shared'
import type { VerifyOtpFormValues } from '@/features/auth/schemas/verifyOtpSchema'
import { VerifyOtpForm } from './components/VerifyOtpForm'

type VerifyOtpPageProps = {
  onResend?: () => void
  onSubmit?: (values: VerifyOtpFormValues) => void
}

function VerifyOtpPage({ onResend, onSubmit }: VerifyOtpPageProps) {
  return (
    <main className="min-h-screen bg-bg-white px-8 py-12 text-text-heading max-auth-tablet:px-6 max-auth-tablet:py-8 max-auth-mobile:px-5 max-auth-mobile:py-6">
      <div className="mx-auto w-full max-w-auth-forgot-layout">
        <AuthBrand />
        <div className="flex items-start gap-auth-forgot-columns max-auth-tablet:justify-center">
          <section
            aria-labelledby="auth-title"
            className="w-auth-login-panel basis-auth-login-panel flex flex-col gap-auth-forgot-section pt-auth-verify-panel-offset max-auth-tablet:w-full max-auth-tablet:max-w-auth-panel max-auth-tablet:flex-auto max-auth-tablet:pt-0"
          >
            <header className="flex flex-col gap-4">
              <Link
                className="text-label-14 text-text-heading inline-flex w-fit items-center gap-1 no-underline hover:text-brand-700"
                to="/login"
              >
                <ArrowLeft aria-hidden="true" className="h-5 w-5" />
                <span>Back to login</span>
              </Link>
              <AuthIntro
                description="An authentication code has been sent to your email."
                title="Verify code"
              />
            </header>
            <VerifyOtpForm onResend={onResend} onSubmit={onSubmit} />
          </section>
          <AuthHero />
        </div>
      </div>
    </main>
  )
}

export default VerifyOtpPage
