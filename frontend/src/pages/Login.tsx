import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Logo } from "../components/Logo";
import { ThemeToggle } from "../components/ThemeToggle";
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
        navigate("/", { replace: true });
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
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-50">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl">
        <div className="bg-card border border-border rounded-lg sm:rounded-xl shadow-lg p-6 sm:p-8 lg:p-10">
          <div className="flex justify-center mb-6 sm:mb-8">
            <Logo />
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-center text-foreground mb-2">
            Welcome back
          </h1>
          <p className="text-sm sm:text-base text-center text-muted-foreground mb-6 sm:mb-8">
            Pick up where you left off
          </p>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div className="space-y-2">
              <label
                htmlFor="login-email"
                className="text-xs sm:text-sm font-medium text-foreground"
              >
                Email
              </label>
              <input
                id="login-email"
                type="email"
                className="w-full px-3 py-2 sm:py-2.5 lg:py-3 bg-background border border-input rounded-md text-sm sm:text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="login-password"
                className="text-xs sm:text-sm font-medium text-foreground"
              >
                Password
              </label>
              <input
                id="login-password"
                type="password"
                className="w-full px-3 py-2 sm:py-2.5 lg:py-3 bg-background border border-input rounded-md text-sm sm:text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Link
                to="/forgot-password"
                className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors inline-block mt-1"
              >
                Forgot password?
              </Link>
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
              {loading ? "Signing in…" : "Log in"}
            </button>
          </form>

          <p className="text-center text-xs sm:text-sm text-muted-foreground mt-5 sm:mt-6">
            New here?{" "}
            <Link
              to="/signup"
              className="text-foreground hover:underline font-medium"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
