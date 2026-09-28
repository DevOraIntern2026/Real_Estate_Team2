import type { FormEventHandler } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/TextField'

import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from '@/features/auth/schemas/forgotPasswordSchema'

type ForgotPasswordFormProps = {
  onSubmit?: (values: ForgotPasswordFormValues) => void
}

export function ForgotPasswordForm({ onSubmit }: ForgotPasswordFormProps) {
  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  })

  const submitForm: FormEventHandler<HTMLFormElement> = handleSubmit((values) =>
    onSubmit?.(values),
  )

  return (
    <div className="gap-auth-forgot-section flex flex-col">
      <form
        className="gap-auth-forgot-submit flex flex-col"
        noValidate
        onSubmit={submitForm}
      >
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
        <Button className="text-main-white" fullWidth size="lg" type="submit">
          Send OTP
        </Button>
      </form>
    </div>
  )
}
