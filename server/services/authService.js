const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const usersRepository = require('../repositories/usersRepository');

const SALT_ROUNDS = 10;
const JWT_SECRET = () => process.env.JWT_SECRET || 'dev_secret_change_in_production';

const register = async (username, password) => {
  const existing = await usersRepository.findByUsername(username);
  if (existing) {
    const err = new Error('Username already taken');
    err.status = 409;
    throw err;
  }
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const id = await usersRepository.create({ username, passwordHash });
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

const buildTokenResponse = (user) => {
  const token = jwt.sign(
    { id: user.id, username: user.username },
    JWT_SECRET(),
    { expiresIn: '7d' }
  );
  return { token, user: { id: user.id, username: user.username } };
};

module.exports = { register, login };
