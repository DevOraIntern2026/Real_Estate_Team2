import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { signUp } from '@/features/auth/api/authApi'
import type { SignUpRequest } from '@/features/auth/types/signUp.types'
import type { ApiResponse } from '@/types/api'
import { getApiErrorMessage } from '@/features/auth/utils/getApiErrorMessage'

type UseSignUpOptions = {
  onSuccess?: (payload: SignUpRequest) => void
}

export function useSignUp(options: UseSignUpOptions = {}) {
  return useMutation<ApiResponse, Error, SignUpRequest>({
    mutationFn: signUp,
    onSuccess: (response, payload) => {
      if (response.message) toast.success(response.message)
      options.onSuccess?.(payload)
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error))
    },
  })
}
