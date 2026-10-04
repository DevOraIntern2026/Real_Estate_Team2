import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  googleAuth,
  type GoogleAuthRequest,
  type LoginResult,
} from '@/features/auth/api/authApi'
import { getApiErrorMessage } from '@/features/auth/utils/getApiErrorMessage'
import { saveAuthTokens } from '@/services/api/tokenStorage'

type GoogleAuthVariables = GoogleAuthRequest & {
  rememberMe: boolean
}

export function useGoogleAuth() {
  return useMutation<LoginResult, Error, GoogleAuthVariables>({
    mutationFn: ({ idToken, role }) => googleAuth({ idToken, role }),
    onSuccess: (result, variables) => {
      saveAuthTokens(result.tokens, variables.rememberMe)
      if (result.message) toast.success(result.message)
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error))
    },
  })
}
