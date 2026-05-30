import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { motion } from 'framer-motion'

export const ProtectedRoute = ({ children, requiredRoles }) => {
  const { isAuthenticated, user, isLoading, token } = useAuthStore()

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-surface">
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 mx-auto">
            <div className="animate-spin">
              <svg className="w-12 h-12 text-blood" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          </div>
          <p className="text-text-muted">Loading your session...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !user || !token) {
    return <Navigate to="/login" replace />
  }

  // Check role if required roles are specified
  if (requiredRoles && requiredRoles.length > 0) {
    const userRole = user.role || user.userType

    if (!requiredRoles.includes(userRole)) {
      // Redirect to appropriate dashboard based on role
      const roleDashboards = {
        seeker: '/seeker/dashboard',
        donor: '/donor/dashboard',
        hospital: '/hospital/dashboard',
        admin: '/admin/dashboard',
      }
      const redirectUrl = roleDashboards[userRole] || '/login'
      return <Navigate to={redirectUrl} replace />
    }
  }

  // Page transition animation
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  )
}
