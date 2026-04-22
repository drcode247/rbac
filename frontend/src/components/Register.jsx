import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

const Register = () => {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()        
    console.log("Form submitted")

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      console.log("Passwords do not match")
      return
    }

    setLoading(true)
    setError('')

    try {
      console.log("Sending registration request to backend...")
      const res = await axios.post('api/auth/register', {
        username,
        email,
        password
      })
      
      console.log("Registration successful:", res.data)
      alert('Registration successful! Please login.')
      navigate('/login')
    } catch (err) {
      console.error("Registration error:", err.response?.data || err.message)
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100">
      <div className="card shadow-lg" style={{ maxWidth: '520px', width: '100%' }}>
        <div className="card-body p-5">
          <div className="text-center mb-4">
            <i className="fas fa-user-plus fa-3x text-success mb-3"></i>
            <h2 className="fw-bold">Create Account</h2>
            <p className="text-muted">Join the secure auth system</p>
          </div>

          {error && <div className="alert alert-danger py-2 text-center">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Username</label>
                <input
                  type="text"
                  className="form-control form-control-lg"
                  placeholder="johndoe"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-control form-control-lg"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Password</label>
                <div className="input-group input-group-lg">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-control"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="btn btn-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Confirm Password</label>
                <div className="input-group input-group-lg">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="form-control"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="btn btn-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-success btn-lg w-100 mt-3"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="text-center mt-4">
            <p className="mb-0">
              Already have an account?{' '}
              <Link to="/login" className="text-primary fw-semibold">Login here</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register