/**
 * В dev используем прокси Vite (/api → 8083), чтобы запросы шли с того же origin
 * и шлюз не возвращал 401 на cross-origin. В prod — VITE_API_BASE_URL или пусто.
 */
const BASE = import.meta.env.VITE_API_BASE_URL ?? ''

export type ApiError = { code: string; message: string }

export type UserLoginResponse = {
  success: boolean
  data?: { user: AuthUser; accessToken: string; refreshToken: string }
  error?: ApiError
}

export type AuthUser = {
  id: string | null
  email: string | null
  name: string | null
  isNewUser: boolean
  profileComplete: boolean
}

export type RegisterResponse = {
  success: boolean
  data?: { userId: string; email: string; verificationRequired: boolean; message: string }
  error?: ApiError
}

export type VerifyEmailResponse = {
  success: boolean
  data?: { verified: boolean; accessToken: string; refreshToken: string }
  error?: ApiError
}

export type SimpleMessageResponse = {
  success: boolean
  message?: string
  error?: ApiError
}

const fetchOpts: RequestInit = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
}

/** Общая функция: POST на path с JSON body */
async function request<T>(path: string, body: object): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { ...fetchOpts, body: JSON.stringify(body) })
  const data = (await res.json().catch(() => ({}))) as T
  return data
}

export const authApi = {
  async login(email: string, password: string): Promise<UserLoginResponse> {
    const res = await fetch(`${BASE}/api/auth/login`, {
      ...fetchOpts,
      body: JSON.stringify({ email, password }),
    })
    const data = (await res.json().catch(() => ({}))) as UserLoginResponse
    return data
  },

  async register(payload: {
    email: string
    password: string
    firstName: string
    lastName: string
    dateOfBirth: string
    gender: string
  }): Promise<RegisterResponse> {
    const res = await fetch(`${BASE}/api/auth/register`, {
      ...fetchOpts,
      body: JSON.stringify(payload),
    })
    const data = (await res.json().catch(() => ({}))) as RegisterResponse
    return data
  },

  async verifyEmail(email: string, code: string): Promise<VerifyEmailResponse> {
    return request<VerifyEmailResponse>('/api/auth/verify-email', { email, code })
  },

  async resendVerification(email: string): Promise<SimpleMessageResponse> {
    return request<SimpleMessageResponse>('/api/auth/resend-verification', { email })
  },

  async forgotPassword(email: string): Promise<SimpleMessageResponse> {
    return request<SimpleMessageResponse>('/api/auth/forgot-password', { email })
  },

  async resetPassword(token: string, newPassword: string): Promise<SimpleMessageResponse> {
    return request<SimpleMessageResponse>('/api/auth/reset-password', { token, newPassword })
  },

  async refreshToken(refreshToken: string) {
    return request<{ success: boolean; data?: { accessToken: string; refreshToken: string }; error?: ApiError }>(
      '/api/auth/refresh-token',
      { refreshToken }
    )
  },

  async logout(refreshToken: string): Promise<SimpleMessageResponse> {
    return request<SimpleMessageResponse>('/api/auth/logout', { refreshToken })
  },
}
