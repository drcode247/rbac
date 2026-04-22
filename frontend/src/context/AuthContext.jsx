import { createContext, useContext, useState, useEffect } from 'react'
import { jwtDecode } from 'jwt-decode'
import axios from 'axios'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
  const restoreSession = async () => {
  console.log("[Auth] Starting session restore...")

  try {
    console.log("[Auth] Sending POST to /refresh with credentials...")

    const res = await axios.post(
      '/api/auth/refresh',
      {},
      { withCredentials: true }
    )

    console.log("[Auth] Refresh response received:", res.status)
    console.log("[Auth] New access token received")

    const token = res.data.accessToken
    const decoded = jwtDecode(token)

    console.log("[Auth] Decoded user:", decoded)

    setUser(decoded)
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

  } catch (err) {
    console.error("[Auth] Refresh request FAILED:")
    console.error("Status:", err.response?.status)
    console.error("Message:", err.response?.data?.message || err.message)
    console.error("Full error:", err)
  } finally {
    console.log("[Auth] Session restore finished. Loading = false")
    setLoading(false)
  }
}

    restoreSession()
  }, [])

  const login = (newToken, userData) => {
    console.log("[Auth] Login successful for:", userData.username)
    setUser(userData)
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
  }

  const logout = () => {
    console.log("[Auth] Logout called")
    setUser(null)
    delete axios.defaults.headers.common['Authorization']
  }

  const hasPermission = (permission) => user?.permissions?.includes(permission) || false
  const hasRole = (role) => user?.roles?.includes(role) || false

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      hasPermission, 
      hasRole, 
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)