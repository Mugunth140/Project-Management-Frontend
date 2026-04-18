import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../features/auth/auth-context'
import { PageShell, Spinner } from '../../shared/ui/base'

export function ProtectedRoute() {
  const { isAuthenticated, isHydrating } = useAuth()
  const location = useLocation()

  if (isHydrating) {
    return (
      <PageShell>
        <div className="flex min-h-[50vh] items-center justify-center">
          <Spinner label="Restoring your session..." />
        </div>
      </PageShell>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}
