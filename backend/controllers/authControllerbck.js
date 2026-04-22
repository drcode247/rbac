const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user.id, username: user.username, roles: user.roles, permissions: user.permissions },
    process.env.JWT_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRES }
  );

  const refreshToken = jwt.sign(
    { id: user.id, username: user.username, roles: user.roles, permissions: user.permissions },
    process.env.JWT_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRES }
  );

  return { accessToken, refreshToken };
};

const register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if user already exists
    const [existing] = await pool.execute(
      'SELECT id FROM users WHERE email = ? OR username = ?',
      [email, username]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'User with this email or username already exists' });
    }

    // Hash pwd
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    const [result] = await pool.execute(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    );

    const userId = result.insertId;

    // Assign default "user" role
    await pool.execute(
      'INSERT INTO user_roles (user_id, role_id) SELECT ?, id FROM roles WHERE name = "user"',
      [userId]
    );

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

    // res.cookie('refreshToken', refreshToken, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === 'production',
    //   sameSite: 'strict',
    //   maxAge: 7 * 24 * 60 * 60 * 1000
    // });

      // Change this part in production na ref hapo juu:
     res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
    })

    res.json({
      accessToken,
      user: { id: user.id, username: user.username, roles, permissions }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// refresh token iko hapa

const refresh = async (req, res) => {

  console.log("Cookies received:", req.cookies)
  
  const token = req.cookies.refreshToken;

  if (!token) {
    return res.status(401).json({ message: 'No refresh token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { accessToken } = generateTokens({
      id: decoded.id
    });

    res.json({ accessToken });
  } catch (err) {
    return res.status(403).json({ message: 'Invalid refresh token' });
  }
};

const logout = (req, res) => {
  res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'strict' });
  res.json({ message: 'Logged out successfully' });
};

module.exports = { register, login, refresh, logout };