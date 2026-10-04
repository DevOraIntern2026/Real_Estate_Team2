import {
  AuthBrand,
  AuthHero,
  AuthIntro,
} from '@/features/auth/components/shared'
import { useLogin } from '@/features/auth/hooks/useLogin'
import type { LoginFormValues } from '@/features/auth/schemas/loginSchema'
import { LoginForm } from './components/LoginForm'

function LoginPage() {
  const loginMutation = useLogin()
  const handleLogin = (values: LoginFormValues) => loginMutation.mutate(values)

  return (
    <main className="bg-bg-white pt-auth-login-top text-text-heading max-auth-tablet:px-6 max-auth-tablet:pt-6 max-auth-tablet:pb-12 max-auth-mobile:px-5 max-auth-mobile:pt-3 max-auth-mobile:pb-9 min-h-screen px-8 pb-16">
      <div className="max-w-auth-layout mx-auto w-full">
        <AuthBrand />
        <div className="mt-auth-login-brand-gap gap-auth-login-columns max-auth-tablet:justify-center flex w-full items-center">
          <section
            aria-labelledby="auth-title"
            className="w-auth-login-panel basis-auth-login-panel max-auth-tablet:w-full max-auth-tablet:max-w-auth-panel max-auth-tablet:flex-auto"
          >
            <AuthIntro
              description="Login to access your travelwise account"
              title="Login"
            />
            <LoginForm
              isSubmitting={loginMutation.isPending}
              onSubmit={handleLogin}
            />
          </section>
          <AuthHero size="login" />
        </div>
      </div>
    </main>
  )
}

export default LoginPage
