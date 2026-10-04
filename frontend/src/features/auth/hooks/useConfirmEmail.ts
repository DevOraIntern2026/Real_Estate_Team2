import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  confirmEmail,
  type ConfirmEmailRequest,
} from '@/features/auth/api/authApi'
import { getApiErrorMessage } from '@/features/auth/utils/getApiErrorMessage'
import type { ApiResponse } from '@/types/api'

type UseConfirmEmailOptions = {
  onSuccess?: () => void
}

export function useConfirmEmail(options: UseConfirmEmailOptions = {}) {
  return useMutation<ApiResponse, Error, ConfirmEmailRequest>({
    mutationFn: confirmEmail,
    onSuccess: (response) => {
      if (response.message) toast.success(response.message)
      options.onSuccess?.()
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error))
    },
  })
}
