import { Outlet } from 'react-router-dom'
import Navbar from './Navbar.jsx'

const Layout = () => {
  return (
    <>
      <Navbar />

      <header className="bg-primary text-white py-5 text-center shadow-sm">
        <div className="container">
          <h1 className="display-4 fw-bold">Secure Auth System</h1>
          <p className="lead mb-0">Role-Based Access</p>
        </div>
      </header>

      <main className="container min-vh-100 py-5">
        <Outlet />
      </main>

      <footer className="bg-dark text-white py-4 text-center">
        <div className="container">
          <p className="mb-0">
            © {new Date().getFullYear()} AuthSystem • React + Express + MySQL
          </p>
        </div>
      </footer>
    </>
  )
}

export default Layout