import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../api/authApi";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function RequestVerification() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const trimmedEmail = email.trim();
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
      // Login to get user_id, then resend verification
      const loginRes = await authApi.login(trimmedEmail, password);
      const userId = loginRes.user.id;

      await authApi.resendVerification(userId);

      navigate("/verify-email", {
        state: {
          email: trimmedEmail,
          userId,
          message: "Verification code sent to your email.",
        },
      });
    } catch (err) {
      const msg = (err as Error).message || "Something went wrong. Try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="grain" aria-hidden="true" />
      <div className="auth-layout">
        <div className="auth-card">
          <Link to="/login" className="back-btn">
            &larr; Back
          </Link>
          <h1 className="auth-heading">Verify your email</h1>
          <p className="auth-sub">
            Enter your credentials and we&apos;ll send a new verification code.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="input-wrap">
              <label htmlFor="verify-email">Email</label>
              <input
                id="verify-email"
                type="email"
                className="input-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="input-wrap">
              <label htmlFor="verify-password">Password</label>
              <input
                id="verify-password"
                type="password"
                className="input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
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
              {loading ? "Sending…" : "Send verification code"}
            </button>
          </form>

          <p className="link-row" style={{ marginTop: 24 }}>
            <Link to="/login">Back to log in</Link>
          </p>
        </div>
      </div>
    </>
  );
}
