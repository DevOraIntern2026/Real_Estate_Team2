import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { TextField, type TextFieldProps } from '@/components/ui/TextField'

type PasswordFieldProps = Omit<TextFieldProps, 'endAdornment' | 'type'>

export function PasswordField(props: PasswordFieldProps) {
  const [visible, setVisible] = useState(false)

  return (
    <TextField
      {...props}
      endAdornment={(
        <Button
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
          className="h-6 min-h-6 w-6 rounded-none px-0 py-0"
          onClick={() => setVisible((current) => !current)}
          size="sm"
          variant="ghost"
        >
          {visible ? <Eye className="h-5 w-5" aria-hidden="true" /> : <EyeOff className="h-5 w-5" aria-hidden="true" />}
        </Button>
      )}
      type={visible ? 'text' : 'password'}
    />
  )
}
