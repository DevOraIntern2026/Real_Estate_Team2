import type { FormEventHandler } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import { CheckboxField } from '@/components/ui/CheckboxField'
import { TextField } from '@/components/ui/TextField'
import {
  AuthDivider,
  AuthFooterLink,
  OAuthButton,
  PasswordField,
} from '@/features/auth/components/shared'
import googleMark from '@/assets/icons/google.svg'
import { loginSchema, type LoginFormValues } from '@/features/auth/schemas/loginSchema'

type LoginFormProps = {
  onSubmit?: (values: LoginFormValues) => void
}

export function LoginForm({ onSubmit }: LoginFormProps) {
  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', rememberMe: false },
  })

  const submitForm: FormEventHandler<HTMLFormElement> = handleSubmit((values) =>
    onSubmit?.(values),
  )

  return (
    <form
      className="mt-auth-login-form-offset flex flex-col gap-auth-login-form"
      noValidate
      onSubmit={submitForm}
    >
      <div className="flex flex-col gap-auth-login-field">
        <TextField
          {...register('email')}
          autoComplete="email"
          controlClassName="min-h-12"
          error={errors.email?.message}
          label="Email"
          name="email"
                 placeholder='Enter your Email'

          required
          type="email"
        />
        <PasswordField
          {...register('password')}
          autoComplete="current-password"
          controlClassName="min-h-12"
          error={errors.password?.message}
                  placeholder='Enter your Password'

          label="Password"
          name="password"
        
          required
        />
        <div className="flex min-h-6 items-center justify-between gap-4">
          <CheckboxField
            {...register('rememberMe')}
          defaultChecked
            label="Remember me"
            name="rememberMe"
          >
            Remember me
          </CheckboxField>
          <a
            className="text-label-14 text-brand-700 shrink-0 no-underline hover:underline"
            href="/forgot-password"
          >
            Forgot password ?
          </a>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <Button className="text-main-white" fullWidth size="lg" type="submit">
          Login
        </Button>
        <AuthFooterLink
          href="/signup"
          linkLabel="Sign up"
          prompt="Don’t have account ?"
        />
      </div>

      <AuthDivider label="Or login with" />
      <OAuthButton icon={googleMark} provider="Google" />
    </form>
  )
}
