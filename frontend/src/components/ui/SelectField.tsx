import type { SelectHTMLAttributes } from 'react'
import clsx from 'clsx'
import { twMerge } from 'tailwind-merge'
import chevronDown from '@/assets/icons/chevron-down.svg'

export type SelectOption = {
  label: string
  value: string
}

type SelectFieldProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> & {
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
      <label className="text-label-14 font-medium text-text-grey-shade" htmlFor={selectId}>
        {label}
      </label>
      <div className="relative flex min-h-14 items-center gap-3 rounded-button border border-border-grey-shade bg-bg-white px-5 py-3 transition-colors focus-within:border-border-primary">
        <select
          {...selectProps}
          className={twMerge(
            clsx(
              'w-full min-w-0 cursor-pointer appearance-none border-0 bg-transparent font-sans text-body-sm font-normal text-text-grey-light outline-none',
              className,
            ),
          )}
          id={selectId}
          name={name}
          required={required}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
        <img className="pointer-events-none h-6 w-6 shrink-0" src={chevronDown} alt="" />
      </div>
    </div>
  )
}
