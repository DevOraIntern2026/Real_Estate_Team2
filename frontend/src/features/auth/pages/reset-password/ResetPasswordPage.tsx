import { AuthBrand, AuthHero } from '@/features/auth/components/shared'
import type { ResetPasswordFormValues } from '@/features/auth/schemas/resetPasswordSchema'
import { ResetPasswordForm } from './components/ResetPasswordForm'

type ResetPasswordPageProps = {
  onSubmit?: (values: ResetPasswordFormValues) => void
}

function ResetPasswordPage({ onSubmit }: ResetPasswordPageProps) {
  return (
    <main className="bg-bg-white pt-auth-reset-top text-text-heading max-auth-tablet:px-6 max-auth-tablet:pt-6 max-auth-tablet:pb-12 max-auth-mobile:px-5 max-auth-mobile:pt-3 max-auth-mobile:pb-9 min-h-screen px-8 pb-16">
      <div className="max-w-auth-layout mx-auto w-full">
        <AuthBrand />
        <div className="gap-auth-reset-columns max-auth-tablet:justify-center flex items-start">
          <section
            aria-labelledby="auth-title"
            className="w-auth-login-panel basis-auth-login-panel max-auth-tablet:mt-0 max-auth-tablet:w-full max-auth-tablet:max-w-auth-panel max-auth-tablet:flex-auto mt-9 flex flex-col gap-12"
          >
            <header>
              <h1
                className="font-poppins text-auth-heading text-text-heading m-0 leading-12 font-semibold"
                id="auth-title"
              >
                Set a password
              </h1>
              <p className="font-poppins text-body-sm text-text-heading mt-4 mb-0 font-normal opacity-75">
                Your previous password has been reset. Please set a new password
                for your account.
              </p>
            </header>
            <ResetPasswordForm onSubmit={onSubmit} />
          </section>
          <AuthHero size="reset" />
        </div>
      </div>
    </main>
  )
}

export default ResetPasswordPage
