import { apiClient } from '@/services/api/apiClient'
import type { ApiResponse } from '@/types/api'
import type { SignUpRequest } from '@/features/auth/types/signUp.types'

export type ConfirmEmailRequest = {
  email: string
  otp: string
}

export type ResendConfirmationEmailRequest = {
  email: string
}

export type VerifyForgotPasswordRequest = {
  email: string
  otp: string
  newPassword: string
}

export type LoginRequest = {
  email: string
  password: string
}

export type AuthTokens = {
  accessToken: string
  refreshToken: string
}

type LoginApiResponse = {
  message?: string
  loginTokens?: AuthTokens
  accessToken?: string
  refreshToken?: string
  data?: {
    loginTokens?: AuthTokens
    accessToken?: string
    refreshToken?: string
  }
}

export type LoginResult = {
  message?: string
  tokens: AuthTokens
}

export type GoogleAuthRequest = {
  idToken: string
  role: '1' | '2'
}

type GoogleAuthApiResponse = {
  message?: string
  loginTokens?: AuthTokens
  data?: {
    loginTokens?: AuthTokens
    accessToken?: string
    refreshToken?: string
  }
}

export async function googleAuth(
  payload: GoogleAuthRequest,
): Promise<LoginResult> {
  const { data } = await apiClient.post<GoogleAuthApiResponse>(
    '/auth/signup/gmail',
    payload,
  )
  const tokens = data.data?.loginTokens ?? data.loginTokens ?? data.data

  if (!tokens?.accessToken || !tokens.refreshToken) {
    throw new Error(data.message ?? 'Google sign-in response did not include auth tokens.')
  }

  return {
    message: data.message,
    tokens: {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    },
  }
}

export async function login(payload: LoginRequest): Promise<LoginResult> {
  const { data } = await apiClient.post<LoginApiResponse>('/auth/login', payload)
  const tokens = data.loginTokens ?? data.data?.loginTokens ?? data.data ?? data

  if (!tokens.accessToken || !tokens.refreshToken) {
    throw new Error(data.message ?? 'Login response did not include auth tokens.')
  }

  return {
    message: data.message,
    tokens: {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    },
  }
}

export async function signUp(payload: SignUpRequest) {
  const { data } = await apiClient.post<ApiResponse>('/auth/signup', payload)

  return data
}

export async function confirmEmail(payload: ConfirmEmailRequest) {
  const { data } = await apiClient.patch<ApiResponse>(
    '/auth/confirmEmail',
    payload,
  )

  return data
}

export async function resendConfirmationEmail(
  payload: ResendConfirmationEmailRequest,
) {
  const { data } = await apiClient.patch<ApiResponse>(
    '/auth/resendConfirmationEmail',
    payload,
  )

  return data
}

export async function requestPasswordResetOtp(
  payload: ResendConfirmationEmailRequest,
) {
  const { data } = await apiClient.post<ApiResponse>(
    '/auth/forgotPassword',
    payload,
  )

  return data
}

export async function verifyPasswordReset(
  payload: VerifyForgotPasswordRequest,
) {
  const { data } = await apiClient.post<ApiResponse>(
    '/auth/verify/forgotPassword',
    payload,
  )

  return data
}
