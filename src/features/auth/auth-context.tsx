import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { authApi, usersApi } from '../../shared/api/services'
import { clearSession, getAuthToken, getAuthUser, setAuthToken, setAuthUser } from '../../shared/lib/storage'
import type { LoginRequest, RegisterRequest, UserDto } from '../../shared/types/models'

interface AuthContextValue {
  user: UserDto | null
  token: string | null
  isHydrating: boolean
  isAuthenticated: boolean
  login: (payload: LoginRequest) => Promise<void>
  register: (payload: RegisterRequest) => Promise<void>
  logout: () => void
  refreshMe: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => getAuthToken())
  const [user, setUser] = useState<UserDto | null>(() => getAuthUser())
  const [isHydrating, setIsHydrating] = useState(true)

  const applySession = useCallback((nextToken: string, nextUser: UserDto) => {
    setAuthToken(nextToken)
    setAuthUser(nextUser)
    setToken(nextToken)
    setUser(nextUser)
  }, [])

  const logout = useCallback(() => {
    clearSession()
    setToken(null)
    setUser(null)
  }, [])

  const refreshMe = useCallback(async () => {
    const me = await usersApi.me()
    setUser(me)
    setAuthUser(me)
  }, [])

  const login = useCallback(
    async (payload: LoginRequest) => {
      const response = await authApi.login(payload)
      applySession(response.token, response.user)
    },
    [applySession],
  )

  const register = useCallback(
    async (payload: RegisterRequest) => {
      const response = await authApi.register(payload)
      applySession(response.token, response.user)
    },
    [applySession],
  )

  useEffect(() => {
    let cancelled = false

    async function bootstrap() {
      const storedToken = getAuthToken()
      if (!storedToken) {
        if (!cancelled) {
          setIsHydrating(false)
        }
        return
      }

      try {
        const me = await usersApi.me()
        if (!cancelled) {
          setUser(me)
          setAuthUser(me)
        }
      } catch {
        if (!cancelled) {
          logout()
        }
      } finally {
        if (!cancelled) {
          setIsHydrating(false)
        }
      }
    }

    bootstrap()

    return () => {
      cancelled = true
    }
  }, [logout])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isHydrating,
      isAuthenticated: Boolean(token),
      login,
      register,
      logout,
      refreshMe,
    }),
    [user, token, isHydrating, login, register, logout, refreshMe],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
