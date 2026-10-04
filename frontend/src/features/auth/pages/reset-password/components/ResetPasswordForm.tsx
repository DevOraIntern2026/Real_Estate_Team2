import type { FormEventHandler } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import { PasswordField } from '@/features/auth/components/shared'
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from '@/features/auth/schemas/resetPasswordSchema'

type ResetPasswordFormProps = {
  isSubmitting?: boolean
  onSubmit?: (values: ResetPasswordFormValues) => void | Promise<void>
}

export function ResetPasswordForm({
  onSubmit,
  isSubmitting = false,
}: ResetPasswordFormProps) {
  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  })

  const submitForm: FormEventHandler<HTMLFormElement> = handleSubmit((values) =>
    onSubmit?.(values),
  )

  return (
    <form className="flex flex-col gap-8" noValidate onSubmit={submitForm}>
      <div className="flex flex-col gap-4">
        <PasswordField
          {...register('newPassword')}
          autoComplete="new-password"
          controlClassName="min-h-12"
          error={errors.newPassword?.message}
          label="New Password"
          name="newPassword"
          placeholder="Enter new password"
          required
        />
        <PasswordField
          {...register('confirmPassword')}
          autoComplete="new-password"
          controlClassName="min-h-12"
          error={errors.confirmPassword?.message}
          label="Confirm Password"
          name="confirmPassword"
          placeholder="Confirm your password"
          required
        />
      </div>
      <Button
        className="text-main-white"
        disabled={isSubmitting}
        fullWidth
        size="lg"
        type="submit"
      >
        {isSubmitting ? 'Updating…' : 'Set Password'}
      </Button>
    </form>
  )
}
