import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { logout, type LogoutRequest } from '@/features/auth/api/authApi'
import { getApiErrorMessage } from '@/features/auth/utils/getApiErrorMessage'
import { clearAuthTokens } from '@/services/api/tokenStorage'

export function useLogout() {
  return useMutation({
    mutationFn: (payload: LogoutRequest) => logout(payload),
    onSuccess: (response) => {
      if (response.message) toast.success(response.message)
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error))
    },
    onSettled: () => {
      clearAuthTokens()
    },
  })
}
