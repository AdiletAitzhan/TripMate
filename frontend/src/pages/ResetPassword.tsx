import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Logo } from '../components/Logo'
import { authApi } from '../api/authApi'

export function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const passwordMatch = !confirmPassword || newPassword === confirmPassword

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!token) {
      setError('Invalid or missing reset link. Request a new one from Forgot password.')
      return
    }
    if (!passwordMatch) {
      setError('Passwords do not match')
      return
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    try {
      const res = await authApi.resetPassword(token, newPassword)
      if (res.success) {
        setSuccess(true)
      } else {
        setError(res.error?.message ?? 'Failed to reset password')
      }
    } catch {
      setError('Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="auth-layout">
        <div className="auth-card">
          <Logo />
          <h1 className="auth-heading">Invalid link</h1>
          <p className="auth-sub">This reset link is missing or invalid. Use Forgot password to get a new one.</p>
          <p className="link-row" style={{ marginTop: 24 }}>
            <Link to="/forgot-password">Forgot password</Link>
          </p>
          <p className="link-row" style={{ marginTop: 8 }}>
            <Link to="/login">Back to log in</Link>
          </p>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="auth-layout">
        <div className="auth-card">
          <Logo />
          <h1 className="auth-heading">Password reset</h1>
          <p className="auth-sub">You can now log in with your new password.</p>
          <Link to="/login" className="btn btn-primary" style={{ display: 'inline-block', marginTop: 24, textDecoration: 'none' }}>
            Log in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-layout">
      <div className="auth-card">
        <Logo />
        <h1 className="auth-heading">Set new password</h1>
        <p className="auth-sub">Enter your new password below.</p>

        <form onSubmit={handleSubmit}>
          <div className="input-wrap">
            <label htmlFor="reset-new">New password</label>
            <input
              id="reset-new"
              type="password"
              className="input-field"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <div className="input-wrap">
            <label htmlFor="reset-confirm">Confirm password</label>
            <input
              id="reset-confirm"
              type="password"
              className={`input-field ${!passwordMatch ? 'error' : ''}`}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            {!passwordMatch && <div className="input-error">Passwords do not match</div>}
          </div>
          {error && <div className="input-error" style={{ marginBottom: 12 }}>{error}</div>}
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Resetting…' : 'Reset password'}
          </button>
        </form>

        <p className="link-row" style={{ marginTop: 24 }}>
          <Link to="/login">Back to log in</Link>
        </p>
      </div>
    </div>
  )
}
