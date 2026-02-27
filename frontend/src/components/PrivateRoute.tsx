import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { useEffect, useState } from "react";

/** Защищённый маршрут: если нет токена — редирект на логин */
export function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { accessToken, isReady, hasProfile, checkProfile } = useAuth();
  const location = useLocation();
  const [checkingProfile, setCheckingProfile] = useState(true);

  useEffect(() => {
    if (isReady && accessToken && hasProfile === null) {
      // Check profile on first load if not cached
      checkProfile().finally(() => setCheckingProfile(false));
    } else {
      setCheckingProfile(false);
    }
  }, [isReady, accessToken, hasProfile, checkProfile]);

  if (!isReady || checkingProfile) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--text-secondary)",
        }}
      >
        Loading...
      </div>
    );
  }

  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  // Allow access to profile creation page without profile
  if (location.pathname === "/create-profile") {
    return <>{children}</>;
  }

  // Redirect to profile creation if user doesn't have a profile
  if (hasProfile === false) {
    return <Navigate to="/create-profile" replace />;
  }

  return <>{children}</>;
}
