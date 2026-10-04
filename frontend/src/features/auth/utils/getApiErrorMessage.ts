import axios from 'axios'

type ApiErrorResponse = {
  Error?: string
  message?: string | string[]
}

export function getApiErrorMessage(error: Error) {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) return error.message

  const response = error.response?.data
  const message = response?.Error ?? response?.message

  if (Array.isArray(message)) return message.join(', ')
  return message ?? error.message
}
