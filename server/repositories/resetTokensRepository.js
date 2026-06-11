const pool = require('../config/database');

const create = async (userId, token, expiresAt) => {
  await pool.query(
    'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
    [userId, token, expiresAt]
  );
};

const findValid = async (token) => {
  const [rows] = await pool.query(
    `SELECT * FROM password_reset_tokens
     WHERE token = ? AND used_at IS NULL AND expires_at > NOW()`,
    [token]
  );
  return rows[0] || null;
};

const markUsed = async (id) => {
  await pool.query(
    'UPDATE password_reset_tokens SET used_at = NOW() WHERE id = ?',
    [id]
  );
};

module.exports = { create, findValid, markUsed };
