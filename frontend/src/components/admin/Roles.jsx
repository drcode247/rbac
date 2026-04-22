import { useState, useEffect } from 'react'
import axios from 'axios'
import Toast from './Toast'

const Roles = () => {
  const [roles, setRoles] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [toast, setToast] = useState(null)
  const [loadingRoles, setLoadingRoles] = useState(true)
  const [errorRoles, setErrorRoles] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingRole, setEditingRole] = useState(null)
  const [name, setName] = useState('')

  useEffect(() => {
    fetchRoles()
  }, [])

  const fetchRoles = async () => {
    setLoadingRoles(true)
    setErrorRoles(false)
    try {
      const res = await axios.get('/api/auth/roles')
      setRoles(res.data)
    } catch (err) {
      console.error(err)
      setErrorRoles(true)
      showToast('Failed to load roles', 'error')
    } finally {
      setLoadingRoles(false)
    }
  }

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  const retryFetchRoles = () => {
    fetchRoles()
  }

  const filteredRoles = roles.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const openModal = (role = null) => {
    setEditingRole(role)
    setName(role ? role.name : '')
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!name.trim()) {
      showToast('Role name is required', 'error')
      return
    }

    try {
      if (editingRole) {
        await axios.put(`/api/auth/roles/${editingRole.id}`, { name })
        showToast('Role updated successfully')
      } else {
        await axios.post('/api/auth/roles', { name })
        showToast('Role created successfully')
      }
      fetchRoles()
      setShowModal(false)
      setName('')
      setEditingRole(null)
    } catch (err) {
      showToast(err.response?.data?.message || 'Operation failed', 'error')
    }
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete role "${name}"?`)) return

    try {
      await axios.delete(`/api/auth/roles/${id}`)
      showToast(`Role "${name}" deleted successfully`)
      fetchRoles()
    } catch (err) {
      showToast('Delete failed', 'error')
    }
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>Roles Management</h4>
        <input
          type="text"
          className="form-control w-25"
          placeholder="Search roles..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {errorRoles && (
        <div className="alert alert-danger d-flex justify-content-between align-items-center mb-4">
          <span>Failed to load roles. Please check your connection.</span>
          <button className="btn btn-outline-danger btn-sm" onClick={retryFetchRoles}>
            Retry
          </button>
        </div>
      )}

      {loadingRoles && !errorRoles && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="mt-2 text-muted">Loading roles...</p>
        </div>
      )}

      {!loadingRoles && !errorRoles && (
        <>
          <button className="btn btn-success mb-3" onClick={() => openModal()}>
            <i className="fas fa-plus me-2"></i>New Role
          </button>

        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Role Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRoles.map(r => (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td>{r.name}</td>
                  <td>
                    <button 
                      className="btn btn-sm btn-warning me-2" 
                      onClick={() => openModal(r)}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn btn-sm btn-danger" 
                      onClick={() => handleDelete(r.id, r.name)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>
      )}

      {showModal && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.6)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5>{editingRole ? 'Edit Role' : 'New Role'}</h5>
                <button className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <input 
                  type="text" 
                  className="form-control" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="Role name (e.g. moderator)" 
                />
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="btn btn-success" onClick={handleSave}>Save</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}

export default Roles