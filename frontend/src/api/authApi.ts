import type {
  AuthResponse,
  RegisterResponse,
  MessageResponse,
  UserRegisterRequest,
  UserLoginRequest,
  EmailVerificationRequest,
  ResendVerificationRequest,
  PasswordResetRequest,
  PasswordResetConfirm,
  PasswordChange,
  UserResponse,
  TokenResponse,
} from "../types/auth";

/**
 * В dev используем прокси Vite (/api → 8083), чтобы запросы шли с того же origin
 * и шлюз не возвращал 401 на cross-origin. В prod — VITE_API_BASE_URL или пусто.
 */
const BASE = import.meta.env.VITE_API_BASE_URL ?? "";

// Mock mode - set to false to use real backend API
const USE_MOCK = false;

export type ApiError = { code: string; message: string };

// Legacy types for backward compatibility
export type UserLoginResponse = {
  success: boolean;
  data?: { user: AuthUser; accessToken: string; refreshToken: string };
  error?: ApiError;
};

export type AuthUser = {
  id: string | null;
  email: string | null;
  name: string | null;
  isNewUser: boolean;
  profileComplete: boolean;
};

export type VerifyEmailResponse = {
  success: boolean;
  data?: { verified: boolean; accessToken: string; refreshToken: string };
  error?: ApiError;
};

export type SimpleMessageResponse = {
  success: boolean;
  message?: string;
  error?: ApiError;
};

const fetchOpts: RequestInit = {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
};

/** Общая функция: POST на path с JSON body */
async function request<T>(path: string, body: object): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...fetchOpts,
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Request failed" }));
    throw new Error(
      error.message || error.detail?.[0]?.msg || "Request failed",
    );
  }
  return res.json();
}

// Import mock API
import { mockAuthApi } from "./mockAuthApi";

export const authApi = {
  async login(email: string, password: string): Promise<AuthResponse> {
    if (USE_MOCK) {
      const mockResponse = await mockAuthApi.login(email, password);
      if (mockResponse.success && mockResponse.data) {
        return {
          access_token: mockResponse.data.accessToken,
          token_type: "bearer",
          user: {
            id: parseInt(mockResponse.data.user.id || "0"),
            email: mockResponse.data.user.email || "",
            role: "user",
            is_verified: true,
            is_active: true,
            created_at: new Date().toISOString(),
          },
        };
      }
      throw new Error(mockResponse.error?.message || "Login failed");
    }
    const body: UserLoginRequest = { email, password };
    return request<AuthResponse>("/api/v1/auth/login", body);
  },

  async register(payload: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string;
    gender?: string;
  }): Promise<RegisterResponse> {
    if (USE_MOCK) {
      // For mock, return a compatible response
      return {
        user: {
          id: Date.now(),
          email: payload.email,
          role: "user",
          is_verified: false,
          is_active: true,
          created_at: new Date().toISOString(),
        },
        message: "Registration successful. Please verify your email.",
        verification_code: "1234",
      };
    }
    const body: UserRegisterRequest = {
      email: payload.email,
      password: payload.password,
      role: "user",
    };
    return request<RegisterResponse>("/api/v1/auth/register", body);
  },

  async verifyEmail(userId: number, code: string): Promise<MessageResponse> {
    if (USE_MOCK) {
      return { message: "Email verified successfully" };
    }
    const body: EmailVerificationRequest = {
      user_id: userId,
      verification_code: code,
    };
    return request<MessageResponse>("/api/v1/auth/verify-email", body);
  },

  async resendVerification(userId: number): Promise<MessageResponse> {
    if (USE_MOCK) {
      return { message: "Verification code sent" };
    }
    const body: ResendVerificationRequest = { user_id: userId };
    return request<MessageResponse>("/api/v1/auth/resend-verification", body);
  },

  async forgotPassword(email: string): Promise<MessageResponse> {
    if (USE_MOCK) {
      return { message: "Password reset email sent" };
    }
    const body: PasswordResetRequest = { email };
    return request<MessageResponse>("/api/v1/auth/forgot-password", body);
  },

  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<MessageResponse> {
    if (USE_MOCK) {
      return { message: "Password reset successful" };
    }
    const body: PasswordResetConfirm = { token, new_password: newPassword };
    return request<MessageResponse>("/api/v1/auth/reset-password", body);
  },

  async changePassword(
    currentPassword: string,
    newPassword: string,
    accessToken: string,
  ): Promise<MessageResponse> {
    if (USE_MOCK) {
      return { message: "Password changed successfully" };
    }
    const body: PasswordChange = {
      current_password: currentPassword,
      new_password: newPassword,
    };
    const res = await fetch(`${BASE}/api/v1/auth/change-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const error = await res
        .json()
        .catch(() => ({ message: "Request failed" }));
      throw new Error(
        error.message || error.detail?.[0]?.msg || "Request failed",
      );
    }
    return res.json();
  },

  async getMe(accessToken: string): Promise<UserResponse> {
    if (USE_MOCK) {
      return {
        id: 1,
        email: "user@example.com",
        role: "user",
        is_verified: true,
        is_active: true,
        created_at: new Date().toISOString(),
      };
    }
    const res = await fetch(`${BASE}/api/v1/auth/me`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (!res.ok) {
      const error = await res
        .json()
        .catch(() => ({ message: "Request failed" }));
      throw new Error(
        error.message || error.detail?.[0]?.msg || "Request failed",
      );
    }
    return res.json();
  },

  async refreshToken(accessToken: string): Promise<TokenResponse> {
    if (USE_MOCK) {
      const mockResponse = await mockAuthApi.refreshToken();
      if (mockResponse.success && mockResponse.data) {
        return {
          access_token: mockResponse.data.accessToken,
          token_type: "bearer",
        };
      }
      // This won't happen in mock, but for type safety
      throw new Error("Token refresh failed");
    }
    const res = await fetch(`${BASE}/api/v1/auth/refresh`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (!res.ok) {
      const error = await res
        .json()
        .catch(() => ({ message: "Request failed" }));
      throw new Error(
        error.message || error.detail?.[0]?.msg || "Request failed",
      );
    }
    return res.json();
  },

  async logout(accessToken: string): Promise<MessageResponse> {
    if (USE_MOCK) {
      return { message: "Logged out successfully" };
    }
    const res = await fetch(`${BASE}/api/v1/auth/logout`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (!res.ok) {
      const error = await res
        .json()
        .catch(() => ({ message: "Request failed" }));
      throw new Error(
        error.message || error.detail?.[0]?.msg || "Request failed",
      );
    }
    return res.json();
  },
};
