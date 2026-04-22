import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const Dashboard = () => {
  const { user, logout, hasPermission, hasRole } = useAuth()
  const navigate = useNavigate()

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRoles: 0,
    totalPermissions: 0
  })
  const [loadingStats, setLoadingStats] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const promises = []

        if (hasPermission('manage_users')) {
          promises.push(axios.get('/api/auth/users').then(res => res.data.length))
        }
        if (hasRole('admin')) {
          promises.push(axios.get('/api/auth/roles').then(res => res.data.length))
          promises.push(axios.get('/api/auth/permissions').then(res => res.data.length))
        }

        const results = await Promise.all(promises)

        setStats({
          totalUsers: hasPermission('manage_users') ? results[0] : 0,
          totalRoles: hasRole('admin') ? results[hasPermission('manage_users') ? 1 : 0] : 0,
          totalPermissions: hasRole('admin') ? results[hasPermission('manage_users') ? 2 : 1] : 0
        })
      } catch (err) {
        console.error('Failed to fetch stats:', err)
      } finally {
        setLoadingStats(false)
      }
    }

    if (user) {
      fetchStats()
    }
  }, [user, hasPermission, hasRole])

  const handleCardClick = (action) => {
    if (action === 'admin') navigate('/admin')
    if (action === 'manage_users') navigate('/admin')
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-5">
        <div>
          <h1 className="display-6 fw-bold">Welcome back, {user?.username}!</h1>
          <p className="text-muted">Here's an overview of your account</p>
        </div>
        <button onClick={logout} className="btn btn-outline-danger">
          <i className="fas fa-sign-out-alt me-2"></i>Logout
        </button>
      </div>

      <div className="row g-4 mb-5">
        {hasPermission('manage_users') && (
          <div className="col-md-4">
            <div 
              className="card h-100 shadow-sm border-0 hover-shadow cursor-pointer"
              onClick={() => handleCardClick('manage_users')}
            >
              <div className="card-body text-center p-4">
                <div className="text-primary mb-3">
                  <i className="fas fa-users fa-3x"></i>
                </div>
                <h2 className="fw-bold text-primary mb-1">
                  {loadingStats ? '...' : stats.totalUsers}
                </h2>
                <p className="text-muted mb-0">Total Users</p>
              </div>
              <div className="card-footer bg-light text-center py-3">
                <span className="text-primary fw-semibold">Manage Users →</span>
              </div>
            </div>
          </div>
        )}

        {hasRole('admin') && (
          <div className="col-md-4">
            <div 
              className="card h-100 shadow-sm border-0 hover-shadow cursor-pointer"
              onClick={() => handleCardClick('admin')}
            >
              <div className="card-body text-center p-4">
                <div className="text-warning mb-3">
                  <i className="fas fa-tags fa-3x"></i>
                </div>
                <h2 className="fw-bold text-warning mb-1">
                  {loadingStats ? '...' : stats.totalRoles}
                </h2>
                <p className="text-muted mb-0">Total Roles</p>
              </div>
              <div className="card-footer bg-light text-center py-3">
                <span className="text-warning fw-semibold">Manage Roles →</span>
              </div>
            </div>
          </div>
        )}

        {hasRole('admin') && (
          <div className="col-md-4">
            <div 
              className="card h-100 shadow-sm border-0 hover-shadow cursor-pointer"
              onClick={() => handleCardClick('admin')}
            >
              <div className="card-body text-center p-4">
                <div className="text-success mb-3">
                  <i className="fas fa-key fa-3x"></i>
                </div>
                <h2 className="fw-bold text-success mb-1">
                  {loadingStats ? '...' : stats.totalPermissions}
                </h2>
                <p className="text-muted mb-0">Total Permissions</p>
              </div>
              <div className="card-footer bg-light text-center py-3">
                <span className="text-success fw-semibold">Manage Permissions →</span>
              </div>
            </div>
          </div>
        )}

        {!hasPermission('manage_users') && !hasRole('admin') && (
          <div className="col-12">
            <div className="card shadow-sm border-0 text-center py-5">
              <i className="fas fa-user-check fa-4x text-primary mb-3"></i>
              <h4>Welcome to your Dashboard</h4>
              <p className="text-muted">You have basic user access. More features will appear as permissions are granted.</p>
            </div>
          </div>
        )}
      </div>

      <div className="row g-4">
        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-header bg-light">
              <h5 className="mb-0">Your Profile</h5>
            </div>
            <div className="card-body">
              <ul className="list-group list-group-flush">
                <li className="list-group-item d-flex justify-content-between">
                  <strong>Username</strong>
                  <span>{user?.username}</span>
                </li>
                <li className="list-group-item d-flex justify-content-between">
                  <strong>User ID</strong>
                  <span className="text-muted">{user?.id}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-header bg-light">
              <h5 className="mb-0">Your Roles</h5>
            </div>
            <div className="card-body">
              <div className="d-flex flex-wrap gap-2">
                {user?.roles?.length > 0 ? (
                  user.roles.map(role => (
                    <span key={role} className="badge bg-primary fs-6 px-3 py-2">
                      {role.toUpperCase()}
                    </span>
                  ))
                ) : (
                  <span className="text-muted">No roles assigned yet</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-header bg-light">
              <h5 className="mb-0">Your Permissions (Inherited from Roles)</h5>
            </div>
            <div className="card-body">
              <div className="d-flex flex-wrap gap-2">
                {user?.permissions?.length > 0 ? (
                  user.permissions.map(perm => (
                    <span key={perm} className="badge bg-success fs-6 px-3 py-2">
                      {perm}
                    </span>
                  ))
                ) : (
                  <span className="text-muted">No permissions assigned yet</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard