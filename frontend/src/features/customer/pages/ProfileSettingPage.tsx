import { useEffect, useState, type FormEvent } from 'react'
import { X } from 'lucide-react'
import { toast } from 'sonner'
import { profileSchema, type ProfileFormValues } from '../schema/profile.schema'
import { useProfileStore } from '../hooks/useprofile'
import { getApiErrorMessage } from '@/features/auth/utils/getApiErrorMessage'
import clsx from 'clsx'

type Errors = Partial<Record<keyof ProfileFormValues, string>>

const empty: ProfileFormValues = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  location: '',
  bio: '',
  licenseNumber: '',
  agencyName: '',
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

export default function ProfileSettingPage({
  isModal = false,
  onClose,
}: {
  isModal?: boolean
  onClose?: () => void
}) {
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
          location: user.location,
          bio: user.bio,
          licenseNumber: user.licenseNumber ?? '',
          agencyName: user.agencyName ?? '',
        }
      : empty

  useEffect(() => {
    setValues(fromUser()) /* eslint-disable-next-line */
  }, [user])

  useEffect(() => {
    if (!isModal) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isModal, onClose])

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
      if (isModal) onClose?.()
    } catch (error) {
      toast.error(error instanceof Error ? getApiErrorMessage(error) : 'Could not save changes. Try again.')
    } finally {
      setSaving(false)
    }
  }

  const input = (
    k: 'firstName' | 'lastName' | 'email' | 'location' | 'bio' | 'licenseNumber' | 'agencyName',
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

  const form = (
    <form
      onSubmit={onSubmit}
      onClick={(event) => event.stopPropagation()}
      className={`rounded-outer bg-main-white relative w-full p-6 ${isModal ? 'overflow-y-auto' : 'min-h-customer-agent-art-width'}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 id="profile-editor-title" className="text-title-24 font-medium text-[#100e2c]">Profile Setting</h2>
          <p className="text-body-sm text-text-grey-shade mt-2">Manage your personal information</p>
        </div>
        {isModal && <button type="button" onClick={onClose} aria-label="Close profile editor" className="rounded-full p-2 text-text-grey-shade hover:bg-bg-surface"><X className="size-5" /></button>}
      </div>

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
        <Field label="Location">
          {input('location', 'City, country')}
        </Field>
        <Field label="Bio">
          <div className="textfield__control h-auto min-h-12 py-3">
            <textarea className="textfield__input min-h-20 resize-y" placeholder="Tell us about yourself" value={values.bio} onChange={(e) => set('bio', e.target.value)} />
          </div>
        </Field>
        {user?.role === 'owner' && <>
          <Field label="License number">{input('licenseNumber', 'License number')}</Field>
          <Field label="Agency name">{input('agencyName', 'Agency name')}</Field>
        </>}
      </div>

      <div className="mt-10 flex justify-end gap-4 lg:px-5">
        <button
          type="button"
          onClick={() => {
            if (isModal) onClose?.()
            else {
              setValues(fromUser())
              setErrors({})
            }
          }}
          className="rounded-button border-border-grey-shade text-text-grey-shade bg-bg-surface text-title-18 h-14 border px-10"
        >
          {isModal ? 'Cancel' : 'Discard'}
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

  if (!isModal) return form

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#252c32]/50 p-4 backdrop-blur-[2px]"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose?.()
      }}
    >
      <div className="max-h-[min(90vh,900px)] w-full max-w-[760px] overflow-hidden rounded-[30px] shadow-2" role="dialog" aria-modal="true" aria-labelledby="profile-editor-title">
        {form}
      </div>
    </div>
  )
}
