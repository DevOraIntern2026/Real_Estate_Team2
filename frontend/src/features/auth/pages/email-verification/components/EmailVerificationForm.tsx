import type { FormEventHandler } from 'react'
import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/TextField'
import { OtpCodeInput } from '@/features/auth/pages/verify-otp/components/OtpCodeInput'
import {
  emailVerificationSchema,
  type EmailVerificationFormValues,
} from '@/features/auth/schemas/emailVerificationSchema'

type EmailVerificationFormProps = {
  email: string
  isResending?: boolean
  isVerifying?: boolean
  onResend?: (email: string) => void | Promise<void>
  onSubmit?: (values: EmailVerificationFormValues) => void | Promise<void>
}

export function EmailVerificationForm({
  email,
  isResending = false,
  isVerifying = false,
  onResend,
  onSubmit,
}: EmailVerificationFormProps) {
  const [resendSecondsLeft, setResendSecondsLeft] = useState(60)
  const {
    control,
    formState: { errors },
    getValues,
    handleSubmit,
    register,
  } = useForm<EmailVerificationFormValues>({
    resolver: zodResolver(emailVerificationSchema),
    defaultValues: { email, otp: '' },
  })

  useEffect(() => {
    if (resendSecondsLeft === 0) return

    const timerId = window.setTimeout(() => {
      setResendSecondsLeft((secondsLeft) => Math.max(secondsLeft - 1, 0))
    }, 1000)

    return () => window.clearTimeout(timerId)
  }, [resendSecondsLeft])

  const handleResend = async () => {
    if (!onResend || resendSecondsLeft > 0 || isResending) return

    try {
      await onResend(getValues('email'))
      setResendSecondsLeft(60)
    } catch {
      // Keep resend available if the API request fails.
    }
  }

  const submitForm: FormEventHandler<HTMLFormElement> = handleSubmit(
    (values) => onSubmit?.(values),
  )

  return (
    <form
      className="flex flex-col gap-auth-verify-submit"
      noValidate
      onSubmit={submitForm}
    >
      {email ? (
        <input {...register('email')} type="hidden" />
      ) : (
        <TextField
          {...register('email')}
          autoComplete="email"
          error={errors.email?.message}
          label="Email"
          name="email"
          placeholder="Enter your email"
          required
          type="email"
        />
      )}
      <div className="flex flex-col gap-4">
        <Controller
          control={control}
          name="otp"
          render={({ field, fieldState }) => (
            <OtpCodeInput
              error={fieldState.error?.message}
              length={6}
              onBlur={field.onBlur}
              onChange={field.onChange}
              value={field.value}
            />
          )}
        />
        <p className="text-label-14 text-text-heading m-0 text-center">
          Didn’t receive a code?{' '}
          <button
            aria-live="polite"
            className="text-error-dark cursor-pointer border-0 bg-transparent p-0 font-inherit disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isResending || resendSecondsLeft > 0}
            onClick={() => void handleResend()}
            type="button"
          >
            {isResending
              ? 'Sending…'
              : resendSecondsLeft > 0
                ? `Resend in 0:${String(resendSecondsLeft).padStart(2, '0')}`
                : 'Resend'}
          </button>
        </p>
      </div>
      <Button
        className="text-main-white"
        disabled={isVerifying}
        fullWidth
        size="lg"
        type="submit"
      >
        {isVerifying ? 'Verifying…' : 'Verify email'}
      </Button>
    </form>
  )
}
