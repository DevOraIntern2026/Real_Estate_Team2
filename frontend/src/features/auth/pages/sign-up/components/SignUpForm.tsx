import type { FormEventHandler } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormProvider, useForm } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/TextField'
import {
  AuthDivider,
  AuthFooterLink,
  OAuthButton,
  PasswordField,
} from '@/features/auth/components/shared'
import googleMark from '@/assets/icons/google.svg'
import {
  signUpSchema,
  type SignUpFormValues,
} from '@/features/auth/schemas/signUpSchema'
import { RoleSelect } from './RoleSelect'
import { TermsAgreement } from './TermsAgreement'

type SignUpFormProps = {
  onSubmit?: (values: SignUpFormValues) => void
}

export function SignUpForm({ onSubmit }: SignUpFormProps) {
  const methods = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      role: 'customer',
      termsAccepted: false,
    },
  })
  const { errors } = methods.formState
  const submitForm: FormEventHandler<HTMLFormElement> = methods.handleSubmit(
    (values) => onSubmit?.(values),
  )

  return (
    <FormProvider {...methods}>
      <form
        className="max-auth-mobile:mt-8 max-auth-mobile:gap-7.5 mt-12 flex flex-col gap-10"
        noValidate
        onSubmit={submitForm}
      >
        <div className="flex flex-col gap-4">
          <TextField
            {...methods.register('fullName')}
            autoComplete="name"
            error={errors.fullName?.message}
            label="Full Name"
            name="fullName"
            required
          />
          <TextField
            {...methods.register('email')}
            autoComplete="email"
            error={errors.email?.message}
            label="Email"
            name="email"
            required
            type="email"
          />
          <PasswordField
            {...methods.register('password')}
            autoComplete="new-password"
            error={errors.password?.message}
            label="Password"
            name="password"
            required
          />
          <RoleSelect />
          <TermsAgreement />
        </div>
        <div className="flex flex-col gap-4">
          <Button className="text-main-white" fullWidth size="lg" type="submit">
            Login
          </Button>
          <AuthFooterLink
            href="/login"
            linkLabel="Sign in"
            prompt="Already have an account?"
          />
        </div>
        <AuthDivider label="Or Sign up with" />
        <OAuthButton icon={googleMark} provider="Google" />
      </form>
    </FormProvider>
  )
}
