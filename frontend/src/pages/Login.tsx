import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../api/authApi";
import { useAuth } from "../context/useAuth";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function Login() {
  const navigate = useNavigate();
  const { setTokens } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
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
      if (res.success && res.data) {
        setTokens(res.data.user, res.data.accessToken, res.data.refreshToken);
        navigate("/dashboard", { replace: true });
      } else {
        setError(res.error?.message ?? "Invalid email or password");
      }
    } catch {
      setError("Something went wrong. Try again.");
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
