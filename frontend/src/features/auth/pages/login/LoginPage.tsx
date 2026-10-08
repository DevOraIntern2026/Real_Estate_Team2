import { useNavigate } from 'react-router-dom'
import {
  AuthBrand,
  AuthHero,
  AuthIntro,
} from '@/features/auth/components/shared'
import { useGoogleAuth } from '@/features/auth/hooks/useGoogleAuth'
import { useLogin } from '@/features/auth/hooks/useLogin'
import type { LoginFormValues } from '@/features/auth/schemas/loginSchema'
import { LoginForm } from './components/LoginForm'
import { decodeAccessToken } from '@/services/api/tokenStorage'
import type { LoginResult } from '@/features/auth/api/authApi'

function LoginPage() {
  const navigate = useNavigate()
  const loginMutation = useLogin()
  const googleAuthMutation = useGoogleAuth()
  const handleSuccess = (result: LoginResult) => {
    const session = decodeAccessToken(result.tokens.accessToken)
    navigate(session.role === 'customer' ? '/customer-home' : '/', { replace: true })
  }
  const handleLogin = (values: LoginFormValues) =>
    loginMutation.mutate(values, { onSuccess: handleSuccess })

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
              isGoogleSubmitting={googleAuthMutation.isPending}
              isSubmitting={loginMutation.isPending}
              onGoogleCredential={(idToken, rememberMe) =>
                googleAuthMutation.mutate({
                  idToken,
                  role: '2',
                  rememberMe,
                }, { onSuccess: handleSuccess })
              }
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

