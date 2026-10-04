import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { requestPasswordResetOtp } from '@/features/auth/api/authApi'
import type { ResendConfirmationEmailRequest } from '@/features/auth/api/authApi'
import { getApiErrorMessage } from '@/features/auth/utils/getApiErrorMessage'
import type { ApiResponse } from '@/types/api'

type UseForgotPasswordOptions = {
  onSuccess?: (payload: ResendConfirmationEmailRequest) => void
}

export function useForgotPassword(options: UseForgotPasswordOptions = {}) {
  return useMutation<ApiResponse, Error, ResendConfirmationEmailRequest>({
    mutationFn: requestPasswordResetOtp,
    onSuccess: (response, payload) => {
      if (response.message) toast.success(response.message)
      options.onSuccess?.(payload)
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error))
    },
  })
}
