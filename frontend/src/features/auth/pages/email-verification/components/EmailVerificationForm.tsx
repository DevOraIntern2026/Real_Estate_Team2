import type { FormEventHandler } from 'react'
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
  onResend?: (email: string) => void | Promise<void>
  onSubmit?: (values: EmailVerificationFormValues) => void | Promise<void>
}

export function EmailVerificationForm({
  email,
  onResend,
  onSubmit,
}: EmailVerificationFormProps) {
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<EmailVerificationFormValues>({
    resolver: zodResolver(emailVerificationSchema),
    defaultValues: { email, otp: '' },
  })

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
            className="text-error-dark cursor-pointer border-0 bg-transparent p-0 font-inherit"
            onClick={() => onResend?.(email)}
            type="button"
          >
            Resend
          </button>
        </p>
      </div>
      <Button className="text-main-white" fullWidth size="lg" type="submit">
        Verify email
      </Button>
    </form>
  )
}
