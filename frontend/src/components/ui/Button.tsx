import type { ButtonHTMLAttributes, ReactNode } from 'react'
import clsx from 'clsx'
import { twMerge } from 'tailwind-merge'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode
  fullWidth?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'primary' | 'outline' | 'ghost'
}

const variants = {
  primary: 'border-transparent bg-brand-700 text-main-white hover:bg-brand-800',
  outline: 'border-border-grey-shade bg-bg-white text-text-grey-dark hover:bg-bg-light',
  ghost: 'border-transparent bg-transparent text-brand-700 hover:bg-bg-light',
}

const sizes = {
  sm: 'min-h-9 px-4 text-label-14',
  md: 'min-h-11 px-5 text-body-sm',
  lg: 'min-h-12 px-6 text-body-sm',
}

export function Button({
  children,
  className,
  fullWidth = false,
  size = 'md',
  type = 'button',
  variant = 'primary',
  ...props
}: ButtonProps) {
  const classes = twMerge(
    clsx(
      'inline-flex cursor-pointer items-center justify-center gap-2 rounded-button border font-sans font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50',
      variants[variant],
      sizes[size],
      fullWidth && 'w-full',
      className,
    ),
  )

  return (
    <button className={classes} type={type} {...props}>
      {children}
    </button>
  )
}
