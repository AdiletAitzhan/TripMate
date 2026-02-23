import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { authApi } from "../api/authApi";

export function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const passwordMatch = !confirmPassword || newPassword === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!token) {
      setError(
        "Invalid or missing reset link. Request a new one from Forgot password.",
      );
      return;
    }
    if (!passwordMatch) {
      setError("Passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.resetPassword(token, newPassword);
      if (res.success) {
        setSuccess(true);
      } else {
        setError(res.error?.message ?? "Failed to reset password");
      }
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <>
        <div className="grain" aria-hidden="true" />
        <div className="auth-page">
          <div className="auth-container">
            <div className="auth-card" style={{ textAlign: "center" }}>
              <h1 className="auth-title">Invalid link</h1>
              <p className="auth-subtitle" style={{ marginBottom: "24px" }}>
                This reset link is missing or invalid. Use Forgot password to
                get a new one.
              </p>
              <div className="auth-form" style={{ gap: "8px" }}>
                <Link
                  to="/forgot-password"
                  className="auth-link"
                  style={{ display: "block", marginTop: 0 }}
                >
                  Forgot password
                </Link>
                <Link
                  to="/login"
                  className="auth-link"
                  style={{ display: "block", marginTop: 0 }}
                >
                  Back to log in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (success) {
    return (
      <>
        <div className="grain" aria-hidden="true" />
        <div className="auth-page">
          <div className="auth-container">
            <div className="auth-card" style={{ textAlign: "center" }}>
              <h1 className="auth-title">Password reset</h1>
              <p className="auth-subtitle" style={{ marginBottom: "24px" }}>
                You can now log in with your new password.
              </p>
              <Link to="/login" className="auth-success-button">
                Log in
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="grain" aria-hidden="true" />
      <div className="auth-page" style={{ padding: "24px" }}>
        <div className="auth-container" style={{ maxWidth: "448px" }}>
          <div className="auth-card" style={{ padding: "32px" }}>
            <h1 className="auth-title" style={{ fontSize: "24px" }}>
              Set new password
            </h1>
            <p className="auth-subtitle" style={{ marginBottom: "32px" }}>
              Enter your new password below
            </p>

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="auth-field">
                <label htmlFor="reset-new" className="auth-label">
                  New password
                </label>
                <input
                  id="reset-new"
                  type="password"
                  className="auth-input"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                  minLength={6}
                />
              </div>
              <div className="auth-field">
                <label htmlFor="reset-confirm" className="auth-label">
                  Confirm password
                </label>
                <input
                  id="reset-confirm"
                  type="password"
                  className={`auth-input ${!passwordMatch ? "auth-input-error" : ""}`}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                />
                {!passwordMatch && (
                  <p className="auth-error-text">Passwords do not match</p>
                )}
              </div>
              {error && <div className="auth-error">{error}</div>}
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? "Resetting…" : "Reset password"}
              </button>
            </form>

            <p className="auth-footer">
              <Link to="/login" className="auth-footer-link">
                Back to log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
