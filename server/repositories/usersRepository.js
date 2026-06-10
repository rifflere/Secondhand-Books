const pool = require('../config/database');

const findByUsername = async (username) => {
  const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
  return rows[0] || null;
};

const create = async ({ username, passwordHash }) => {
  const [result] = await pool.query(
    'INSERT INTO users (username, password_hash) VALUES (?, ?)',
    [username, passwordHash]
  );
  return result.insertId;
};

module.exports = { findByUsername, create };
