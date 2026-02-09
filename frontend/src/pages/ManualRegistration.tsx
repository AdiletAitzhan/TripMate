import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Logo } from '../components/Logo'
import { TermsPolicyModal } from '../components/TermsPolicyModal'
import { authApi } from '../api/authApi'

const GENDERS = [
  { label: 'Male', value: 'MALE' },
  { label: 'Female', value: 'FEMALE' },
  { label: 'Other', value: 'OTHER' },
]

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function ManualRegistration() {
  const navigate = useNavigate()
  const [firstname, setFirstname] = useState('')
  const [lastname, setLastname] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [gender, setGender] = useState('')
  const [terms, setTerms] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState<'terms' | 'privacy' | null>(null)

  const passwordMatch = !confirmPassword || password === confirmPassword
  const emailValid = !email.trim() || EMAIL_RE.test(email.trim())

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!passwordMatch) {
      setError('Passwords do not match')
      return
    }
    if (!terms) {
      setError('Please agree to Terms & Privacy Policy')
      return
    }
    const trimmedEmail = email.trim()
    if (!EMAIL_RE.test(trimmedEmail)) {
      setError('Please enter a valid email address')
      return
    }
    const trimmedFirst = firstname.trim()
    const trimmedLast = lastname.trim()
    if (!trimmedFirst) {
      setError('First name is required')
      return
    }
    if (!trimmedLast) {
      setError('Last name is required')
      return
    }
    if (!dateOfBirth) {
      setError('Date of birth is required')
      return
    }
    if (!gender) {
      setError('Gender is required')
      return
    }
    setLoading(true)
    try {
      const res = await authApi.register({
        email: trimmedEmail,
        password,
        firstName: trimmedFirst,
        lastName: trimmedLast,
        dateOfBirth,
        gender,
      })
      if (res.success) {
        navigate('/verify-email', { state: { email: trimmedEmail } })
      } else {
        if (res.error?.code === 'EMAIL_EXISTS') {
          setError('This email is already registered. Try logging in or use another email.')
        } else {
          setError(res.error?.message ?? 'Registration failed')
        }
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
        <Link to="/signup" className="back-btn">
          ← Back
        </Link>
        <div className="progress-label">Step 1 of 2</div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: '50%' }} />
        </div>
        <Logo />
        <h1 className="auth-heading">Create your account</h1>
        <p className="auth-sub">We only need the basics.</p>

        <form onSubmit={handleSubmit}>
          <div className="input-wrap">
            <label htmlFor="reg-firstname">First name</label>
            <input
              id="reg-firstname"
              type="text"
              className="input-field"
              value={firstname}
              onChange={(e) => setFirstname(e.target.value)}
              required
            />
          </div>
          <div className="input-wrap">
            <label htmlFor="reg-lastname">Last name</label>
            <input
              id="reg-lastname"
              type="text"
              className="input-field"
              value={lastname}
              onChange={(e) => setLastname(e.target.value)}
              required
            />
          </div>
          <div className="input-wrap">
            <label htmlFor="reg-email">Email</label>
            <input
              id="reg-email"
              type="email"
              className={`input-field ${email.trim() && !emailValid ? 'error' : ''}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {email.trim() && !emailValid && (
              <div className="input-error">Please enter a valid email address</div>
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
              minLength={6}
            />
          </div>
          <div className="input-wrap">
            <label htmlFor="reg-confirm">Confirm Password</label>
            <input
              id="reg-confirm"
              type="password"
              className={`input-field ${!passwordMatch ? 'error' : ''}`}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            {!passwordMatch && <div className="input-error">Passwords do not match</div>}
          </div>
          <div className="input-wrap">
            <label htmlFor="reg-dob">Date of Birth</label>
            <input
              id="reg-dob"
              type="date"
              className="input-field"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              required
            />
          </div>
          <div className="input-wrap">
            <label htmlFor="reg-gender">Gender</label>
            <select
              id="reg-gender"
              className="input-field"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              required
            >
              <option value="">Select</option>
              {GENDERS.map((g) => (
                <option key={g.value} value={g.value}>
                  {g.label}
                </option>
              ))}
            </select>
          </div>
          <div className="checkbox-wrap">
            <input
              id="reg-terms"
              type="checkbox"
              checked={terms}
              onChange={(e) => setTerms(e.target.checked)}
            />
            <label htmlFor="reg-terms">
              I agree to{' '}
              <button type="button" className="link-modal" onClick={() => setModalOpen('terms')}>
                Terms
              </button>
              {' '}&{' '}
              <button type="button" className="link-modal" onClick={() => setModalOpen('privacy')}>
                Privacy Policy
              </button>
            </label>
          </div>
          {modalOpen && (
            <TermsPolicyModal type={modalOpen} onClose={() => setModalOpen(null)} />
          )}
          {error && <div className="input-error" style={{ marginBottom: 12 }}>{error}</div>}
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  )
}
