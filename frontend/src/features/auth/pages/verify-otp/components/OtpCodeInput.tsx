import { useRef } from 'react'
import type { ChangeEvent, KeyboardEvent, ClipboardEvent } from 'react'

type OtpCodeInputProps = {
  error?: string
  length?: number
  onBlur: () => void
  onChange: (value: string) => void
  value: string
}

export function OtpCodeInput({
  error,
  length = 4,
  onBlur,
  onChange,
  value,
}: OtpCodeInputProps) {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([])
  const digits = value.padEnd(length).slice(0, length)

  const handleChange = (
    event: ChangeEvent<HTMLInputElement>,
    index: number,
  ) => {
    const enteredDigits = event.target.value.replace(/\D/g, '')

    if (enteredDigits.length > 1) {
      const nextValue = enteredDigits.slice(0, length)
      onChange(nextValue)
      inputRefs.current[Math.min(nextValue.length, length - 1)]?.focus()
      return
    }

    const nextDigits = digits.split('')
    nextDigits[index] = enteredDigits
    onChange(nextDigits.join('').trimEnd())

    if (enteredDigits && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    const pastedDigits = event.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, length)

    if (!pastedDigits) return

    event.preventDefault()
    onChange(pastedDigits)
    inputRefs.current[Math.min(pastedDigits.length, length - 1)]?.focus()
  }

  const handleKeyDown = (
    event: KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (event.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    if (event.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    if (event.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  return (
    <div
      aria-describedby={error ? 'otp-code-error' : undefined}
      aria-invalid={Boolean(error)}
      aria-label={`${length}-digit verification code`}
      className="flex flex-col items-center gap-1"
      role="group"
    >
      <div className="max-auth-mobile:gap-1 flex items-start gap-2">
        {Array.from({ length }, (_, index) => (
          <input
            key={index}
            aria-label={`Digit ${index + 1} of ${length}`}
            aria-invalid={Boolean(error)}
            autoComplete={index === 0 ? 'one-time-code' : 'off'}
            className="text-title-18 text-text-grey-dark placeholder:text-text-grey-dark focus:border-border-primary max-auth-mobile:size-10 rounded-button border-border-grey-shade bg-bg-white size-14 border p-2 text-center transition-colors outline-none"
            inputMode="numeric"
            maxLength={1}
            onBlur={onBlur}
            onChange={(event) => handleChange(event, index)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            onPaste={handlePaste}

            ref={(element) => {
              inputRefs.current[index] = element
            }}
            type="text"
            value={digits[index].trim()}
          />
        ))}
      </div>
      {error && (
        <p className="text-caption-12 text-error-dark m-0" id="otp-code-error">
          {error}
        </p>
      )}
    </div>
  )
}
