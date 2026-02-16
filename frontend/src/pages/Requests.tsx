import { useEffect, useState, useRef, useMemo } from "react"
import { useNavigate, useLocation, Link, useSearchParams } from "react-router-dom"
import { Logo } from "../components/Logo"
import { SearchBar } from "../components/SearchBar"
import { NotificationButton } from "../components/NotificationButton"
import { UserAvatar } from "../components/UserAvatar"
import { ThemeToggle } from "../components/ThemeToggle"
import { CreateTripRequestModal } from "../components/CreateTripRequestModal"
import {
  IconCatalog,
  IconProfile,
  IconRequests,
  IconOffers,
  IconLogout,
  IconMenu,
  IconClose,
} from "../components/icons"
import { useAuth } from "../context/useAuth"
import { useUsersApi } from "../hooks/useUsersApi"
import { useTripRequestsApi } from "../hooks/useTripRequestsApi"
import type {
  CreateTripRequestRequest,
  TripRequestShortResponse,
  UpdateTripRequestRequest,
} from "../types/tripRequest"

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

function formatDestination(dest: TripRequestShortResponse["destination"]): string {
  const parts = [dest?.city, dest?.country].filter(Boolean)
  return parts.length ? parts.join(", ") : "—"
}

function formatBudget(budget: TripRequestShortResponse["budget"]): string {
  if (!budget?.amount) return "—"
  const curr = budget.currency ?? "USD"
  return `${budget.amount} ${curr}`
}

export function Requests() {
  const navigate = useNavigate()
  const location = useLocation()
  const { clearAuth, isReady, accessToken, refreshToken } = useAuth()
  const { getProfile } = useUsersApi()
  const {
    getMyRequests,
    createRequest,
    updateRequest,
    deleteRequest,
  } = useTripRequestsApi()
  const [searchParams, setSearchParams] = useSearchParams()
  const statusFilter = searchParams.get("status") ?? ""
  const page = Math.max(1, Number(searchParams.get("page")) || 1)
  const limit = Math.max(1, Math.min(50, Number(searchParams.get("limit")) || 10))

  const [profilePhoto, setProfilePhoto] = useState<string | null>(null)
  const [requests, setRequests] = useState<TripRequestShortResponse[]>([])
  const [paginationMeta, setPaginationMeta] = useState({
    total: 0,
    totalPages: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [destinationSearch, setDestinationSearch] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const [editingRequest, setEditingRequest] =
    useState<TripRequestShortResponse | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
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

  const loadRequests = () => {
    setLoading(true)
    setError(null)
    getMyRequests({
      status: statusFilter || undefined,
      page,
      limit,
    })
      .then((res) => {
        const data = res.data
        setRequests(data.requests ?? [])
        setPaginationMeta({
          total: data.pagination?.total ?? 0,
          totalPages: data.pagination?.totalPages ?? 0,
        })
      })
      .catch((e) => setError(e?.message ?? "Failed to load requests"))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (!isReady || (!accessToken && !refreshToken)) {
      setLoading(false)
      return
    }
    loadRequests()
  }, [isReady, accessToken, refreshToken, statusFilter, page, limit])

  const updateFilters = (updates: {
    status?: string
    page?: number
    limit?: number
  }) => {
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev)
      if (updates.status !== undefined) {
        if (updates.status) p.set("status", updates.status)
        else p.delete("status")
      }
      if (updates.page !== undefined) p.set("page", String(updates.page))
      if (updates.limit !== undefined) p.set("limit", String(updates.limit))
      return p
    })
  }

  const clearFilters = () => {
    setSearchParams({})
    setDestinationSearch("")
  }

  const hasActiveFilters =
    statusFilter || page > 1 || limit !== 10 || destinationSearch

  const filteredRequests = useMemo(() => {
    let list = requests

    if (destinationSearch.trim()) {
      const q = destinationSearch.trim().toLowerCase()
      list = list.filter((r) => {
        const dest = formatDestination(r.destination).toLowerCase()
        return dest.includes(q)
      })
    }

    return list
  }, [requests, destinationSearch])

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

  const handleCreate = async (body: CreateTripRequestRequest) => {
    await createRequest(body)
    loadRequests()
  }

  const handleUpdate = async (
    requestId: string,
    body: UpdateTripRequestRequest
  ) => {
    await updateRequest(requestId, body)
    setEditingRequest(null)
    loadRequests()
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this trip request?")) return
    setDeletingId(id)
    try {
      await deleteRequest(id)
      loadRequests()
    } finally {
      setDeletingId(null)
    }
  }

  const openCreateModal = () => {
    setEditingRequest(null)
    setModalOpen(true)
  }

  const openEditModal = (r: TripRequestShortResponse) => {
    setEditingRequest(r)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingRequest(null)
  }

  const avatarUrl = photoUrlForBrowser(profilePhoto ?? undefined)
  const hasNext = page < paginationMeta.totalPages
  const hasPrev = page > 1

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
            className={`sidebar-link ${location.pathname === "/requests" ? "active" : ""}`}
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
        <SearchBar />
        <div className="app-header-right">
          <ThemeToggle />
          <NotificationButton />
          <UserAvatar photoUrl={avatarUrl} />
        </div>
      </header>

      <main className="app-content" style={{ padding: 32, maxWidth: 900, margin: "0 auto" }}>
        <div style={{ marginBottom: 24, textAlign: "left" }}>
          <h1
            style={{
              fontSize: "2rem",
              fontWeight: 700,
              color: "var(--text)",
              margin: "0 0 4px",
              letterSpacing: "-0.02em",
            }}
          >
            Trip Requests
          </h1>
          <p
            style={{
              fontSize: "0.9375rem",
              color: "var(--text-muted)",
              margin: 0,
            }}
          >
            Create and manage your trip requests
          </p>
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 16,
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <button
            type="button"
            className="btn btn-primary"
            onClick={openCreateModal}
            style={{ width: "auto", padding: "12px 24px" }}
          >
            + Create Trip Request
          </button>
        </div>

        <section
          aria-label="Filters"
          style={{
            marginBottom: 24,
            padding: "16px 20px",
            background: "var(--card-bg)",
            borderRadius: 12,
            border: "1px solid var(--border)",
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
              alignItems: "center",
            }}
          >
            <label style={{ fontSize: "0.875rem", color: "var(--text-muted)", fontWeight: 500 }}>
              Status
            </label>
            <select
              className="input-field"
              value={statusFilter}
              onChange={(e) => updateFilters({ status: e.target.value, page: 1 })}
              style={{ width: "auto", minWidth: 140 }}
              aria-label="Filter by status"
            >
              <option value="">All statuses</option>
              <option value="PENDING">Pending</option>
              <option value="ACTIVE">Active</option>
              <option value="MATCHED">Matched</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>

            <label style={{ fontSize: "0.875rem", color: "var(--text-muted)", fontWeight: 500, marginLeft: 8 }}>
              Per page
            </label>
            <select
              className="input-field"
              value={limit}
              onChange={(e) => updateFilters({ limit: Number(e.target.value), page: 1 })}
              style={{ width: "auto", minWidth: 80 }}
              aria-label="Items per page"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>

            <label style={{ fontSize: "0.875rem", color: "var(--text-muted)", fontWeight: 500, marginLeft: 8 }}>
              Search destination
            </label>
            <input
              type="search"
              className="input-field"
              placeholder="City or country…"
              value={destinationSearch}
              onChange={(e) => setDestinationSearch(e.target.value)}
              style={{ width: "auto", minWidth: 160 }}
              aria-label="Search by destination"
            />

            {hasActiveFilters && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={clearFilters}
                style={{ marginLeft: "auto", padding: "8px 16px" }}
              >
                Clear filters
              </button>
            )}
          </div>
        </section>

        {error && (
          <p
            style={{
              color: "var(--status-error)",
              marginBottom: 16,
              fontSize: "0.9375rem",
              padding: "12px 16px",
              background: "var(--status-error-bg)",
              borderRadius: 8,
              border: "1px solid var(--status-error-border)",
            }}
            role="alert"
          >
            {error}
          </p>
        )}

        {loading ? (
          <p style={{ color: "var(--text-muted)" }}>Loading…</p>
        ) : requests.length === 0 ? (
          <div
            className="card-premium"
            style={{
              padding: 48,
              textAlign: "center",
            }}
          >
            <p style={{ color: "var(--text-muted)", marginBottom: 16 }}>
              No trip requests yet. Create your first one!
            </p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={openCreateModal}
              style={{ width: "auto", padding: "12px 24px" }}
            >
              Create Trip Request
            </button>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div
            className="card-premium"
            style={{
              padding: 48,
              textAlign: "center",
            }}
          >
            <p style={{ color: "var(--text-muted)", marginBottom: 16 }}>
              No requests match your destination search. Try a different term or clear filters.
            </p>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={clearFilters}
              style={{ width: "auto", padding: "12px 24px" }}
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: 24,
            }}
          >
            {filteredRequests.map((r) => (
              <div
                key={r.id}
                className="card-premium"
                style={{
                  padding: 24,
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                <div style={{ flex: 1 }}>
                  <h3
                    style={{
                      fontSize: "1.125rem",
                      fontWeight: 600,
                      color: "var(--text)",
                      margin: "0 0 8px",
                    }}
                  >
                    {formatDestination(r.destination)}
                  </h3>
                  <p
                    style={{
                      fontSize: "0.875rem",
                      color: "var(--text-muted)",
                      margin: "0 0 4px",
                    }}
                  >
                    {formatDate(r.startDate)} — {formatDate(r.endDate)}
                  </p>
                  <p
                    style={{
                      fontSize: "0.875rem",
                      color: "var(--text-muted)",
                      margin: 0,
                    }}
                  >
                    Budget: {formatBudget(r.budget)}
                  </p>
                  {r.status && (
                    <span
                      style={{
                        display: "inline-block",
                        marginTop: 8,
                        padding: "4px 10px",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        borderRadius: 999,
                        background: "var(--accent-light)",
                        color: "var(--accent)",
                      }}
                    >
                      {r.status}
                    </span>
                  )}
                  {r.matchCount != null && r.matchCount > 0 && (
                    <p
                      style={{
                        fontSize: "0.8125rem",
                        color: "var(--status-success)",
                        margin: "4px 0 0",
                      }}
                    >
                      {r.matchCount} match{r.matchCount !== 1 ? "es" : ""}
                    </p>
                  )}
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    marginTop: 8,
                  }}
                >
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => openEditModal(r)}
                    style={{ flex: 1, padding: "8px 16px" }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => handleDelete(r.id)}
                    disabled={deletingId === r.id}
                    style={{
                      flex: 1,
                      padding: "8px 16px",
                      color: "var(--status-error)",
                      borderColor: "var(--status-error)",
                    }}
                  >
                    {deletingId === r.id ? "Deleting…" : "Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {paginationMeta.totalPages > 1 && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 16,
              marginTop: 32,
            }}
          >
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => updateFilters({ page: page - 1 })}
              disabled={!hasPrev}
              style={{ width: "auto", padding: "8px 16px" }}
            >
              Previous
            </button>
            <span style={{ color: "var(--text-muted)", fontSize: "0.9375rem" }}>
              Page {page} of {paginationMeta.totalPages} ({paginationMeta.total} total)
            </span>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => updateFilters({ page: page + 1 })}
              disabled={!hasNext}
              style={{ width: "auto", padding: "8px 16px" }}
            >
              Next
            </button>
          </div>
        )}
      </main>

      <footer className="app-footer">
        © 2026 TripMate. Travel together, explore forever.
      </footer>

      {modalOpen && (
        <CreateTripRequestModal
          onClose={closeModal}
          onCreate={handleCreate}
          onUpdate={editingRequest ? handleUpdate : undefined}
          editing={editingRequest}
        />
      )}
    </div>
  )
}
