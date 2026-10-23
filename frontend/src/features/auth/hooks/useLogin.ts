import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { login, type LoginResult } from '@/features/auth/api/authApi'
import type { LoginFormValues } from '@/features/auth/schemas/loginSchema'
import { getApiErrorMessage } from '@/features/auth/utils/getApiErrorMessage'
import { saveAuthTokens } from '@/services/api/tokenStorage'

export function useLogin() {
  return useMutation<LoginResult, Error, LoginFormValues>({
    mutationFn: ({ email, password }) => login({ email, password }),
    onSuccess: (result, values) => {
      saveAuthTokens(result.tokens, values.rememberMe)
      if (result.message) toast.success(result.message)
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error))
    },
  })
}
