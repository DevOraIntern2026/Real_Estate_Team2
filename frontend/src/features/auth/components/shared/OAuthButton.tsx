import type { ButtonHTMLAttributes } from 'react'
import { Button } from '@/components/ui/Button'

type OAuthButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'children'
> & {
  icon: string
  provider: string
}

export function OAuthButton({
  className,
  icon,
  provider,
  ...buttonProps
}: OAuthButtonProps) {
  return (
    <Button
      {...buttonProps}
      className={`min-h-auth-social border-border-google text-text-google ${className ?? ''}`}
      fullWidth
      variant="outline"
    >
      <img className="h-7 w-7" src={icon} alt="" />
      <span>{provider}</span>
    </Button>
  )
}
