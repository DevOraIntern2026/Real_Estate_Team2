import { useEffect, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { ChevronDown, UserRound } from 'lucide-react'
import { useFormContext } from 'react-hook-form'
import type { SignUpFormValues } from '@/features/auth/schemas/signUpSchema'

const roleOptions = [
  { label: 'Customer', value: 'customer' },
  { label: 'Property owner', value: 'owner' },
] as const

export function RoleSelect() {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const { formState: { errors }, register, setValue, watch } = useFormContext<SignUpFormValues>()
  const selectedRole = watch('role')
  const selectedOption = roleOptions.find((option) => option.value === selectedRole)
  const error = errors.role?.message

  useEffect(() => {
    function closeOnOutsideClick(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }

    document.addEventListener('pointerdown', closeOnOutsideClick)
    return () => document.removeEventListener('pointerdown', closeOnOutsideClick)
  }, [])

  function selectRole(value: SignUpFormValues['role']) {
    setValue('role', value, { shouldDirty: true, shouldTouch: true, shouldValidate: true })
    setOpen(false)
    triggerRef.current?.focus()
  }

  function handleMenuKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const optionButtons = rootRef.current?.querySelectorAll<HTMLButtonElement>('[role="option"]')
    if (!optionButtons?.length) return

    const currentIndex = Array.from(optionButtons).indexOf(document.activeElement as HTMLButtonElement)
    if (event.key === 'Escape') {
      setOpen(false)
      triggerRef.current?.focus()
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      const direction = event.key === 'ArrowDown' ? 1 : -1
      const nextIndex = (currentIndex + direction + optionButtons.length) % optionButtons.length
      optionButtons[nextIndex]?.focus()
    }
  }

  return (
    <div className="relative flex min-w-0 flex-col gap-2" ref={rootRef}>
      <label className="text-label-14 font-medium text-text-grey-shade" htmlFor="role-trigger">
        what’s your Role?
      </label>
      <input type="hidden" {...register('role')} />
      <button
        aria-controls="role-options"
        aria-describedby={error ? 'role-error' : undefined}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-invalid={Boolean(error)}
        className="flex min-h-16 w-full items-center gap-4 rounded-outer border-2 border-brand-600 bg-bg-white px-5 py-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
        id="role-trigger"
        onClick={() => setOpen((current) => !current)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown') {
            event.preventDefault()
            setOpen(true)
            requestAnimationFrame(() => rootRef.current?.querySelector<HTMLButtonElement>('[role="option"]')?.focus())
          }
        }}
        ref={triggerRef}
        type="button"
      >
        <UserRound aria-hidden="true" className="h-6 w-6 shrink-0 text-icon-grey-light" />
        <span className="flex-1 text-body-sm text-text-grey-light">{selectedOption?.label ?? 'Select role'}</span>
        <ChevronDown aria-hidden="true" className="h-6 w-6 shrink-0 text-icon-grey-light" />
      </button>
      {open && (
        <div
          className="absolute top-full z-10 mt-1 w-full overflow-hidden rounded-outer border border-border-grey-shade bg-bg-white p-1 shadow-1"
          id="role-options"
          onKeyDown={handleMenuKeyDown}
          role="listbox"
          aria-label="Choose your role"
        >
          {roleOptions.map((option) => (
            <button
              aria-selected={selectedRole === option.value}
              className={`flex min-h-16 w-full items-center gap-4 rounded-inner px-5 py-3 text-left text-body-sm text-text-grey-dark hover:bg-brand-50 focus-visible:bg-brand-50 focus-visible:outline-none ${selectedRole === option.value ? 'bg-brand-50' : ''}`}
              key={option.value}
              onClick={() => selectRole(option.value)}
              role="option"
              type="button"
            >
              <UserRound aria-hidden="true" className="h-6 w-6 shrink-0 text-icon-grey-light" />
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      )}
      {error && <p className="m-0 text-caption-12 text-error-dark" id="role-error">{error}</p>}
    </div>
  )
}
