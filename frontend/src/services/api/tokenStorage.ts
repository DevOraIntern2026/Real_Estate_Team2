import type { AuthTokens } from '@/features/auth/api/authApi'

const ACCESS_TOKEN_KEY = 'ACCESS_TOKEN'
const REFRESH_TOKEN_KEY = 'REFRESH_TOKEN'
const AUTH_SESSION_KEY = 'AUTH_SESSION'

export type UserRole = 'owner' | 'customer' | 'admin'

export type AuthSession = {
  userId: string
  name: string
  role: UserRole
  expiresAt: number
}

type AccessTokenPayload = {
  sub?: unknown
  name?: unknown
  aud?: unknown
  exp?: unknown
}

let cachedAccessToken: string | null | undefined
let cachedAuthSession: AuthSession | null = null

function getActiveStorage(): Storage | null {
  if (typeof window === 'undefined') return null

  return localStorage.getItem(ACCESS_TOKEN_KEY)
    ? localStorage
    : sessionStorage.getItem(ACCESS_TOKEN_KEY)
      ? sessionStorage
      : null
}

function decodePayload(token: string): AccessTokenPayload {
  const parts = token.split('.')
  const encodedPayload = parts[1]

  if (parts.length !== 3 || !encodedPayload) {
    throw new Error('Invalid access token.')
  }

  const base64 = encodedPayload.replace(/-/g, '+').replace(/_/g, '/')
  const paddedBase64 = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')
  const binaryPayload = atob(paddedBase64)
  const payloadBytes = Uint8Array.from(binaryPayload, (character) =>
    character.charCodeAt(0),
  )

  return JSON.parse(new TextDecoder().decode(payloadBytes)) as AccessTokenPayload
}

export function decodeAccessToken(token: string): AuthSession {
  const payload = decodePayload(token)
  const audiences = Array.isArray(payload.aud) ? payload.aud : [payload.aud]
  const tokenType = Number(audiences[0])
  const roleAudience = Number(audiences[1])

  if (tokenType !== 0) throw new Error('The token is not an access token.')
  if (typeof payload.sub !== 'string' || !payload.sub) {
    throw new Error('The access token does not identify a user.')
  }
  if (typeof payload.exp !== 'number' || payload.exp <= Date.now() / 1000) {
    throw new Error('The access token has expired.')
  }

  const roleByAudience: Record<number, UserRole> = {
    0: 'owner',
    1: 'customer',
    2: 'admin',
  }
  const role = roleByAudience[roleAudience]

  if (!role) throw new Error('The access token has an unknown role.')

  return {
    userId: payload.sub,
    name: typeof payload.name === 'string' ? payload.name : '',
    role,
    expiresAt: payload.exp,
  }
}

export function getAccessToken() {
  return (
    localStorage.getItem(ACCESS_TOKEN_KEY) ??
    sessionStorage.getItem(ACCESS_TOKEN_KEY)
  )
}

export function saveAuthTokens(tokens: AuthTokens, rememberMe: boolean) {
  const authSession = decodeAccessToken(tokens.accessToken)
  const storage = rememberMe ? localStorage : sessionStorage
  const otherStorage = rememberMe ? sessionStorage : localStorage

  otherStorage.removeItem(ACCESS_TOKEN_KEY)
  otherStorage.removeItem(REFRESH_TOKEN_KEY)
  otherStorage.removeItem(AUTH_SESSION_KEY)
  storage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken)
  storage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken)
  storage.setItem(AUTH_SESSION_KEY, JSON.stringify(authSession))
  cachedAccessToken = tokens.accessToken
  cachedAuthSession = authSession
}

export function getAuthSession(): AuthSession | null {
  const accessToken = getAccessToken()

  if (accessToken === cachedAccessToken) return cachedAuthSession
  cachedAccessToken = accessToken

  if (!accessToken) {
    cachedAuthSession = null
    return null
  }

  try {
    const authSession = decodeAccessToken(accessToken)
    const storage = getActiveStorage()
    const persistedSession = storage?.getItem(AUTH_SESSION_KEY)

    if (persistedSession !== JSON.stringify(authSession)) {
      storage?.setItem(AUTH_SESSION_KEY, JSON.stringify(authSession))
    }

    cachedAuthSession = authSession
    return authSession
  } catch {
    clearAuthTokens()
    cachedAccessToken = null
    cachedAuthSession = null
    return null
  }
}

export function clearAuthTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(AUTH_SESSION_KEY)
  sessionStorage.removeItem(ACCESS_TOKEN_KEY)
  sessionStorage.removeItem(REFRESH_TOKEN_KEY)
  sessionStorage.removeItem(AUTH_SESSION_KEY)
  cachedAccessToken = null
  cachedAuthSession = null
}
