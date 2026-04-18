import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../features/auth/auth-context'

export function PublicOnlyRoute() {
  const { isAuthenticated, isHydrating } = useAuth()

  if (isHydrating) {
    return null
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
