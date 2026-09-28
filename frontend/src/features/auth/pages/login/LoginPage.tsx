import {
  AuthBrand,
  AuthHero,
  AuthIntro,
} from '@/features/auth/components/shared'
import type { LoginFormValues } from '@/features/auth/schemas/loginSchema'
import { LoginForm } from './components/LoginForm'

type LoginPageProps = {
  onSubmit?: (values: LoginFormValues) => void
}

function LoginPage({ onSubmit }: LoginPageProps) {
  return (
    <main className="min-h-screen bg-bg-white px-8 pt-auth-login-top pb-16 text-text-heading max-auth-tablet:px-6 max-auth-tablet:pt-6 max-auth-tablet:pb-12 max-auth-mobile:px-5 max-auth-mobile:pt-3 max-auth-mobile:pb-9">
      <div className="max-w-auth-layout mx-auto w-full">
        <AuthBrand />
        <div className="mt-auth-login-brand-gap flex w-full items-center gap-auth-login-columns max-auth-tablet:justify-center">
          <section
            aria-labelledby="auth-title"
            className="w-auth-login-panel basis-auth-login-panel max-auth-tablet:w-full max-auth-tablet:max-w-auth-panel max-auth-tablet:flex-auto"
          >
            <AuthIntro
              description="Login to access your travelwise account"
              title="Login"
            />
            <LoginForm onSubmit={onSubmit} />
          </section>
          <AuthHero size="login" />
        </div>
      </div>
    </main>
  )
}

export default LoginPage
