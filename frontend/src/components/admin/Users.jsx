import { useState, useEffect } from 'react'
import axios from 'axios'
import Toast from './Toast'

const Users = () => {
  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [toast, setToast] = useState(null)
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [errorUsers, setErrorUsers] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [selectedRoleId, setSelectedRoleId] = useState('')

  useEffect(() => {
    fetchUsers()
    fetchRoles()
  }, [])

  const fetchUsers = async () => {
    setLoadingUsers(true)
    setErrorUsers(false)
    try {
      const res = await axios.get('/api/auth/users')
      setUsers(res.data)
    } catch (err) {
      console.error(err)
      setErrorUsers(true)
      showToast('Failed to load users', 'error')
    } finally {
      setLoadingUsers(false)
    }
  }

  const fetchRoles = async () => {
    try {
      const res = await axios.get('/api/auth/roles')
      setRoles(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  const retryFetchUsers = () => {
    fetchUsers()
  }

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const openAssignModal = (user) => {
    setSelectedUser(user)
    setSelectedRoleId('')
    setShowAssignModal(true)
  }

  const assignRole = async () => {
    if (!selectedUser || !selectedRoleId) return

    try {
      await axios.put(`/api/auth/users/${selectedUser.id}/role`, { roleId: selectedRoleId })
      showToast(`Role assigned to ${selectedUser.username} successfully!`)
      fetchUsers()
      setShowAssignModal(false)
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to assign role', 'error')
    }
  }

  const deleteUser = async (id, username) => {
    if (!window.confirm(`Delete user "${username}"? This action cannot be undone.`)) return

    try {
      await axios.delete(`/api/auth/users/${id}`)
      showToast(`User "${username}" deleted successfully`)
      fetchUsers()
    } catch (err) {
      showToast('Failed to delete user', 'error')
    }
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>Users Management</h4>
        <input
          type="text"
          className="form-control w-25"
          placeholder="Search by username or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {errorUsers && (
        <div className="alert alert-danger d-flex justify-content-between align-items-center mb-4">
          <span>Failed to load users. Please check your connection.</span>
          <button className="btn btn-outline-danger btn-sm" onClick={retryFetchUsers}>
            Retry
          </button>
        </div>
      )}

      {loadingUsers && !errorUsers && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="mt-2 text-muted">Loading users...</p>
        </div>
      )}

      {!loadingUsers && !errorUsers && (
        <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Email</th>
              <th>Roles</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(u => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td><strong>{u.username}</strong></td>
                <td>{u.email}</td>
                <td>
                  {u.roles ? u.roles.split(',').map(r => (
                    <span key={r} className="badge bg-primary me-1">{r}</span>
                  )) : <span className="text-muted">No role assigned</span>}
                </td>
                <td>
                  <button className="btn btn-sm btn-primary me-2" onClick={() => openAssignModal(u)}>
                    Assign Role
                  </button>
                  <button className="btn btn-sm btn-danger" onClick={() => deleteUser(u.id, u.username)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}

      {showAssignModal && selectedUser && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.6)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5>Assign Role to <strong>{selectedUser.username}</strong></h5>
                <button className="btn-close" onClick={() => setShowAssignModal(false)}></button>
              </div>
              <div className="modal-body">
                <select 
                  className="form-select"
                  value={selectedRoleId}
                  onChange={(e) => setSelectedRoleId(e.target.value)}
                >
                  <option value="">Select Role...</option>
                  {roles.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowAssignModal(false)}>Cancel</button>
                <button className="btn btn-success" onClick={assignRole} disabled={!selectedRoleId}>
                  Assign Role
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}

export default Users