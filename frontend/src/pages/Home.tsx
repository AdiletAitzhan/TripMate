import { useEffect, useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { Logo } from '../components/Logo'
import { useAuth } from '../context/useAuth'
import { useUsersApi } from '../hooks/useUsersApi'

function photoUrlForBrowser(url: string | undefined): string | undefined {
  if (!url) return undefined
  return url.replace(/http:\/\/minio:9000/, 'http://localhost:9000')
}

const iconSize = 22

const IconCatalog = () => (
  <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </svg>
)
const IconProfile = () => (
  <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)
const IconRequests = () => (
  <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <path d="M14 2v6h6" />
    <path d="M16 13H8" />
    <path d="M16 17H8" />
    <path d="M10 9H8" />
  </svg>
)
const IconOffers = () => (
  <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M20 12v10H4V12" />
    <path d="M2 7h20v5H2z" />
    <path d="M12 22V7" />
  </svg>
)
const IconLogout = () => (
  <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
)
const IconMenu = () => (
  <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
)

export function Home() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, clearAuth, isReady, accessToken, refreshToken } = useAuth()
  const { getProfile } = useUsersApi()
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null)

  useEffect(() => {
    if (!isReady || (!accessToken && !refreshToken)) return
    let cancelled = false
    getProfile()
      .then((body) => {
        if (cancelled) return
        const data = (body as { success?: boolean; data?: { profilePhoto?: string } })?.data
        const photo = data?.profilePhoto
        if (photo) setProfilePhoto(photoUrlForBrowser(photo) ?? photo)
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [isReady, accessToken, refreshToken, getProfile])

  const handleLogout = () => {
    clearAuth()
    navigate('/login', { replace: true })
  }

  const avatarUrl = profilePhoto ?? undefined

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 32px',
        background: 'var(--card-bg)',
        boxShadow: 'var(--shadow-card)',
      }}>
        <Logo />
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <svg
            width={18}
            height={18}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }}
            aria-hidden
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="search"
            placeholder="Search"
            style={{
              padding: '10px 14px 10px 40px',
              border: '1px solid var(--border)',
              borderRadius: 10,
              width: 260,
              fontSize: '0.875rem',
              background: 'var(--bg)',
              color: 'var(--text)',
            }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, color: 'var(--text-muted)' }} title="Notifications" aria-label="Notifications">
            <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
          </button>
          <Link
            to="/profile"
            style={{
              width: 42,
              height: 42,
              borderRadius: '50%',
              border: '2px solid var(--border)',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: avatarUrl ? `center/cover url(${avatarUrl})` : 'var(--primary-light)',
              textDecoration: 'none',
              color: 'var(--text)',
            }}
          >
            {!avatarUrl && <span style={{ fontSize: '1.25rem' }}>👤</span>}
          </Link>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1 }}>
        <aside style={{
          width: 240,
          padding: 20,
          background: 'var(--card-bg)',
          boxShadow: 'var(--shadow-sidebar)',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 4px', marginBottom: 12 }}>
            <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--text)' }} aria-label="Menu">
              <IconMenu />
            </button>
            <span style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Menu</span>
          </div>
          <Link to="/" className={`sidebar-link ${location.pathname === '/' ? 'active' : ''}`}>
            <IconCatalog />
            Catalog
          </Link>
          <Link to="/profile" className={`sidebar-link ${location.pathname === '/profile' ? 'active' : ''}`}>
            <IconProfile />
            Profile
          </Link>
          <Link to="/requests" className={`sidebar-link ${location.pathname === '/requests' ? 'active' : ''}`}>
            <IconRequests />
            Requests
          </Link>
          <Link to="/offers" className={`sidebar-link ${location.pathname === '/offers' ? 'active' : ''}`}>
            <IconOffers />
            Offers
          </Link>
          <div style={{ flex: 1 }} />
          <button
            onClick={handleLogout}
            type="button"
            className="sidebar-link"
            style={{ width: '100%', border: 'none', cursor: 'pointer', color: 'var(--error)', background: 'transparent', textAlign: 'left', font: 'inherit' }}
          >
            <IconLogout />
            Log out
          </button>
        </aside>

        <main style={{ flex: 1, padding: 32, maxWidth: 1100 }}>
          <div style={{ marginBottom: 40, textAlign: 'left' }}>
            <h1 style={{ fontSize: '2.25rem', fontWeight: 700, color: 'var(--text)', marginBottom: 12, letterSpacing: '-0.02em' }}>
              Welcome to TripMate
            </h1>
            <p style={{ fontSize: '1.125rem', color: 'var(--text-muted)', maxWidth: 560, margin: 0, lineHeight: 1.6 }}>
              Plan your perfect trip with friends. Share itineraries, split costs, and make memories together.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 24,
            marginBottom: 40,
          }}>
            <div className="card-premium" style={{ padding: 28 }}>
              <div style={{ fontSize: '2.25rem', marginBottom: 16 }}>🗺️</div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: 10, color: 'var(--text)' }}>Plan Together</h3>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, margin: 0, fontSize: '0.9375rem' }}>Create shared itineraries and collaborate in real-time with your travel group.</p>
            </div>
            <div className="card-premium" style={{ padding: 28 }}>
              <div style={{ fontSize: '2.25rem', marginBottom: 16 }}>💰</div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: 10, color: 'var(--text)' }}>Split Expenses</h3>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, margin: 0, fontSize: '0.9375rem' }}>Track group expenses and settle up easily. No more awkward money talks.</p>
            </div>
            <div className="card-premium" style={{ padding: 28 }}>
              <div style={{ fontSize: '2.25rem', marginBottom: 16 }}>📍</div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: 10, color: 'var(--text)' }}>Discover Places</h3>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, margin: 0, fontSize: '0.9375rem' }}>Get personalized recommendations based on your group&apos;s interests.</p>
            </div>
          </div>

          <div className="card-premium" style={{ padding: 40, textAlign: 'left' }}>
            <h2 style={{ fontSize: '1.375rem', marginBottom: 16, color: 'var(--text)', fontWeight: 600 }}>Ready to start your adventure?</h2>
            <button
              className="btn btn-primary"
              style={{ width: 'auto', padding: '14px 28px' }}
              onClick={() => alert('Coming soon! 🚀')}
            >
              Create New Trip
            </button>
          </div>
        </main>
      </div>

      <footer style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)', fontSize: '0.875rem', background: 'var(--card-bg)', borderTop: '1px solid var(--border)' }}>
        © 2026 TripMate. Travel together, explore forever.
      </footer>
    </div>
  )
}
