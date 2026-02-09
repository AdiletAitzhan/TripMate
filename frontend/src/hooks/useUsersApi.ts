import { useCallback } from 'react'
import { useFetchWithAuth } from './useFetchWithAuth'

const BASE = import.meta.env.VITE_API_BASE_URL ?? ''

function apiUrl(path: string): string {
  const base = BASE.replace(/\/$/, '')
  const p = path.startsWith('/') ? path : `/${path}`
  return `${base}${p}`
}

export function useUsersApi() {
  const fetchWithAuth = useFetchWithAuth()

  const getProfile = useCallback(async () => {
    const res = await fetchWithAuth(apiUrl('/api/users/me'))
    const data = await res.json().catch(() => ({}))
    return data as { success: boolean; data?: unknown }
  }, [fetchWithAuth])

  const updateProfile = useCallback(
    async (body: { fullName?: string; location?: { city?: string; country?: string }; bio?: string; phone?: string }) => {
      const res = await fetchWithAuth(apiUrl('/api/users/me'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error((data as { error?: { message?: string } })?.error?.message ?? 'Failed to save profile')
      return data
    },
    [fetchWithAuth]
  )

  const uploadPhoto = useCallback(
    async (file: File) => {
      const form = new FormData()
      form.append('photo', file)
      const res = await fetchWithAuth(apiUrl('/api/users/me/photo'), {
        method: 'POST',
        body: form,
      })
      return res.json().catch(() => ({})) as Promise<{ success: boolean; data?: { photoUrl: string }; error?: { message: string } }>
    },
    [fetchWithAuth]
  )

  const updatePreferences = useCallback(
    async (body: { interests?: string[]; minAge?: number; maxAge?: number; preferredGender?: string; budgetRange?: { min?: number; max?: number; currency?: string } }) => {
      const res = await fetchWithAuth(apiUrl('/api/users/me/preferences'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(body),
      })
      return res.json().catch(() => ({}))
    },
    [fetchWithAuth]
  )

  const getStats = useCallback(async () => {
    const res = await fetchWithAuth(apiUrl('/api/users/me/stats'))
    return res.json().catch(() => ({})) as Promise<{ success: boolean; data?: unknown }>
  }, [fetchWithAuth])

  return { getProfile, updateProfile, uploadPhoto, updatePreferences, getStats }
}
