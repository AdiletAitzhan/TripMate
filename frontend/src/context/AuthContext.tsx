import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import type { AuthUser } from "../api/authApi";
import { AuthContext } from "./authContextState";
import type { AuthState } from "./authContextState";

const ACCESS_KEY = "tripmate_access";
const REFRESH_KEY = "tripmate_refresh";
const USER_KEY = "tripmate_user";
const HAS_PROFILE_KEY = "tripmate_has_profile";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    accessToken: null,
    refreshToken: null,
    isReady: false,
    hasProfile: null,
  });

  // При загрузке страницы читаем токены из sessionStorage
  useEffect(() => {
    try {
      const access = sessionStorage.getItem(ACCESS_KEY);
      const refresh = sessionStorage.getItem(REFRESH_KEY);
      const userRaw = sessionStorage.getItem(USER_KEY);
      const hasProfileRaw = sessionStorage.getItem(HAS_PROFILE_KEY);
      const user = userRaw ? (JSON.parse(userRaw) as AuthUser) : null;
      const hasProfile = hasProfileRaw ? JSON.parse(hasProfileRaw) : null;
      if (access && refresh) {
        setState({
          accessToken: access,
          refreshToken: refresh,
          user,
          hasProfile,
          isReady: true,
        });
      } else {
        setState((s) => ({ ...s, isReady: true }));
      }
    } catch {
      setState((s) => ({ ...s, isReady: true }));
    }
  }, []);

  const setTokens = useCallback(
    (user: AuthUser, accessToken: string, refreshToken: string) => {
      sessionStorage.setItem(ACCESS_KEY, accessToken);
      sessionStorage.setItem(REFRESH_KEY, refreshToken);
      sessionStorage.setItem(USER_KEY, JSON.stringify(user));
      setState((s) => ({
        ...s,
        user,
        accessToken,
        refreshToken,
        isReady: true,
      }));
    },
    [],
  );

  const clearAuth = useCallback(() => {
    sessionStorage.removeItem(ACCESS_KEY);
    sessionStorage.removeItem(REFRESH_KEY);
    sessionStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(HAS_PROFILE_KEY);
    setState({
      user: null,
      accessToken: null,
      refreshToken: null,
      hasProfile: null,
      isReady: true,
    });
  }, []);

  const getAccessToken = useCallback(
    () => state.accessToken,
    [state.accessToken],
  );

  const checkProfile = useCallback(async (): Promise<boolean> => {
    if (!state.accessToken) return false;
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL ?? ""}/api/v1/profiles/me`,
        {
          headers: {
            Authorization: `Bearer ${state.accessToken}`,
            Accept: "application/json",
          },
        },
      );
      const hasProfile = response.ok;
      sessionStorage.setItem(HAS_PROFILE_KEY, JSON.stringify(hasProfile));
      setState((s) => ({ ...s, hasProfile }));
      return hasProfile;
    } catch {
      setState((s) => ({ ...s, hasProfile: false }));
      sessionStorage.setItem(HAS_PROFILE_KEY, JSON.stringify(false));
      return false;
    }
  }, [state.accessToken]);

  const setHasProfile = useCallback((hasProfile: boolean) => {
    sessionStorage.setItem(HAS_PROFILE_KEY, JSON.stringify(hasProfile));
    setState((s) => ({ ...s, hasProfile }));
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      setTokens,
      clearAuth,
      getAccessToken,
      checkProfile,
      setHasProfile,
    }),
    [state, setTokens, clearAuth, getAccessToken, checkProfile, setHasProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
