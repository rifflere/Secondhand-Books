const authService = require('../services/authService');

const register = async (req, res, next) => {
  try {
    const { username, password, email } = req.body;
    if (!username?.trim() || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    if (!email?.trim()) {
      return res.status(400).json({ error: 'Email is required' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({ error: 'Please enter a valid email address' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    const result = await authService.register(username.trim(), password, email.trim().toLowerCase());
    res.status(201).json(result);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username?.trim() || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    const result = await authService.login(username.trim(), password);
    res.json(result);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
};

const recover = async (req, res, next) => {
  try {
    const { type, email, username } = req.body;
    if (!email?.trim()) {
      return res.status(400).json({ error: 'Email is required' });
    }
    if (type === 'password') {
      if (!username?.trim()) {
        return res.status(400).json({ error: 'Username is required to reset your password' });
      }
      await authService.requestPasswordReset(username.trim(), email.trim().toLowerCase());
    } else {
      await authService.recoverUsername(email.trim().toLowerCase());
    }
    // Generic response — never reveal whether email/username exists
    res.json({ message: 'If we found a matching account, an email is on its way.' });
  } catch (err) {
    next(err);
  }
};

const validateResetToken = async (req, res, next) => {
  try {
    await authService.validateResetToken(req.params.token);
    res.json({ valid: true });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    await authService.resetPassword(token, password);
    res.json({ message: 'Password updated. You can now sign in.' });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
};

module.exports = { register, login, recover, validateResetToken, resetPassword };
