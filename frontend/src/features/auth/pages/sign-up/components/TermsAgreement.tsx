import { CheckboxField } from '@/components/ui/CheckboxField'
import { useFormContext } from 'react-hook-form'
import type { SignUpFormValues } from '@/features/auth/schemas/signUpSchema'

export function TermsAgreement() {
  const { formState: { errors }, register } = useFormContext<SignUpFormValues>()

  return (
    <CheckboxField
      {...register('termsAccepted')}
      error={errors.termsAccepted?.message}
      label="I agree to the Terms and Privacy Policies"
      required
    >
      I agree to all the <a className="text-error-dark no-underline hover:underline" href="#terms">Terms</a> and{' '}
      <a className="text-error-dark no-underline hover:underline" href="#privacy">Privacy Policies</a>
    </CheckboxField>
  )
}
