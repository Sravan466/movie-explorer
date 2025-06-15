const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  console.log('Auth middleware - Processing request to:', req.path);
  
  // Get token from Authorization header
  const authHeader = req.header('Authorization');
  console.log('Auth middleware - Authorization header:', authHeader ? 'present' : 'missing');
  
  // Check if no authorization header
  if (!authHeader) {
    console.log('Auth middleware - No authorization header found');
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // Extract token from "Bearer <token>" format
  const token = authHeader.startsWith('Bearer ') 
    ? authHeader.slice(7) 
    : authHeader;

  console.log('Auth middleware - Token extracted:', token ? 'yes' : 'no');
  console.log('Auth middleware - Token preview:', token ? `${token.substring(0, 20)}...` : 'none');

  // Check if token exists after extraction
  if (!token) {
    console.log('Auth middleware - No token after extraction');
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // Check if JWT_SECRET exists
  if (!process.env.JWT_SECRET) {
    console.error('Auth middleware - JWT_SECRET not found in environment variables');
    return res.status(500).json({ msg: 'Server configuration error' });
  }

  // Verify token
  try {
    console.log('Auth middleware - Attempting to verify token');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Auth middleware - Token verified successfully, user:', decoded.user);
    req.user = decoded.user;
    next();
  } catch (err) {
    console.error('Auth middleware - Token verification failed:', err.message);
    console.error('Auth middleware - Error details:', err);
    res.status(401).json({ msg: 'Token is not valid' });
  }
}; 