import { useState, useEffect } from 'react'
import axios from 'axios'
import Toast from './Toast'

const RolePermissions = () => {
  const [roles, setRoles] = useState([])
  const [permissions, setPermissions] = useState([])
  const [selectedRole, setSelectedRole] = useState(null)
  const [rolePermissions, setRolePermissions] = useState([])
  const [toast, setToast] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [selectedPermissionId, setSelectedPermissionId] = useState('')

  useEffect(() => {
    fetchRoles()
    fetchPermissions()
  }, [])

  const fetchRoles = async () => {
    try {
      const res = await axios.get('/api/auth/roles')
      setRoles(res.data)
    } catch (err) {
      showToast('Failed to load roles', 'error')
    }
  }

  const fetchPermissions = async () => {
    try {
      const res = await axios.get('/api/auth/permissions')
      setPermissions(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  const loadRolePermissions = async (role) => {
    setSelectedRole(role)
    try {
      const res = await axios.get(`/api/auth/roles/${role.id}/permissions`)
      setRolePermissions(res.data)
      setShowModal(true)
    } catch (err) {
      showToast('Failed to load role permissions', 'error')
    }
  }

  const assignPermission = async () => {
    if (!selectedRole || !selectedPermissionId) return

    try {
      await axios.post(`/api/auth/roles/${selectedRole.id}/permissions`, {
        permissionId: selectedPermissionId
      })
      showToast(`Permission assigned to ${selectedRole.name}`)
      loadRolePermissions(selectedRole)
      setSelectedPermissionId('')
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to assign permission', 'error')
    }
  }

  const removePermission = async (permissionId, permissionName) => {
    if (!selectedRole) return
    if (!window.confirm(`Remove "${permissionName}" from ${selectedRole.name}?`)) return

    try {
      await axios.delete(`/api/auth/roles/${selectedRole.id}/permissions/${permissionId}`)
      showToast(`Permission "${permissionName}" removed`)
      loadRolePermissions(selectedRole)
    } catch (err) {
      showToast('Failed to remove permission', 'error')
    }
  }

  return (
    <div>
      <h4 className="mb-4">Role → Permission Mapping</h4>

      <div className="row">
        {roles.map(role => (
          <div key={role.id} className="col-md-6 mb-4">
            <div className="card h-100 shadow-sm">
              <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center">
                <strong>{role.name}</strong>
                <button 
                  className="btn btn-sm btn-light"
                  onClick={() => loadRolePermissions(role)}
                >
                  Manage
                </button>
              </div>
              <div className="card-body">
                <p className="text-muted small mb-0">Click "Manage" to assign or remove permissions</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && selectedRole && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.6)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5>Manage Permissions for <strong>{selectedRole.name}</strong></h5>
                <button className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="row mb-4">
                  <div className="col-md-8">
                    <select 
                      className="form-select"
                      value={selectedPermissionId}
                      onChange={(e) => setSelectedPermissionId(e.target.value)}
                    >
                      <option value="">Select permission to add...</option>
                      {permissions.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-4">
                    <button 
                      className="btn btn-success w-100"
                      onClick={assignPermission}
                      disabled={!selectedPermissionId}
                    >
                      Add Permission
                    </button>
                  </div>
                </div>

                <h6>Currently Assigned Permissions:</h6>
                {rolePermissions.length === 0 ? (
                  <p className="text-muted">No permissions assigned yet.</p>
                ) : (
                  <div className="d-flex flex-wrap gap-2">
                    {rolePermissions.map(p => (
                      <span key={p.id} className="badge bg-success d-flex align-items-center gap-2 px-3 py-2 fs-6">
                        {p.name}
                        <i 
                          className="fas fa-times ms-2" 
                          style={{ cursor: 'pointer' }}
                          onClick={() => removePermission(p.id, p.name)}
                        ></i>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}

export default RolePermissions