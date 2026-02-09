import { createContext } from 'react'
import type { AuthUser } from '../api/authApi'

export type AuthState = {
  user: AuthUser | null
  accessToken: string | null
  refreshToken: string | null
  isReady: boolean
}

export type AuthContextValue = AuthState & {
  setTokens: (user: AuthUser, accessToken: string, refreshToken: string) => void
  clearAuth: () => void
  getAccessToken: () => string | null
}

export const AuthContext = createContext<AuthContextValue | null>(null)
