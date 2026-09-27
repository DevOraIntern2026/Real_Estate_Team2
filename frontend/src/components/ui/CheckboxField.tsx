import type { InputHTMLAttributes, ReactNode, Ref } from 'react'
import clsx from 'clsx'
import checkboxChecked from '@/assets/icons/checkbox-checked.svg'

type CheckboxFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  children: ReactNode
  error?: string
  label: string
  ref?: Ref<HTMLInputElement>
}

export function CheckboxField({ children, error, id, label, name, ref, ...inputProps }: CheckboxFieldProps) {
  const inputId = id ?? name

  return (
    <div>
      <div className="flex items-center gap-2 text-label-14 font-medium text-text-input max-auth-mobile:items-start">
        <label className="relative block h-6 w-6 shrink-0 cursor-pointer" htmlFor={inputId}>
          <input
            {...inputProps}
            aria-describedby={error ? `${inputId}-error` : undefined}
            aria-invalid={Boolean(error)}
            aria-label={label}
            className="peer sr-only"
            id={inputId}
            name={name}
            ref={ref}
            type="checkbox"
          />
          <span
            aria-hidden="true"
            className={clsx(
              'absolute inset-0 rounded-sm border border-border-grey-shade bg-bg-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand-500 peer-checked:border-transparent peer-checked:bg-transparent',
              error && 'border-error-dark',
            )}
          />
          <img className="pointer-events-none absolute inset-0 h-6 w-6 opacity-0 peer-checked:opacity-100" src={checkboxChecked} alt="" />
        </label>
        <span>{children}</span>
      </div>
      {error && <p className="mt-1 mb-0 text-caption-12 text-error-dark" id={`${inputId}-error`}>{error}</p>}
    </div>
  )
}
