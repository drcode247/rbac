const pool = require('../config/db');

const logActivity = async (userId, action, details = '') => {
  try {
    await pool.execute(
      'INSERT INTO activity_logs (user_id, action, details) VALUES (?, ?, ?)',
      [userId, action, details]
    );
  } catch (err) {
    console.error('Failed to log activity:', err);
  }
};

const getAllPermissions = async (req, res) => {
  try {
    const [permissions] = await pool.execute('SELECT * FROM permissions ORDER BY name');
    res.json(permissions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createPermission = async (req, res) => {
  const { name } = req.body;
  try {
    const [result] = await pool.execute('INSERT INTO permissions (name) VALUES (?)', [name]);
    await logActivity(req.user?.id, 'Create Permission', `Created: ${name}`);
    res.status(201).json({ id: result.insertId, name });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updatePermission = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  try {
    await pool.execute('UPDATE permissions SET name = ? WHERE id = ?', [name, id]);
    await logActivity(req.user?.id, 'Update Permission', `Updated ID ${id} to ${name}`);
    res.json({ message: 'Permission updated successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deletePermission = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.execute('DELETE FROM permissions WHERE id = ?', [id]);
    await logActivity(req.user?.id, 'Delete Permission', `Deleted ID ${id}`);
    res.json({ message: 'Permission deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAllRoles = async (req, res) => {
  try {
    const [roles] = await pool.execute('SELECT * FROM roles ORDER BY name');
    res.json(roles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createRole = async (req, res) => {
  const { name } = req.body;
  try {
    const [result] = await pool.execute('INSERT INTO roles (name) VALUES (?)', [name]);
    await logActivity(req.user?.id, 'Create Role', `Created role: ${name}`);
    res.status(201).json({ id: result.insertId, name });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateRole = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  try {
    await pool.execute('UPDATE roles SET name = ? WHERE id = ?', [name, id]);
    await logActivity(req.user?.id, 'Update Role', `Updated role ID ${id} to ${name}`);
    res.json({ message: 'Role updated successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteRole = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.execute('DELETE FROM roles WHERE id = ?', [id]);
    await logActivity(req.user?.id, 'Delete Role', `Deleted role ID ${id}`);
    res.json({ message: 'Role deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const [users] = await pool.execute(`
      SELECT 
        u.id, 
        u.username, 
        u.email, 
        GROUP_CONCAT(r.name) as roles
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      GROUP BY u.id
      ORDER BY u.username
    `);
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const assignRoleToUser = async (req, res) => {
  const { id: userId } = req.params;
  const { roleId } = req.body;

  try {
    // Remove old roles
    await pool.execute('DELETE FROM user_roles WHERE user_id = ?', [userId]);
    // Assign new role
    await pool.execute('INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)', [userId, roleId]);

    await logActivity(req.user?.id, 'Assign Role', `Assigned role ${roleId} to user ${userId}`);

    res.json({ message: 'Role assigned successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.execute('DELETE FROM users WHERE id = ?', [id]);
    await logActivity(req.user?.id, 'Delete User', `Deleted user ID ${id}`);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getRolePermissions = async (req, res) => {
  const { id } = req.params;
  try {
    const [permissions] = await pool.execute(`
      SELECT p.* FROM permissions p
      JOIN role_permissions rp ON p.id = rp.permission_id
      WHERE rp.role_id = ?
      ORDER BY p.name
    `, [id]);
    res.json(permissions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const assignPermissionToRole = async (req, res) => {
  const { id: roleId } = req.params;
  const { permissionId } = req.body;

  try {
    await pool.execute(
      'INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES (?, ?)',
      [roleId, permissionId]
    );
    await logActivity(req.user?.id, 'Assign Permission', `Assigned permission ${permissionId} to role ${roleId}`);
    res.json({ message: 'Permission assigned to role successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const removePermissionFromRole = async (req, res) => {
  const { id: roleId, permissionId } = req.params;

  try {
    await pool.execute(
      'DELETE FROM role_permissions WHERE role_id = ? AND permission_id = ?',
      [roleId, permissionId]
    );
    await logActivity(req.user?.id, 'Remove Permission', `Removed permission ${permissionId} from role ${roleId}`);
    res.json({ message: 'Permission removed from role successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getActivityLog = async (req, res) => {
  try {
    const [logs] = await pool.execute(`
      SELECT 
        al.id,
        al.action,
        al.details,
        al.created_at,
        u.username
      FROM activity_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ORDER BY al.created_at DESC
      LIMIT 15
    `);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getAllPermissions,
  createPermission,
  updatePermission,
  deletePermission,
  getAllRoles,
  createRole,
  updateRole,
  deleteRole,
  getAllUsers,
  assignRoleToUser,
  deleteUser,
  getRolePermissions,
  assignPermissionToRole,
  removePermissionFromRole,
  getActivityLog,
  logActivity
};