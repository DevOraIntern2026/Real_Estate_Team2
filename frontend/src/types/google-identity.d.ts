export {}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: {
            client_id: string
            callback: (response: { credential: string }) => void
          }) => void
          renderButton: (
            parent: HTMLElement,
            options: {
              type: 'standard'
              theme: 'outline'
              size: 'large'
              shape: 'pill'
              text: 'continue_with'
              logo_alignment: 'left'
              width: number
            },
          ) => void
        }
      }
    }
  }
}
