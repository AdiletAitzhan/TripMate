import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

/** Защищённый маршрут: если нет токена — редирект на логин */
export function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { accessToken, isReady } = useAuth()

  if (!isReady) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
        Loading...
      </div>
    )
  }

  if (!accessToken) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
