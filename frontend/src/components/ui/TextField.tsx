import type { InputHTMLAttributes, ReactNode, Ref } from 'react'
import clsx from 'clsx'
import { twMerge } from 'tailwind-merge'

export type TextFieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'className' | 'size'
> & {
  controlClassName?: string
  endAdornment?: ReactNode
  error?: string
  inputClassName?: string
  label: string
  name: string
  ref?: Ref<HTMLInputElement>
}

export function TextField({
  autoComplete,
  controlClassName,
  endAdornment,
  error,
  id,
  inputClassName,
  label,
  name,
  required = false,
  ref: inputRef,
  ...inputProps
}: TextFieldProps) {
  const inputId = id ?? name
  const classes = twMerge(
    clsx(
      'flex min-h-14 items-center gap-3 rounded-button border border-border-grey-shade bg-bg-white px-5 py-3 transition-colors focus-within:border-border-primary',
      error && 'border-error-dark focus-within:border-error-dark',
      controlClassName,
    ),
  )

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <label
        className="text-label-14 text-text-grey-shade font-medium"
        htmlFor={inputId}
      >
        {label}
      </label>
      <div className={classes}>
        <input
          {...inputProps}
          aria-describedby={error ? `${inputId}-error` : undefined}
          aria-invalid={Boolean(error)}
          autoComplete={autoComplete}
          className={twMerge(
            'font-inter text-auth-input text-text-input placeholder:text-text-grey-light w-full min-w-0 border-0 bg-transparent font-normal outline-none',
            inputClassName,
          )}
          id={inputId}
          name={name}
          required={required}
          ref={inputRef}
        />
        {endAdornment}
      </div>
      {error && (
        <p
          className="text-caption-12 text-error-dark m-0"
          id={`${inputId}-error`}
        >
          {error}
        </p>
      )}
    </div>
  )
}
