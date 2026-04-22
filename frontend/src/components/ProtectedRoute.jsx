import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const ProtectedRoute = ({ children, permission, role }) => {
  const { user, loading, hasPermission, hasRole } = useAuth()

  console.log("ProtectedRoute - loading:", loading, "user:", user ? user.username : null)

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  if (!user) {
    console.log("No user → redirecting to /login")
    return <Navigate to="/login" replace />
  }

  if (permission && !hasPermission(permission)) {
    return <Navigate to="/dashboard" replace />
  }

  if (role && !hasRole(role)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default ProtectedRoute