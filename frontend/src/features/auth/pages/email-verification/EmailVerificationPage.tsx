import { ArrowLeft } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { useConfirmEmail } from '@/features/auth/hooks/useConfirmEmail'
import { useResendConfirmationEmail } from '@/features/auth/hooks/useResendConfirmationEmail'
import {
  AuthBrand,
  AuthHero,
  AuthIntro,
} from '@/features/auth/components/shared'
import { EmailVerificationForm } from './components/EmailVerificationForm'

type SignUpLocationState = {
  email?: string
}

function EmailVerificationPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const state = location.state as SignUpLocationState | null
  const email =
    state?.email ?? new URLSearchParams(location.search).get('email') ?? ''
  const confirmMutation = useConfirmEmail({
    onSuccess: () => navigate('/login'),
  })
  const resendMutation = useResendConfirmationEmail()

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
                to="/signup"
              >
                <ArrowLeft aria-hidden="true" className="h-5 w-5" />
                <span>Back to sign up</span>
              </Link>
              <AuthIntro
                description={
                  email
                    ? `We sent a 6-digit verification code to ${email}.`
                    : 'Enter your email address and the 6-digit verification code we sent you.'
                }
                title="Verify your email"
              />
            </header>
            <EmailVerificationForm
              key={email}
              email={email}
              isResending={resendMutation.isPending}
              isVerifying={confirmMutation.isPending}
              onResend={(targetEmail) =>
                resendMutation.mutate({ email: targetEmail })
              }
              onSubmit={(values) => confirmMutation.mutate(values)}
            />
          </section>
          <AuthHero />
        </div>
      </div>
    </main>
  )
}

export default EmailVerificationPage
