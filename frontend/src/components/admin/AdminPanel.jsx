import { useState } from 'react'
import Users from './Users'
import Roles from './Roles'
import Permissions from './Permissions'
import RolePermissions from './RolePermissions'

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('users')

  return (
    <div className="container py-4">
      <div className="text-center mb-5">
        <h1 className="display-5 fw-bold text-primary">Admin Panel</h1>
        <p className="text-muted lead">Full Role-Based Access Control Management</p>
      </div>

      <ul className="nav nav-tabs mb-4 justify-content-center" id="adminTabs" role="tablist">
        <li className="nav-item" role="presentation">
          <button 
            className={`nav-link ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
            type="button"
          >
          Users
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button 
            className={`nav-link ${activeTab === 'roles' ? 'active' : ''}`}
            onClick={() => setActiveTab('roles')}
            type="button"
          >
            Roles
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button 
            className={`nav-link ${activeTab === 'permissions' ? 'active' : ''}`}
            onClick={() => setActiveTab('permissions')}
            type="button"
          >
            Permissions
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button 
            className={`nav-link ${activeTab === 'role-permissions' ? 'active' : ''}`}
            onClick={() => setActiveTab('role-permissions')}
            type="button"
          >
            Role & Permissions
          </button>
        </li>
      </ul>

      <div className="tab-content">
        <div className={`tab-pane fade ${activeTab === 'users' ? 'show active' : ''}`}>
          <Users />
        </div>
        <div className={`tab-pane fade ${activeTab === 'roles' ? 'show active' : ''}`}>
          <Roles />
        </div>
        <div className={`tab-pane fade ${activeTab === 'permissions' ? 'show active' : ''}`}>
          <Permissions />
        </div>
        <div className={`tab-pane fade ${activeTab === 'role-permissions' ? 'show active' : ''}`}>
          <RolePermissions />
        </div>
      </div>
    </div>
  )
}

export default AdminPanel