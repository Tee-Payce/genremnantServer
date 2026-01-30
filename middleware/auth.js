const User = require('../models/User');

// Middleware to verify session token
const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    // Token is the user ID
    const user = await User.findById(token);
    if (!user) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = { id: user.id, email: user.email, role: user.role, status: user.status };
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

// Middleware to check if user has required roles
const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    next();
  };
};

// Middleware to check if user is active
const checkUserStatus = (req, res, next) => {
  if (req.user && req.user.status !== 'active') {
    return res.status(403).json({ message: 'User account is suspended or inactive' });
  }
  next();
};

module.exports = {
  verifyToken,
  checkRole,
  checkUserStatus,
};
