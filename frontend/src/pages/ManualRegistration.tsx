import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../api/authApi";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ManualRegistration() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [terms, setTerms] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordMatch = !confirmPassword || password === confirmPassword;
  const emailValid = !email.trim() || EMAIL_RE.test(email.trim());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!passwordMatch) {
      setError("Passwords do not match");
      return;
    }
    if (!terms) {
      setError("Please agree to Terms & Privacy Policy");
      return;
    }
    const trimmedEmail = email.trim();
    if (!EMAIL_RE.test(trimmedEmail)) {
      setError("Please enter a valid email address");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.register({
        email: trimmedEmail,
        password,
      });

      // New API returns { user, message, verification_code }
      if (res.user) {
        navigate("/verify-email", {
          state: {
            email: trimmedEmail,
            userId: res.user.id,
            message: res.message,
          },
        });
      } else {
        setError("Registration failed. Please try again.");
      }
    } catch (err) {
      const errorMessage =
        (err as Error).message || "Something went wrong. Try again.";
      if (errorMessage.includes("already") || errorMessage.includes("exists")) {
        setError(
          "This email is already registered. Try logging in or use another email.",
        );
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="grain" aria-hidden="true" />
      <div className="auth-layout">
        <div className="auth-card">
          <Link to="/signup" className="back-btn">
            ← Back
          </Link>
          <div className="progress-label">Step 1 of 2</div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: "50%" }} />
          </div>
          <h1 className="auth-heading">Create your account</h1>
          <p className="auth-sub">
            We only need your email and password to get started.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="input-wrap">
              <label htmlFor="reg-email">Email</label>
              <input
                id="reg-email"
                type="email"
                className={`input-field ${email.trim() && !emailValid ? "error" : ""}`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              {email.trim() && !emailValid && (
                <div className="input-error">
                  Please enter a valid email address
                </div>
              )}
            </div>
            <div className="input-wrap">
              <label htmlFor="reg-password">Password</label>
              <input
                id="reg-password"
                type="password"
                className="input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
              <div
                style={{
                  fontSize: "0.875rem",
                  color: "var(--text-muted)",
                  marginTop: 4,
                }}
              >
                Must be at least 8 characters
              </div>
            </div>
            <div className="input-wrap">
              <label htmlFor="reg-confirm">Confirm Password</label>
              <input
                id="reg-confirm"
                type="password"
                className={`input-field ${!passwordMatch ? "error" : ""}`}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              {!passwordMatch && (
                <div className="input-error">Passwords do not match</div>
              )}
            </div>
            <div className="checkbox-wrap">
              <input
                id="reg-terms"
                type="checkbox"
                checked={terms}
                onChange={(e) => setTerms(e.target.checked)}
              />
              <label htmlFor="reg-terms">
                I agree to Terms & Privacy Policy
              </label>
            </div>
            {error && (
              <div className="input-error" style={{ marginBottom: 12 }}>
                {error}
              </div>
            )}
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
