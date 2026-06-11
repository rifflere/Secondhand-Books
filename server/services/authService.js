const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const usersRepository = require('../repositories/usersRepository');
const shelvesRepository = require('../repositories/shelvesRepository');
const resetTokensRepository = require('../repositories/resetTokensRepository');
const emailService = require('./emailService');

const SALT_ROUNDS = 10;
const JWT_SECRET = () => process.env.JWT_SECRET || 'dev_secret_change_in_production';
const APP_URL = () => process.env.APP_URL || 'http://localhost:5173';

const register = async (username, password, email) => {
  const existing = await usersRepository.findByUsername(username);
  if (existing) {
    const err = new Error('Username already taken');
    err.status = 409;
    throw err;
  }
  const existingEmail = await usersRepository.findByEmail(email);
  if (existingEmail) {
    const err = new Error('An account with that email already exists');
    err.status = 409;
    throw err;
  }
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const id = await usersRepository.create({ username, passwordHash, email });
  await shelvesRepository.createDefault(id);
  return buildTokenResponse({ id, username });
};

const login = async (username, password) => {
  const user = await usersRepository.findByUsername(username);
  const valid = user && await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    const err = new Error('Invalid username or password');
    err.status = 401;
    throw err;
  }
  return buildTokenResponse({ id: user.id, username: user.username });
};

const recoverUsername = async (email) => {
  const user = await usersRepository.findByEmail(email);
  // Always resolve — don't reveal whether email exists
  if (user) {
    await emailService.sendUsernameReminder(user.email, user.username);
  }
};

const requestPasswordReset = async (username, email) => {
  const user = await usersRepository.findByUsername(username);
  // Only send if username + email both match the same account
  if (user && user.email && user.email.toLowerCase() === email.toLowerCase()) {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await resetTokensRepository.create(user.id, token, expiresAt);
    const link = `${APP_URL()}/reset-password?token=${token}`;
    await emailService.sendPasswordReset(user.email, user.username, link);
  }
};

const validateResetToken = async (token) => {
  const record = await resetTokensRepository.findValid(token);
  if (!record) {
    const err = new Error('This link is invalid or has expired');
    err.status = 400;
    throw err;
  }
  return record;
};

const resetPassword = async (token, newPassword) => {
  const record = await resetTokensRepository.findValid(token);
  if (!record) {
    const err = new Error('This link is invalid or has expired');
    err.status = 400;
    throw err;
  }
  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await usersRepository.updatePassword(record.user_id, passwordHash);
  await resetTokensRepository.markUsed(record.id);
};

const buildTokenResponse = (user) => {
  const token = jwt.sign(
    { id: user.id, username: user.username },
    JWT_SECRET(),
    { expiresIn: '7d' }
  );
  return { token, user: { id: user.id, username: user.username } };
};

module.exports = { register, login, recoverUsername, requestPasswordReset, validateResetToken, resetPassword };
