import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const Navbar = () => {
  const { user, logout, hasRole } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await fetch('api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })
    } catch (e) {}
    logout()
    navigate('/login')
  }

  return (
    <>
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark fixed-top shadow-sm">
      <div className="container">
        <Link className="navbar-brand fw-bold fs-4" to="/">
          AuthSystem
        </Link>

        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center">
            {user && (
              <>
                <li className="nav-item">
                  <Link className="nav-link text-white px-3" to="/dashboard">
                    <i className="fas fa-tachometer-alt me-1"></i> Dashboard
                  </Link>
                </li>

                {hasRole('admin') && (
                  <li className="nav-item">
                    <Link className="nav-link text-white px-3" to="/admin">
                      <i className="fas fa-lock me-1"></i> Admin
                    </Link>
                  </li>
                )}

                <li className="nav-item ms-3">
                  <span className="text-white">Hi, <strong>{user.username}</strong></span>
                </li>

                <li className="nav-item ms-3">
                  <button onClick={handleLogout} className="btn btn-danger btn-sm px-3">
                    <i className="fas fa-sign-out-alt me-1"></i> Logout
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>

    <div className="mb-5 "></div>
 

    </>
  )
}

export default Navbar