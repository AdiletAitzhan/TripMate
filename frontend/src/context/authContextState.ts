import { createContext } from "react";
import type { AuthUser } from "../api/authApi";

export type AuthState = {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isReady: boolean;
  hasProfile: boolean | null;
};

export type AuthContextValue = AuthState & {
  setTokens: (
    user: AuthUser,
    accessToken: string,
    refreshToken: string,
  ) => void;
  clearAuth: () => void;
  getAccessToken: () => string | null;
  checkProfile: () => Promise<boolean>;
  setHasProfile: (hasProfile: boolean) => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
