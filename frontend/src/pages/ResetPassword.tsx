import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Logo } from "../components/Logo";
import { ThemeToggle } from "../components/ThemeToggle";
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
      <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8 sm:px-6 lg:px-8">
        <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-50">
          <ThemeToggle />
        </div>
        <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl">
          <div className="bg-card border border-border rounded-lg sm:rounded-xl shadow-lg p-6 sm:p-8 lg:p-10 text-center">
            <div className="flex justify-center mb-6 sm:mb-8">
              <Logo />
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-foreground mb-2">
              Invalid link
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mb-6">
              This reset link is missing or invalid. Use Forgot password to get
              a new one.
            </p>
            <div className="space-y-2">
              <Link
                to="/forgot-password"
                className="block text-xs sm:text-sm text-foreground hover:underline font-medium"
              >
                Forgot password
              </Link>
              <Link
                to="/login"
                className="block text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Back to log in
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8 sm:px-6 lg:px-8">
        <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-50">
          <ThemeToggle />
        </div>
        <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl">
          <div className="bg-card border border-border rounded-lg sm:rounded-xl shadow-lg p-6 sm:p-8 lg:p-10 text-center">
            <div className="flex justify-center mb-6 sm:mb-8">
              <Logo />
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-foreground mb-2">
              Password reset
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mb-6">
              You can now log in with your new password.
            </p>
            <Link
              to="/login"
              className="inline-flex w-full justify-center bg-primary text-primary-foreground hover:bg-primary/90 py-2.5 sm:py-3 lg:py-3.5 px-4 rounded-md text-sm sm:text-base font-medium transition-colors"
            >
              Log in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-lg shadow-lg p-8">
          <div className="flex justify-center mb-8">
            <Logo />
          </div>
          <h1 className="text-2xl font-semibold text-center text-foreground mb-2">
            Set new password
          </h1>
          <p className="text-center text-muted-foreground mb-8">
            Enter your new password below
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="reset-new"
                className="text-sm font-medium text-foreground"
              >
                New password
              </label>
              <input
                id="reset-new"
                type="password"
                className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="reset-confirm"
                className="text-xs sm:text-sm font-medium text-foreground"
              >
                Confirm password
              </label>
              <input
                id="reset-confirm"
                type="password"
                className={`w-full px-3 py-2 sm:py-2.5 lg:py-3 bg-background border rounded-md text-sm sm:text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors ${
                  !passwordMatch ? "border-destructive" : "border-input"
                }`}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              {!passwordMatch && (
                <p className="text-xs sm:text-sm text-destructive">
                  Passwords do not match
                </p>
              )}
            </div>
            {error && (
              <div className="text-xs sm:text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-3">
                {error}
              </div>
            )}
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Resetting…" : "Reset password"}
            </button>
          </form>

          <p className="text-center text-xs sm:text-sm text-muted-foreground mt-5 sm:mt-6">
            <Link
              to="/login"
              className="text-foreground hover:underline font-medium"
            >
              Back to log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
