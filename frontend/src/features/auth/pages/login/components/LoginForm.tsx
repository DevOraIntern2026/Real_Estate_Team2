import type { FormEventHandler } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import { CheckboxField } from '@/components/ui/CheckboxField'
import { TextField } from '@/components/ui/TextField'
import {
  AuthDivider,
  AuthFooterLink,
  GoogleAuthButton,
  PasswordField,
} from '@/features/auth/components/shared'
import {
  loginSchema,
  type LoginFormValues,
} from '@/features/auth/schemas/loginSchema'

type LoginFormProps = {
  isSubmitting?: boolean
  isGoogleSubmitting?: boolean
  onSubmit?: (values: LoginFormValues) => void | Promise<void>
  onGoogleCredential?: (idToken: string, rememberMe: boolean) => void
}

export function LoginForm({
  onSubmit,
  isSubmitting = false,
  isGoogleSubmitting = false,
  onGoogleCredential,
}: LoginFormProps) {
  const {
    formState: { errors },
    handleSubmit,
    register,
    watch,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', rememberMe: false },
  })

  const submitForm: FormEventHandler<HTMLFormElement> = handleSubmit((values) =>
    onSubmit?.(values),
  )

  return (
    <form
      className="mt-auth-login-form-offset gap-auth-login-form flex flex-col"
      noValidate
      onSubmit={submitForm}
    >
      <div className="gap-auth-login-field flex flex-col">
        <TextField
          {...register('email')}
          autoComplete="email"
          controlClassName="min-h-12"
          error={errors.email?.message}
          label="Email"
          name="email"
          placeholder="Enter your Email"

          required
          type="email"
        />
        <PasswordField
          {...register('password')}
          autoComplete="current-password"
          controlClassName="min-h-12"
          error={errors.password?.message}
          placeholder="Enter your Password"

          label="Password"
          name="password"

          required
        />
        <div className="flex min-h-6 items-center justify-between gap-4">
          <CheckboxField
            {...register('rememberMe')}
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
        <Button
          className="text-main-white"
          disabled={isSubmitting}
          fullWidth
          size="lg"
          type="submit"
        >
          {isSubmitting ? 'Logging in…' : 'Login'}
        </Button>
        <AuthFooterLink
          href="/signup"
          linkLabel="Sign up"
          prompt="Don’t have account ?"
        />
      </div>

      <AuthDivider label="Or login with" />
      <GoogleAuthButton
        disabled={isGoogleSubmitting}
        onCredential={(idToken) =>
          onGoogleCredential?.(idToken, watch('rememberMe'))
        }
      />
    </form>
  )
}
