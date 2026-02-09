import { useCallback, useRef } from 'react'
import type { AuthUser } from '../api/authApi'
import { authApi } from '../api/authApi'
import { useAuth } from '../context/useAuth'

const TOKEN_EXPIRY_BUFFER_MS = 30_000

const FALLBACK_USER: AuthUser = {
  id: null,
  email: null,
  name: null,
  isNewUser: false,
  profileComplete: false,
}

/** Проверяет, истёк ли JWT (exp в секундах, с буфером). */
function isTokenExpired(token: string, bufferMs = TOKEN_EXPIRY_BUFFER_MS): boolean {
  try {
    const payload = token.split('.')[1]
    if (!payload) return true
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const decoded = JSON.parse(atob(base64)) as { exp?: number }
    if (decoded.exp == null) return false
    return decoded.exp * 1000 < Date.now() + bufferMs
  } catch {
    return true
  }
}

/**
 * Хук возвращает функцию fetch с авторизацией:
 * - Добавляет Authorization: Bearer <accessToken>.
 * - Если access истёк — сначала обновляет токен через refresh, затем шлёт запрос.
 * - При 401 обновляет токен и один раз повторяет запрос.
 * - При неудачном refresh вызывает clearAuth() и бросает ошибку.
 * - Один одновременный refresh для всех запросов (без дублирования вызовов).
 */
export function useFetchWithAuth() {
  const { getAccessToken, refreshToken, user, setTokens, clearAuth } = useAuth()
  const refreshPromiseRef = useRef<Promise<string> | null>(null)

  const performRefresh = useCallback(async (): Promise<string> => {
    if (!refreshToken) {
      clearAuth()
      throw new Error('Сессия истекла. Войдите снова.')
    }
    const res = await authApi.refreshToken(refreshToken)
    if (!res.success || !res.data) {
      clearAuth()
      throw new Error('Сессия истекла. Войдите снова.')
    }
    const currentUser = user ?? FALLBACK_USER
    setTokens(currentUser, res.data.accessToken, res.data.refreshToken)
    return res.data.accessToken
  }, [refreshToken, user, setTokens, clearAuth])

  const refreshAndGetToken = useCallback(async (): Promise<string> => {
    if (refreshPromiseRef.current) {
      return refreshPromiseRef.current
    }
    const promise = performRefresh().finally(() => {
      refreshPromiseRef.current = null
    })
    refreshPromiseRef.current = promise
    return promise
  }, [performRefresh])

  const fetchWithAuth = useCallback(
    async (url: string, init?: RequestInit): Promise<Response> => {
      const headers = new Headers(init?.headers)
      let token = getAccessToken()

      if (token && isTokenExpired(token)) {
        try {
          token = await refreshAndGetToken()
        } catch {
          throw new Error('Сессия истекла. Войдите снова.')
        }
      }

      if (token) {
        headers.set('Authorization', `Bearer ${token}`)
      }

      let res = await fetch(url, { ...init, headers })

      if (res.status === 401) {
        try {
          token = await refreshAndGetToken()
          headers.set('Authorization', `Bearer ${token}`)
          res = await fetch(url, { ...init, headers })
        } catch {
          throw new Error('Сессия истекла. Войдите снова.')
        }
      }

      return res
    },
    [getAccessToken, refreshAndGetToken]
  )

  return fetchWithAuth
}
