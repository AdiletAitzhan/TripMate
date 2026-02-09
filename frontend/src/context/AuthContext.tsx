import { useState, useEffect, useCallback, useMemo, type ReactNode } from 'react'
import type { AuthUser } from '../api/authApi'
import { AuthContext } from './authContextState'
import type { AuthState } from './authContextState'

const ACCESS_KEY = 'tripmate_access'
const REFRESH_KEY = 'tripmate_refresh'
const USER_KEY = 'tripmate_user'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    accessToken: null,
    refreshToken: null,
    isReady: false,
  })

  // При загрузке страницы читаем токены из sessionStorage
  useEffect(() => {
    try {
      const access = sessionStorage.getItem(ACCESS_KEY)
      const refresh = sessionStorage.getItem(REFRESH_KEY)
      const userRaw = sessionStorage.getItem(USER_KEY)
      const user = userRaw ? (JSON.parse(userRaw) as AuthUser) : null
      if (access && refresh) {
        setState({ accessToken: access, refreshToken: refresh, user, isReady: true })
      } else {
        setState((s) => ({ ...s, isReady: true }))
      }
    } catch {
      setState((s) => ({ ...s, isReady: true }))
    }
  }, [])

  const setTokens = useCallback((user: AuthUser, accessToken: string, refreshToken: string) => {
    sessionStorage.setItem(ACCESS_KEY, accessToken)
    sessionStorage.setItem(REFRESH_KEY, refreshToken)
    sessionStorage.setItem(USER_KEY, JSON.stringify(user))
    setState({ user, accessToken, refreshToken, isReady: true })
  }, [])

  const clearAuth = useCallback(() => {
    sessionStorage.removeItem(ACCESS_KEY)
    sessionStorage.removeItem(REFRESH_KEY)
    sessionStorage.removeItem(USER_KEY)
    setState({ user: null, accessToken: null, refreshToken: null, isReady: true })
  }, [])

  const getAccessToken = useCallback(() => state.accessToken, [state.accessToken])

  const value = useMemo(
    () => ({
      ...state,
      setTokens,
      clearAuth,
      getAccessToken,
    }),
    [state, setTokens, clearAuth, getAccessToken]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
