import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Logo } from '../components/Logo'
import { authApi } from '../api/authApi'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const trimmedEmail = email.trim()
    if (!EMAIL_RE.test(trimmedEmail)) {
      setError('Please enter a valid email address')
      return
    }
    setLoading(true)
    try {
      const res = await authApi.forgotPassword(trimmedEmail)
      if (res.success) {
        setSent(true)
      } else {
        setError(res.error?.message ?? 'Something went wrong')
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
        <h1 className="auth-heading">Forgot password?</h1>
        <p className="auth-sub">We&apos;ll send a reset link to your email.</p>

        {sent ? (
          <p className="auth-sub" style={{ marginTop: 16 }}>
            If an account exists for <strong>{email}</strong>, you&apos;ll get a link shortly.
          </p>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="input-wrap">
              <label htmlFor="forgot-email">Email</label>
              <input
                id="forgot-email"
                type="email"
                className="input-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            {error && <div className="input-error" style={{ marginBottom: 12 }}>{error}</div>}
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Sending…' : 'Send reset link'}
            </button>
          </form>
        )}

        <p className="link-row" style={{ marginTop: 24 }}>
          <Link to="/login">Back to log in</Link>
        </p>
      </div>
    </div>
  )
}
