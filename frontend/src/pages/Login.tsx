import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { authApi } from "../api/authApi";
import { useAuth } from "../context/useAuth";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setTokens, checkProfile } = useAuth();
  const [email, setEmail] = useState((location.state as any)?.email || "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState(
    (location.state as any)?.message || "",
  );
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError("Email is required");
      return;
    }
    if (!EMAIL_RE.test(trimmedEmail)) {
      setError("Please enter a valid email address");
      return;
    }
    if (!password) {
      setError("Password is required");
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.login(trimmedEmail, password);
      // New API returns AuthResponse { access_token, user }
      if (res.access_token && res.user) {
        const user = {
          id: String(res.user.id),
          email: res.user.email,
          name: null,
          isNewUser: !res.user.is_verified,
          profileComplete: res.user.is_verified,
        };
        setTokens(user, res.access_token, res.access_token); // Using access_token for both since no refresh token

        // Check if user has a profile
        const hasProfile = await checkProfile();

        if (hasProfile) {
          navigate("/home", { replace: true });
        } else {
          navigate("/create-profile", { replace: true });
        }
      } else {
        setError("Invalid response from server");
      }
    } catch (err) {
      const errorMessage =
        (err as Error).message || "Invalid email or password";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="grain" aria-hidden="true" />
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-card">
            <h1 className="auth-title">Welcome back</h1>
            <p className="auth-subtitle">Pick up where you left off</p>

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="auth-field">
                <label htmlFor="login-email" className="auth-label">
                  Email
                </label>
                <input
                  id="login-email"
                  type="email"
                  className="auth-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div className="auth-field">
                <label htmlFor="login-password" className="auth-label">
                  Password
                </label>
                <input
                  id="login-password"
                  type="password"
                  className="auth-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
                <Link to="/forgot-password" className="auth-link">
                  Forgot password?
                </Link>
              </div>
              {successMessage && (
                <div
                  className="auth-success"
                  style={{ color: "green", marginBottom: "12px" }}
                >
                  {successMessage}
                </div>
              )}
              {error && <div className="auth-error">{error}</div>}
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? "Signing in…" : "Log in"}
              </button>
            </form>

            <p className="auth-footer">
              New here?{" "}
              <Link to="/signup" className="auth-footer-link">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
