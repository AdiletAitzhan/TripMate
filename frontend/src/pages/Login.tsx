import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Logo } from '../components/Logo'
import { authApi } from '../api/authApi'
import { useAuth } from '../context/useAuth'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function Login() {
  const navigate = useNavigate()
  const { setTokens } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const trimmedEmail = email.trim()
    if (!trimmedEmail) {
      setError('Email is required')
      return
    }
    if (!EMAIL_RE.test(trimmedEmail)) {
      setError('Please enter a valid email address')
      return
    }
    if (!password) {
      setError('Password is required')
      return
    }
    setLoading(true)
    try {
      const res = await authApi.login(trimmedEmail, password)
      if (res.success && res.data) {
        setTokens(res.data.user, res.data.accessToken, res.data.refreshToken)
        navigate('/', { replace: true })
      } else {
        setError(res.error?.message ?? 'Invalid email or password')
      }
    } catch {
      setError('Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-layout">
      <div className="auth-card">
        <Logo />
        <h1 className="auth-heading">Welcome back</h1>
        <p className="auth-sub">Pick up where you left off.</p>

        <form onSubmit={handleSubmit}>
          <div className="input-wrap">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-wrap">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Link to="/forgot-password" className="forgot-link">
              Forgot password?
            </Link>
          </div>
          {error && <div className="input-error" style={{ marginBottom: 12 }}>{error}</div>}
          <button type="submit" className="btn btn-primary btn-login" disabled={loading}>
            {loading ? 'Signing in…' : 'Log in'}
          </button>
        </form>

        <p className="link-row">
          New here? <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  )
}
