import type { FormEventHandler } from 'react'
import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import {
  verifyOtpSchema,
  type VerifyOtpFormValues,
} from '@/features/auth/schemas/verifyOtpSchema'
import { OtpCodeInput } from './OtpCodeInput'

type VerifyOtpFormProps = {
  email: string
  isResending?: boolean
  onResend?: (email: string) => void | Promise<void>
  onSubmit?: (values: VerifyOtpFormValues) => void | Promise<void>
}

export function VerifyOtpForm({
  email,
  isResending = false,
  onResend,
  onSubmit,
}: VerifyOtpFormProps) {
  const [resendSecondsLeft, setResendSecondsLeft] = useState(120)
  const methods = useForm<VerifyOtpFormValues>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: { code: '' },
  })
  const submitForm: FormEventHandler<HTMLFormElement> = methods.handleSubmit(
    (values) => onSubmit?.(values),
  )

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
      await onResend(email)
      setResendSecondsLeft(120)
    } catch {
      // Keep resend available if the API request fails.
    }
  }

  return (
    <FormProvider {...methods}>
      <form
        className="gap-auth-verify-submit flex flex-col"
        noValidate
        onSubmit={submitForm}
      >
        <div className="flex flex-col gap-4">
          <Controller
            control={methods.control}
            name="code"
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
              className="text-error-dark font-inherit cursor-pointer border-0 bg-transparent p-0 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isResending || resendSecondsLeft > 0}
              onClick={() => void handleResend()}
              type="button"
            >
              {isResending
                ? 'Sending…'
                : resendSecondsLeft > 0
                  ? `Resend in ${Math.floor(resendSecondsLeft / 60)}:${String(resendSecondsLeft % 60).padStart(2, '0')}`
                  : 'Resend'}
            </button>
          </p>
        </div>
        <Button className="text-main-white" fullWidth size="lg" type="submit">
          Continue
        </Button>
      </form>
    </FormProvider>
  )
}
