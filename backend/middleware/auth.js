const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// access token verify

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// refresh token verify
const verifyRefreshToken = (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.status(401).json({ message: 'No refresh token' });

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
};

const hasRole = (roles) => (req, res, next) => {
  if (!req.user?.roles?.some(r => roles.includes(r))) {
    return res.status(403).json({ message: 'Forbidden: Insufficient role' });
  }
  next();
};

const hasPermission = (permission) => (req, res, next) => {
  if (!req.user?.permissions?.includes(permission)) {
    return res.status(403).json({ message: 'Forbidden: Insufficient permission' });
  }
  next();
};

module.exports = { verifyToken, verifyRefreshToken, hasRole, hasPermission };