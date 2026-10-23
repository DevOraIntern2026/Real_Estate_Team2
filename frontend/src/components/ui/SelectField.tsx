import type { SelectHTMLAttributes } from 'react'
import clsx from 'clsx'
import { twMerge } from 'tailwind-merge'
import chevronDown from '@/assets/icons/chevron-down.svg'

export type SelectOption = {
  label: string
  value: string
}

type SelectFieldProps = Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  'size'
> & {
  label: string
  name: string
  options: SelectOption[]
  placeholder?: string
}

export function SelectField({
  className,
  id,
  label,
  name,
  options,
  placeholder,
  required = false,
  ...selectProps
}: SelectFieldProps) {
  const selectId = id ?? name

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <label
        className="text-label-14 text-text-grey-shade font-medium"
        htmlFor={selectId}
      >
        {label}
      </label>
      <div className="rounded-button border-border-grey-shade bg-bg-white focus-within:border-border-primary relative flex min-h-14 items-center gap-3 border px-5 py-3 transition-colors">
        <select
          {...selectProps}
          className={twMerge(
            clsx(
              'text-body-sm text-text-grey-light w-full min-w-0 cursor-pointer appearance-none border-0 bg-transparent font-sans font-normal outline-none',
              className,
            ),
          )}
          id={selectId}
          name={name}
          required={required}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <img
          className="pointer-events-none h-6 w-6 shrink-0"
          src={chevronDown}
          alt=""
        />
      </div>
    </div>
  )
}
