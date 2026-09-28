import type { FormEventHandler } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import {
  verifyOtpSchema,
  type VerifyOtpFormValues,
} from '@/features/auth/schemas/verifyOtpSchema'
import { OtpCodeInput } from './OtpCodeInput'

type VerifyOtpFormProps = {
  onResend?: () => void
  onSubmit?: (values: VerifyOtpFormValues) => void
}

export function VerifyOtpForm({ onResend, onSubmit }: VerifyOtpFormProps) {
  const methods = useForm<VerifyOtpFormValues>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: { code: '' },
  })
  const submitForm: FormEventHandler<HTMLFormElement> = methods.handleSubmit(
    (values) => onSubmit?.(values),
  )

  return (
    <FormProvider {...methods}>
      <form
        className="flex flex-col gap-auth-verify-submit"
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
              onClick={onResend}
              type="button"
            >
              Resend
            </button>
          </p>
        </div>
        <Button  className='text-main-white'fullWidth size="lg" type="submit">
          Verify
        </Button>
      </form>
    </FormProvider>
  )
}
