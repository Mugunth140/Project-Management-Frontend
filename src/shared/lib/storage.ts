import type { UserDto } from '../types/models'

const AUTH_TOKEN_KEY = 'pm.auth.token'
const AUTH_USER_KEY = 'pm.auth.user'

export function getAuthToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY)
}

export function setAuthToken(token: string): void {
  localStorage.setItem(AUTH_TOKEN_KEY, token)
}

export function clearAuthToken(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY)
}

export function getAuthUser(): UserDto | null {
  const raw = localStorage.getItem(AUTH_USER_KEY)
  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw) as UserDto
  } catch {
    localStorage.removeItem(AUTH_USER_KEY)
    return null
  }
}

export function setAuthUser(user: UserDto): void {
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user))
}

export function clearAuthUser(): void {
  localStorage.removeItem(AUTH_USER_KEY)
}

export function clearSession(): void {
  clearAuthToken()
  clearAuthUser()
}
