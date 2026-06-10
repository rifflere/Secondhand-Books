const jwt = require('jsonwebtoken');

const JWT_SECRET = () => process.env.JWT_SECRET || 'dev_secret_change_in_production';

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  try {
    req.user = jwt.verify(authHeader.slice(7), JWT_SECRET());
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};
