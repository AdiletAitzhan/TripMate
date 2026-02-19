import { useEffect, useState, useRef } from "react"
import { useParams, useNavigate, useLocation, Link } from "react-router-dom"
import { Logo } from "../components/Logo"
import { NotificationButton } from "../components/NotificationButton"
import { UserAvatar } from "../components/UserAvatar"
import { ThemeToggle } from "../components/ThemeToggle"
import {
  IconCatalog,
  IconProfile,
  IconRequests,
  IconOffers,
  IconLogout,
  IconMenu,
  IconClose,
} from "../components/icons"
import { ArrowLeft } from "lucide-react"
import { useAuth } from "../context/useAuth"
import { useUsersApi } from "../hooks/useUsersApi"
import { useTripRequestsApi } from "../hooks/useTripRequestsApi"
import type { TripRequestResponse } from "../types/tripRequest"

function photoUrlForBrowser(url: string | undefined): string | undefined {
  if (!url) return undefined
  return url.replace(/http:\/\/minio:9000/, "http://localhost:9000")
}

function formatDate(s: string | undefined): string {
  if (!s) return "—"
  const d = new Date(s)
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function formatDateTime(s: string | undefined): string {
  if (!s) return "—"
  const d = new Date(s)
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function formatDestination(dest: TripRequestResponse["destination"]): string {
  const parts = [dest?.city, dest?.country].filter(Boolean)
  return parts.length ? parts.join(", ") : "—"
}

function formatBudget(budget: TripRequestResponse["budget"]): string {
  if (!budget?.amount) return "—"
  const curr = budget.currency ?? "USD"
  return `${budget.amount} ${curr}`
}

export function TripRequestDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { clearAuth, isReady, accessToken, refreshToken } = useAuth()
  const { getProfile } = useUsersApi()
  const { getById } = useTripRequestsApi()

  const [profilePhoto, setProfilePhoto] = useState<string | null>(null)
  const [request, setRequest] = useState<TripRequestResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const sidebarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isReady || (!accessToken && !refreshToken)) return
    let cancelled = false
    getProfile()
      .then((body) => {
        if (cancelled) return
        const data = (
          body as { success?: boolean; data?: { profilePhoto?: string } }
        )?.data
        const photo = data?.profilePhoto
        if (photo) setProfilePhoto(photoUrlForBrowser(photo) ?? photo)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [isReady, accessToken, refreshToken, getProfile])

  useEffect(() => {
    if (!id || !isReady || (!accessToken && !refreshToken)) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    getById(id)
      .then((res) => setRequest(res.data))
      .catch((e) => setError(e?.message ?? "Failed to load trip request"))
      .finally(() => setLoading(false))
  }, [id, isReady, accessToken, refreshToken, getById])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isSidebarOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        setIsSidebarOpen(false)
      }
    }
    if (isSidebarOpen) document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isSidebarOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isSidebarOpen) setIsSidebarOpen(false)
    }
    if (isSidebarOpen) document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [isSidebarOpen])

  const handleLogout = () => {
    clearAuth()
    navigate("/login", { replace: true })
  }

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)
  const closeSidebar = () => setIsSidebarOpen(false)
  const goBack = () => navigate("/requests")

  const avatarUrl = photoUrlForBrowser(profilePhoto ?? undefined)

  return (
    <div className="app-layout">
      <div
        className={`sidebar-overlay ${isSidebarOpen ? "active" : ""}`}
        onClick={closeSidebar}
        aria-hidden="true"
      />

      <aside
        ref={sidebarRef}
        className={`sidebar ${isSidebarOpen ? "open" : ""}`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="sidebar-header">
          <span className="sidebar-title">Menu</span>
          <button
            type="button"
            className="menu-button"
            onClick={toggleSidebar}
            aria-label="Close menu"
          >
            <IconClose />
          </button>
        </div>
        <nav>
          <Link
            to="/"
            className={`sidebar-link ${location.pathname === "/" ? "active" : ""}`}
            onClick={closeSidebar}
          >
            <IconCatalog />
            Catalog
          </Link>
          <Link
            to="/profile"
            className={`sidebar-link ${location.pathname === "/profile" ? "active" : ""}`}
            onClick={closeSidebar}
          >
            <IconProfile />
            Profile
          </Link>
          <Link
            to="/requests"
            className={`sidebar-link ${location.pathname.startsWith("/requests") ? "active" : ""}`}
            onClick={closeSidebar}
          >
            <IconRequests />
            Requests
          </Link>
          <Link
            to="/offers"
            className={`sidebar-link ${location.pathname === "/offers" ? "active" : ""}`}
            onClick={closeSidebar}
          >
            <IconOffers />
            Offers
          </Link>
        </nav>
        <div className="spacer" />
        <button
          onClick={handleLogout}
          type="button"
          className="sidebar-link logout"
        >
          <IconLogout />
          Log out
        </button>
      </aside>

      <header className="app-header">
        <div className="app-header-left">
          <button
            type="button"
            className="menu-button"
            onClick={toggleSidebar}
            aria-label="Open menu"
            aria-expanded={isSidebarOpen}
          >
            <IconMenu />
          </button>
          <Logo />
        </div>
        <div className="app-header-right">
          <ThemeToggle />
          <NotificationButton />
          <UserAvatar photoUrl={avatarUrl} />
        </div>
      </header>

      <main className="app-content" style={{ padding: 32, maxWidth: 700, margin: "0 auto" }}>
        <button
          type="button"
          onClick={goBack}
          className="btn btn-secondary"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 24,
            padding: "8px 16px",
          }}
          aria-label="Back to requests"
        >
          <ArrowLeft size={18} />
          Back to Trip Requests
        </button>

        {loading ? (
          <p style={{ color: "var(--text-muted)" }}>Loading…</p>
        ) : error ? (
          <div
            className="card-premium"
            style={{
              padding: 24,
              background: "var(--status-error-bg)",
              border: "1px solid var(--status-error-border)",
            }}
          >
            <p style={{ color: "var(--status-error)", margin: 0 }}>{error}</p>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={goBack}
              style={{ marginTop: 16 }}
            >
              Back
            </button>
          </div>
        ) : !request ? (
          <p style={{ color: "var(--text-muted)" }}>Trip request not found.</p>
        ) : (
          <div
            className="card-premium"
            style={{
              padding: 32,
              display: "flex",
              flexDirection: "column",
              gap: 24,
            }}
          >
            <div>
              <h1
                style={{
                  fontSize: "1.75rem",
                  fontWeight: 700,
                  color: "var(--text)",
                  margin: "0 0 8px",
                  letterSpacing: "-0.02em",
                }}
              >
                {formatDestination(request.destination)}
              </h1>
              {request.status && (
                <span
                  style={{
                    display: "inline-block",
                    padding: "4px 12px",
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    borderRadius: 999,
                    background: "var(--accent-light)",
                    color: "var(--accent)",
                  }}
                >
                  {request.status}
                </span>
              )}
            </div>

            <section style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <h3
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "var(--text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    margin: "0 0 4px",
                  }}
                >
                  Dates
                </h3>
                <p style={{ fontSize: "1rem", color: "var(--text)", margin: 0 }}>
                  {formatDate(request.startDate)} — {formatDate(request.endDate)}
                  {request.duration != null && (
                    <span style={{ color: "var(--text-muted)", marginLeft: 8 }}>
                      ({request.duration} day{request.duration !== 1 ? "s" : ""})
                    </span>
                  )}
                </p>
                {request.flexibleDates && (
                  <p
                    style={{
                      fontSize: "0.875rem",
                      color: "var(--text-muted)",
                      margin: "4px 0 0",
                    }}
                  >
                    Flexible dates
                  </p>
                )}
              </div>

              <div>
                <h3
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "var(--text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    margin: "0 0 4px",
                  }}
                >
                  Budget
                </h3>
                <p style={{ fontSize: "1rem", color: "var(--text)", margin: 0 }}>
                  {formatBudget(request.budget)}
                </p>
              </div>

              {request.matchCount != null && request.matchCount > 0 && (
                <div>
                  <h3
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      color: "var(--text-muted)",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      margin: "0 0 4px",
                    }}
                  >
                    Matches
                  </h3>
                  <p
                    style={{
                      fontSize: "1rem",
                      color: "var(--status-success)",
                      margin: 0,
                    }}
                  >
                    {request.matchCount} match{request.matchCount !== 1 ? "es" : ""} found
                  </p>
                </div>
              )}

              {request.notifyOnMatch != null && (
                <div>
                  <h3
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      color: "var(--text-muted)",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      margin: "0 0 4px",
                    }}
                  >
                    Notifications
                  </h3>
                  <p style={{ fontSize: "1rem", color: "var(--text)", margin: 0 }}>
                    {request.notifyOnMatch ? "Notify on match" : "No notifications"}
                  </p>
                </div>
              )}

              {request.createdAt && (
                <div>
                  <h3
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      color: "var(--text-muted)",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      margin: "0 0 4px",
                    }}
                  >
                    Created
                  </h3>
                  <p style={{ fontSize: "1rem", color: "var(--text)", margin: 0 }}>
                    {formatDateTime(request.createdAt)}
                  </p>
                </div>
              )}

              {request.preferences && (
                <div>
                  <h3
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      color: "var(--text-muted)",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      margin: "0 0 4px",
                    }}
                  >
                    Preferences
                  </h3>
                  <pre
                    style={{
                      fontSize: "0.875rem",
                      color: "var(--text)",
                      margin: 0,
                      padding: 12,
                      background: "var(--bg)",
                      borderRadius: 8,
                      overflow: "auto",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {JSON.stringify(request.preferences, null, 2)}
                  </pre>
                </div>
              )}
            </section>
          </div>
        )}
      </main>

      <footer className="app-footer">
        © 2026 TripMate. Travel together, explore forever.
      </footer>
    </div>
  )
}
