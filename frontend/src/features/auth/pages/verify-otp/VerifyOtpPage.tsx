import { ArrowLeft } from 'lucide-react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import {
  AuthBrand,
  AuthHero,
  AuthIntro,
} from '@/features/auth/components/shared'
import { useForgotPassword } from '@/features/auth/hooks/useForgotPassword'
import type { VerifyOtpFormValues } from '@/features/auth/schemas/verifyOtpSchema'
import { VerifyOtpForm } from './components/VerifyOtpForm'

type ForgotPasswordLocationState = {
  email?: string
}

function VerifyOtpPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const state = location.state as ForgotPasswordLocationState | null
  const email =
    state?.email ?? new URLSearchParams(location.search).get('email') ?? ''
  const forgotPasswordMutation = useForgotPassword()

  const handleVerifyCode = (values: VerifyOtpFormValues) => {
    navigate('/reset-password', {
      state: { email, otp: values.code },
    })
  }

  if (!email) return <Navigate replace to="/forgot-password" />

  return (
    <main className="bg-bg-white text-text-heading max-auth-tablet:px-6 max-auth-tablet:py-8 max-auth-mobile:px-5 max-auth-mobile:py-6 min-h-screen px-8 py-12">
      <div className="max-w-auth-forgot-layout mx-auto w-full">
        <AuthBrand />
        <div className="gap-auth-forgot-columns max-auth-tablet:justify-center flex items-start">
          <section
            aria-labelledby="auth-title"
            className="w-auth-login-panel basis-auth-login-panel gap-auth-forgot-section pt-auth-verify-panel-offset max-auth-tablet:w-full max-auth-tablet:max-w-auth-panel max-auth-tablet:flex-auto max-auth-tablet:pt-0 flex flex-col"
          >
            <header className="flex flex-col gap-4">
              <Link
                className="text-label-14 text-text-heading hover:text-brand-700 inline-flex w-fit items-center gap-1 no-underline"
                to="/login"
              >
                <ArrowLeft aria-hidden="true" className="h-5 w-5" />
                <span>Back to login</span>
              </Link>
              <AuthIntro
                description={`An authentication code has been sent to ${email}.`}
                title="Verify code"
              />
            </header>
            <VerifyOtpForm
              email={email}
              isResending={forgotPasswordMutation.isPending}
              onResend={(targetEmail) =>
                forgotPasswordMutation.mutateAsync({ email: targetEmail }).then(() => undefined)
              }
              onSubmit={handleVerifyCode}
            />
          </section>
          <AuthHero />
        </div>
      </div>
    </main>
  )
}

export default VerifyOtpPage
