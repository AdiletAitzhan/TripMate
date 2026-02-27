// Authentication Types - matching OpenAPI spec

export interface UserResponse {
  id: number;
  email: string;
  role: string;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type?: string;
  user: UserResponse;
}

export interface TokenResponse {
  access_token: string;
  token_type?: string;
}

export interface RegisterResponse {
  user: UserResponse;
  message: string;
  verification_code?: string | null;
}

export interface MessageResponse {
  message: string;
}

export interface UserRegisterRequest {
  email: string;
  password: string;
  role?: string | null;
}

export interface UserLoginRequest {
  email: string;
  password: string;
}

export interface EmailVerificationRequest {
  user_id: number;
  verification_code: string;
}

export interface ResendVerificationRequest {
  user_id: number;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  new_password: string;
}

export interface PasswordChange {
  current_password: string;
  new_password: string;
}

export interface HTTPValidationError {
  detail?: Array<{
    loc: Array<string | number>;
    msg: string;
    type: string;
    input?: any;
    ctx?: Record<string, any>;
  }>;
}

// For language/interest/travel style management
export interface LanguageBase {
  language_id: number;
}

export interface InterestBase {
  interest_id: number;
}

export interface TravelStyleBase {
  travel_style_id: number;
}
