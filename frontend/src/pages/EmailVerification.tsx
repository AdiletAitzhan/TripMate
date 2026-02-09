import { useState, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Logo } from '../components/Logo'
import { authApi } from '../api/authApi'
import { useAuth } from '../context/useAuth'

const LEN = 6
const RESEND_SECONDS = 60

export function EmailVerification() {
  const { state } = useLocation() as { state?: { email?: string } }
  const navigate = useNavigate()
  const { setTokens } = useAuth()
  const email = state?.email ?? ''
  const [code, setCode] = useState<string[]>(Array(LEN).fill(''))
  const [resendCountdown, setResendCountdown] = useState(0)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendError, setResendError] = useState('')
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const handleChange = (i: number, v: string) => {
    if (v.length > 1) {
      const digits = v.slice(0, LEN).split('')
      const next = [...code]
      digits.forEach((d, j) => {
        if (i + j < LEN) next[i + j] = d
      })
      setCode(next)
      const focusIdx = Math.min(i + digits.length, LEN - 1)
      inputRefs.current[focusIdx]?.focus()
      return
    }
    const next = [...code]
    next[i] = v
    setCode(next)
    if (v && i < LEN - 1) inputRefs.current[i + 1]?.focus()
  }

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[i] && i > 0) {
      inputRefs.current[i - 1]?.focus()
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    const fullCode = code.join('')
    if (fullCode.length !== LEN) return
    if (!email) {
      setError('Email is missing. Start registration again.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const res = await authApi.verifyEmail(email, fullCode)
      if (res.success && res.data) {
        const user = {
          id: null,
          email,
          name: null,
          isNewUser: true,
          profileComplete: false,
        }
        setTokens(user, res.data.accessToken, res.data.refreshToken)
        navigate('/', { replace: true })
      } else {
        setError(res.error?.message ?? 'Invalid or expired code')
      }
    } catch {
      setError('Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (resendCountdown > 0 || !email) return
    setResendError('')
    try {
      const res = await authApi.resendVerification(email)
      if (res.success) {
        setResendCountdown(RESEND_SECONDS)
        const t = setInterval(() => {
          setResendCountdown((s) => {
            if (s <= 1) {
              clearInterval(t)
              return 0
            }
            return s - 1
          })
        }, 1000)
      } else {
        setResendError(res.error?.message ?? 'Could not resend code')
      }
    } catch {
      setResendError('Something went wrong.')
    }
  }

  if (!email) {
    return (
      <div className="auth-layout">
        <div className="auth-card">
          <Logo />
          <h1 className="auth-heading">Verify your email</h1>
          <p className="auth-sub">No email was provided. Start registration to receive a code.</p>
          <p className="link-row" style={{ marginTop: 24 }}>
            <Link to="/signup/email">Sign up with email</Link>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-layout">
      <div className="auth-card">
        <Logo />
        <h1 className="auth-heading">Verify your email</h1>
        <p className="auth-sub">
          Check your inbox — we sent a code to <strong>{email}</strong>
        </p>

        <form onSubmit={handleVerify}>
          <div className="code-inputs">
            {code.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { inputRefs.current[i] = el }}
                type="text"
                inputMode="numeric"
                maxLength={LEN}
                className="code-input"
                value={digit}
                onChange={(e) => handleChange(i, e.target.value.replace(/\D/g, ''))}
                onKeyDown={(e) => handleKeyDown(i, e)}
              />
            ))}
          </div>
          {error && <div className="input-error" style={{ marginBottom: 12 }}>{error}</div>}
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Verifying…' : 'Verify'}
          </button>
        </form>

        <p className="link-row" style={{ marginTop: 20, fontSize: '0.875rem' }}>
          Didn&apos;t receive?{' '}
          <button
            type="button"
            onClick={handleResend}
            disabled={resendCountdown > 0}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              font: 'inherit',
              color: 'var(--primary)',
              cursor: resendCountdown > 0 ? 'not-allowed' : 'pointer',
              opacity: resendCountdown > 0 ? 0.6 : 1,
            }}
          >
            {resendCountdown > 0 ? `Resend (${resendCountdown}s)` : 'Resend'}
          </button>
        </p>
        {resendError && <div className="input-error" style={{ marginTop: 4 }}>{resendError}</div>}
        <p className="link-row" style={{ marginTop: 8 }}>
          <Link to="/signup/email">Change email</Link>
        </p>
      </div>
    </div>
  )
}
