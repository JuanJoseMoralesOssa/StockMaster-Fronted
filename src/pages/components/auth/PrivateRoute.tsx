import { JSX } from 'react'
import { Navigate } from 'react-router-dom'
import useAuthStore from '../../../stores/useAuthStore'
import { LoadingScreen } from '../common/LoadingSpinner'

interface PrivateRouteProps {
  element: JSX.Element
  allowedRoles?: string[] // Array de roles permitidos (ej: ['admin', 'office'])
}

const PrivateRoute = ({ element, allowedRoles }: PrivateRouteProps) => {
  const { isAuthenticated, isLoading, user } = useAuthStore()

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return <LoadingScreen />
  }

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Validar roles si se especificaron
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = user?.role

    // Si el usuario no tiene rol o su rol no está en la lista permitida
    if (!userRole || !allowedRoles.includes(userRole)) {
      // Redirigir a una página de acceso denegado o al dashboard principal
      return <Navigate to="/access-denied" replace />
    }
  }

  // Si está autenticado y tiene los permisos necesarios, mostrar el elemento
  return element
}

export default PrivateRoute
