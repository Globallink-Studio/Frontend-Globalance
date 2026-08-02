import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../providers/authentication/AuthContext'

export default function ProtectedRoute() {
  const { isAuthenticated, initializing } = useAuth()

  if (initializing) return <p className="text-sm text-gray-500">Cargando...</p>
  if (!isAuthenticated) return <Navigate to="/" replace />

  return <Outlet />
}
