const jwt = require('jsonwebtoken');

/**
 * Protect routes with JWT authentication
 */
module.exports = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Access denied. No token provided.'
      });
    }

    const token = authHeader.replace('Bearer ', '');

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Add user info to request
    req.user = decoded;

    next();
  } catch (error) {
    console.error('Auth Middleware Error:', error.message);
    res.status(400).json({
      error: 'Invalid token. Please login again.'
    });
  }
};