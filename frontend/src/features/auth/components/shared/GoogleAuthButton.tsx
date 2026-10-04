import { useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { OAuthButton } from '@/features/auth/components/shared/OAuthButton'
import googleMark from '@/assets/icons/google.svg'

type GoogleAuthButtonProps = {
  disabled?: boolean
  onCredential: (idToken: string) => void
}

type CredentialHandler = (idToken: string) => void

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
const googleScriptUrl = 'https://accounts.google.com/gsi/client'
let googleScriptPromise: Promise<void> | undefined
let activeCredentialHandler: CredentialHandler | undefined
let initializedClientId: string | undefined

function loadGoogleIdentityScript() {
  if (window.google) return Promise.resolve()
  if (googleScriptPromise) return googleScriptPromise

  googleScriptPromise = new Promise<void>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[src="${googleScriptUrl}"]`,
    )
    const script = existingScript ?? document.createElement('script')

    const handleLoad = () => resolve()
    const handleError = () => {
      googleScriptPromise = undefined
      reject(new Error('Google sign-in could not be loaded.'))
    }

    script.addEventListener('load', handleLoad, { once: true })
    script.addEventListener('error', handleError, { once: true })

    if (!existingScript) {
      script.src = googleScriptUrl
      script.async = true
      script.defer = true
      document.head.appendChild(script)
    }
  })

  return googleScriptPromise
}

export function GoogleAuthButton({
  disabled = false,
  onCredential,
}: GoogleAuthButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const onCredentialRef = useRef(onCredential)

  useEffect(() => {
    onCredentialRef.current = onCredential
  }, [onCredential])

  useEffect(() => {
    let disposed = false
    const handler: CredentialHandler = (idToken) =>
      onCredentialRef.current(idToken)

    if (!googleClientId) return

    activeCredentialHandler = handler

    const renderGoogleButton = () => {
      if (disposed || !window.google || !containerRef.current) return

      const width = Math.max(
        200,
        Math.min(Math.floor(containerRef.current.clientWidth), 400),
      )
      containerRef.current.replaceChildren()
      window.google.accounts.id.renderButton(containerRef.current, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        shape: 'pill',
        text: 'continue_with',
        logo_alignment: 'left',
        width,
      })
    }

    loadGoogleIdentityScript()
      .then(() => {
        if (disposed || !window.google) return

        if (!initializedClientId) {
          window.google.accounts.id.initialize({
            client_id: googleClientId,
            callback: (response) => {
              if (response.credential) {
                activeCredentialHandler?.(response.credential)
              }
            },
          })
          initializedClientId = googleClientId
        } else if (initializedClientId !== googleClientId) {
          throw new Error('Google sign-in client ID changed after initialization.')
        }

        renderGoogleButton()
      })
      .catch((error: unknown) => {
        if (!disposed) {
          toast.error(error instanceof Error ? error.message : 'Google sign-in could not be loaded.')
        }
      })

    const resizeObserver = new ResizeObserver(renderGoogleButton)
    if (containerRef.current) resizeObserver.observe(containerRef.current)

    return () => {
      disposed = true
      resizeObserver.disconnect()
      containerRef.current?.replaceChildren()
      if (activeCredentialHandler === handler) activeCredentialHandler = undefined
    }
  }, [])

  if (!googleClientId) {
    return (
      <OAuthButton
        disabled={disabled}
        icon={googleMark}
        onClick={() => toast.error('Add VITE_GOOGLE_CLIENT_ID to enable Google sign-in.')}
        provider="Google"
      />
    )
  }

  return (
    <div
      aria-disabled={disabled}
      className={`flex min-h-auth-social w-full justify-center overflow-hidden ${disabled ? 'pointer-events-none opacity-60' : ''}`}
      ref={containerRef}
    />
  )
}
