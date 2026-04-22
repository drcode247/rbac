const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
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

// access token + refresh token
const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { 
      id: user.id, 
      username: user.username, 
      roles: user.roles, 
      permissions: user.permissions 
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRES }
  );

  const refreshToken = jwt.sign(
    { 
      id: user.id, 
      username: user.username, 
      roles: user.roles, 
      permissions: user.permissions 
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRES }
  );

  return { accessToken, refreshToken };
};

const register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const [existing] = await pool.execute(
      'SELECT id FROM users WHERE email = ? OR username = ?',
      [email, username]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'User with this email or username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.execute(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    );

    const userId = result.insertId;

    await pool.execute(
      'INSERT INTO user_roles (user_id, role_id) SELECT ?, id FROM roles WHERE name = "user"',
      [userId]
    );

    await logActivity(userId, 'User Registration', `New user registered: ${username} (${email})`);

    console.log(`New user registered: ${username} (${email})`);

    res.status(201).json({ 
      message: 'User registered successfully',
      userId 
    });

  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const [users] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (!users.length) return res.status(400).json({ message: 'Invalid credentials' });

    const user = users[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: 'Invalid credentials' });

    // Get roles
    const [rolesData] = await pool.execute(`
      SELECT r.name FROM roles r 
      JOIN user_roles ur ON r.id = ur.role_id 
      WHERE ur.user_id = ?
    `, [user.id]);

    // Get permissions
    const [permsData] = await pool.execute(`
      SELECT DISTINCT p.name FROM permissions p
      JOIN role_permissions rp ON p.id = rp.permission_id
      JOIN user_roles ur ON rp.role_id = ur.role_id
      WHERE ur.user_id = ?
    `, [user.id]);

    const roles = rolesData.map(r => r.name);
    const permissions = permsData.map(p => p.name);

    const { accessToken, refreshToken } = generateTokens({ 
      id: user.id, 
      username: user.username, 
      roles, 
      permissions 
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    await logActivity(user.id, 'User Login', 'Successful login from dashboard');

    res.json({
      accessToken,
      user: { 
        id: user.id, 
        username: user.username, 
        roles, 
        permissions 
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// refresh token iko hapa

const refresh = async (req, res) => {
  const token = req.cookies.refreshToken;

  if (!token) {
    return res.status(401).json({ message: 'No refresh token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Reload full user data from db
    const [users] = await pool.execute(
      'SELECT id, username FROM users WHERE id = ?',
      [decoded.id]
    );

    if (!users.length) {
      return res.status(401).json({ message: 'User not found' });
    }

    const user = users[0];

    // Reload roles
    const [rolesData] = await pool.execute(`
      SELECT r.name FROM roles r 
      JOIN user_roles ur ON r.id = ur.role_id 
      WHERE ur.user_id = ?
    `, [user.id]);

    // Reload permissions
    const [permsData] = await pool.execute(`
      SELECT DISTINCT p.name FROM permissions p
      JOIN role_permissions rp ON p.id = rp.permission_id
      JOIN user_roles ur ON rp.role_id = ur.role_id
      WHERE ur.user_id = ?
    `, [user.id]);

    const roles = rolesData.map(r => r.name);
    const permissions = permsData.map(p => p.name);

    const accessToken = jwt.sign(
      { 
        id: user.id, 
        username: user.username, 
        roles, 
        permissions 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRES }
    );

    await logActivity(user.id, 'Token Refresh', 'Access token refreshed successfully');

    return res.json({
      accessToken,
      user: {
        id: user.id,
        username: user.username,
        roles,
        permissions
      }
    });

  } catch (err) {
    console.error('Refresh error:', err);
    return res.status(403).json({ message: 'Invalid refresh token' });
  }
};

const logout = (req, res) => {
  res.clearCookie('refreshToken', { 
    httpOnly: true, 
    sameSite: 'lax', 
    path: '/' 
  });
  
  res.json({ message: 'Logged out successfully' });
};

module.exports = { 
  register, 
  login, 
  refresh, 
  logout 
};