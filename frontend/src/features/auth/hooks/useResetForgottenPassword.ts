import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  verifyPasswordReset,
  type VerifyForgotPasswordRequest,
} from '@/features/auth/api/authApi'
import { getApiErrorMessage } from '@/features/auth/utils/getApiErrorMessage'
import type { ApiResponse } from '@/types/api'

type UseResetForgottenPasswordOptions = {
  onSuccess?: () => void
}

export function useResetForgottenPassword(
  options: UseResetForgottenPasswordOptions = {},
) {
  return useMutation<ApiResponse, Error, VerifyForgotPasswordRequest>({
    mutationFn: verifyPasswordReset,
    onSuccess: (response) => {
      if (response.message) toast.success(response.message)
      options.onSuccess?.()
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error))
    },
  })
}
