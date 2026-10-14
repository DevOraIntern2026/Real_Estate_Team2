import { ChevronDown } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { profileSchema, type ProfileFormValues } from '../schema/profile.schema'
import { useProfileStore } from '../hooks/useprofile'
import clsx from 'clsx'

type Errors = Partial<Record<keyof ProfileFormValues, string>>

const empty: ProfileFormValues = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  gender: undefined,
  country: undefined,
  address: '',
  zipCode: '',
}

interface FieldProps {
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
}
function Field({ label, required, error, children }: FieldProps) {
  return (
    <div className={clsx('textfield', error && 'textfield--error')}>
      <label className="textfield__label">
        {label}
        {required && <span className="text-error-dark">*</span>}
      </label>
      {children}
      {error && (
        <span className="textfield__helper textfield__helper--error">
          {error}
        </span>
      )}
    </div>
  )
}

export default function ProfileSettingPage() {
  const { user, saveUser } = useProfileStore()
  const [values, setValues] = useState<ProfileFormValues>(empty)
  const [errors, setErrors] = useState<Errors>({})
  const [saving, setSaving] = useState(false)

  const fromUser = (): ProfileFormValues =>
    user
      ? {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          gender: user.gender,
          country: user.country,
          address: user.address,
          zipCode: user.zipCode,
        }
      : empty

  useEffect(() => {
    setValues(fromUser()) /* eslint-disable-next-line */
  }, [user])

  const set = <K extends keyof ProfileFormValues>(
    k: K,
    v: ProfileFormValues[K],
  ) => setValues((p) => ({ ...p, [k]: v }))

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const parsed = profileSchema.safeParse(values)
    if (!parsed.success) {
      const next: Errors = {}
      for (const issue of parsed.error.issues)
        next[issue.path[0] as keyof ProfileFormValues] ??= issue.message
      setErrors(next)
      return
    }
    setErrors({})
    setSaving(true)
    try {
      await saveUser(parsed.data)
      toast.success('Profile updated')
    } catch {
      toast.error('Could not save changes. Try again.')
    } finally {
      setSaving(false)
    }
  }

  const input = (
    k: 'firstName' | 'lastName' | 'email' | 'address' | 'zipCode',
    placeholder: string,
    type = 'text',
  ) => (
    <div className="textfield__control">
      <input
        className="textfield__input"
        type={type}
        placeholder={placeholder}
        value={values[k]}
        onChange={(e) => set(k, e.target.value)}
      />
    </div>
  )

  const select = (
    k: 'gender' | 'country',
    placeholder: string,
    options: { value: string; label: string }[],
  ) => (
    <div className="textfield__control">
      <select
        className="textfield__input appearance-none"
        value={values[k] ?? ''}
        onChange={(e) => set(k, (e.target.value || undefined) as never)}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="text-icon-grey-shade h-5 w-5" />
    </div>
  )

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-outer bg-main-white min-h-customer-agent-art-width p-8"
    >
      <h2 className="text-title-24 font-medium">Profile Setting</h2>
      <p className="text-body-sm text-text-grey-shade mt-2">
        Manage your personal information
      </p>

      <div className="mt-10 grid gap-x-8 gap-y-8 px-0 md:grid-cols-2 lg:px-5">
        <Field label="First Name" required error={errors.firstName}>
          {input('firstName', 'First Name')}
        </Field>
        <Field label="Last Name" required error={errors.lastName}>
          {input('lastName', 'Last Name')}
        </Field>
        <Field label="Your Email" required error={errors.email}>
          {input('email', 'Enter your email', 'email')}
        </Field>
        <Field label="Your Phone" required error={errors.phone}>
          <div className="textfield__control">
            <span className="border-border-grey-shade flex items-center gap-2 border-r pr-3">
              🇪🇬 {user?.phoneCode ?? '+20'}
            </span>
            <input
              className="textfield__input"
              placeholder="10 000 00 000"
              value={values.phone}
              onChange={(e) => set('phone', e.target.value)}
            />
          </div>
        </Field>
        <Field label="Gender">
          {select('gender', 'Gender', [
            { value: 'male', label: 'Male' },
            { value: 'female', label: 'Female' },
          ])}
        </Field>
        <Field label="Country">
          {select(
            'country',
            'Country',
            ['Egypt', 'Saudi Arabia', 'UAE'].map((c) => ({
              value: c,
              label: c,
            })),
          )}
        </Field>
        <Field label="Address" required error={errors.address}>
          {input('address', 'Enter your address')}
        </Field>
        <Field label="Zip Code" required error={errors.zipCode}>
          {input('zipCode', 'Zip Code')}
        </Field>
      </div>

      <div className="mt-10 flex justify-end gap-4 lg:px-5">
        <button
          type="button"
          onClick={() => {
            setValues(fromUser())
            setErrors({})
          }}
          className="rounded-button border-border-grey-shade text-text-grey-shade bg-bg-surface text-title-18 h-14 border px-10"
        >
          Discard
        </button>
        <button
          type="submit"
          disabled={saving}
          className="rounded-button bg-main-primary text-main-white text-title-18 h-14 px-10 disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save Change'}
        </button>
      </div>
    </form>
  )
}
