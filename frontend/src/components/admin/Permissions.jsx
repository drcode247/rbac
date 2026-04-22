import { useState, useEffect } from 'react'
import axios from 'axios'
import Toast from './Toast'

const Permissions = () => {
  const [permissions, setPermissions] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [toast, setToast] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editingPermission, setEditingPermission] = useState(null)
  const [name, setName] = useState('')

  useEffect(() => {
    fetchPermissions()
  }, [])

  const fetchPermissions = async () => {
    try {
      const res = await axios.get('/api/auth/permissions')
      setPermissions(res.data)
    } catch (err) {
      showToast('Failed to load permissions', 'error')
    }
  }

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  const filteredPermissions = permissions.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const openModal = (perm = null) => {
    setEditingPermission(perm)
    setName(perm ? perm.name : '')
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!name.trim()) {
      showToast('Permission name is required', 'error')
      return
    }

    try {
      if (editingPermission) {
        await axios.put(`/api/auth/permissions/${editingPermission.id}`, { name })
        showToast('Permission updated successfully')
      } else {
        await axios.post('/api/auth/permissions', { name })
        showToast('Permission created successfully')
      }
      fetchPermissions()
      setShowModal(false)
      setName('')
      setEditingPermission(null)
    } catch (err) {
      showToast(err.response?.data?.message || 'Operation failed', 'error')
    }
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete permission "${name}"?`)) return

    try {
      await axios.delete(`/api/auth/permissions/${id}`)
      showToast(`Permission "${name}" deleted successfully`)
      fetchPermissions()
    } catch (err) {
      showToast('Failed to delete permission', 'error')
    }
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>Permissions Management</h4>
        <input
          type="text"
          className="form-control w-25"
          placeholder="Search permissions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <button className="btn btn-success mb-3" onClick={() => openModal()}>
        <i className="fas fa-plus me-2"></i>New Permission
      </button>

        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Permission Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPermissions.map(p => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.name}</td>
                  <td>
                    <button className="btn btn-sm btn-warning me-2" onClick={() => openModal(p)}>
                      Edit
                    </button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(p.id, p.name)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
      </div>

      {showModal && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.6)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5>{editingPermission ? 'Edit Permission' : 'New Permission'}</h5>
                <button className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. delete_user, manage_posts"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
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

export default Permissions