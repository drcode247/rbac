const express = require('express');
const { register, login, refresh, logout } = require('../controllers/authController');
// const { verifyToken, hasRole, hasPermission } = require('../middleware/auth');
const { verifyToken, verifyRefreshToken, hasRole, hasPermission } = require('../middleware/auth');

const adminController = require('../controllers/adminController');

const router = express.Router();


router.post('/register', register);
router.post('/login', login);
router.post('/refresh', verifyRefreshToken, refresh);
// router.post('/refresh', verifyToken, refresh);
router.post('/logout', logout);

// Protected routes
router.get('/profile', verifyToken, (req, res) => res.json({ user: req.user }));
router.get('/admin', verifyToken, hasRole(['admin']), (req, res) => res.json({ message: 'Welcome Admin!' }));
router.get('/manage-users', verifyToken, hasPermission('manage_users'), (req, res) => res.json({ message: 'You can manage users' }));


// Permissions CRUD
router.get('/permissions', verifyToken, hasRole(['admin']), adminController.getAllPermissions);
router.post('/permissions', verifyToken, hasRole(['admin']), adminController.createPermission);
router.put('/permissions/:id', verifyToken, hasRole(['admin']), adminController.updatePermission);
router.delete('/permissions/:id', verifyToken, hasRole(['admin']), adminController.deletePermission);

// Roles CRUD
router.get('/roles', verifyToken, hasRole(['admin']), adminController.getAllRoles);
router.post('/roles', verifyToken, hasRole(['admin']), adminController.createRole);
router.put('/roles/:id', verifyToken, hasRole(['admin']), adminController.updateRole);
router.delete('/roles/:id', verifyToken, hasRole(['admin']), adminController.deleteRole);

// Users Management
router.get('/users', verifyToken, hasRole(['admin']), adminController.getAllUsers);
router.put('/users/:id/role', verifyToken, hasRole(['admin']), adminController.assignRoleToUser);
router.delete('/users/:id', verifyToken, hasRole(['admin']), adminController.deleteUser);

// roles + permissions
router.get('/roles/:id/permissions', verifyToken, hasRole(['admin']), adminController.getRolePermissions);
router.post('/roles/:id/permissions', verifyToken, hasRole(['admin']), adminController.assignPermissionToRole);
router.delete('/roles/:id/permissions/:permissionId', verifyToken, hasRole(['admin']), adminController.removePermissionFromRole);

// Activity Log
router.get('/activity-log', verifyToken, adminController.getActivityLog);

module.exports = router;