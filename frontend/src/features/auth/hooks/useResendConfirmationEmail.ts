import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  resendConfirmationEmail,
  type ResendConfirmationEmailRequest,
} from '@/features/auth/api/authApi'
import { getApiErrorMessage } from '@/features/auth/utils/getApiErrorMessage'
import type { ApiResponse } from '@/types/api'

export function useResendConfirmationEmail() {
  return useMutation<ApiResponse, Error, ResendConfirmationEmailRequest>({
    mutationFn: resendConfirmationEmail,
    onSuccess: (response) => {
      if (response.message) toast.success(response.message)
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error))
    },
  })
}
