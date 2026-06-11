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

const findPublicByUsername = async (username) => {
  const [rows] = await pool.query(
    'SELECT id, username FROM users WHERE username = ?',
    [username]
  );
  return rows[0] || null;
};

const searchByUsername = async (query, currentUserId) => {
  const [rows] = await pool.query(
    `SELECT
       u.id, u.username,
       f.id AS friendship_id,
       f.status AS friendship_status,
       CASE WHEN f.requester_id = ? THEN 'sent'
            WHEN f.receiver_id   = ? THEN 'received'
            ELSE NULL END AS direction
     FROM users u
     LEFT JOIN friendships f ON
       (f.requester_id = ? AND f.receiver_id = u.id) OR
       (f.receiver_id  = ? AND f.requester_id = u.id)
     WHERE u.username LIKE ? AND u.id != ?
     LIMIT 20`,
    [currentUserId, currentUserId, currentUserId, currentUserId, `%${query}%`, currentUserId]
  );
  return rows;
};

module.exports = { findByUsername, findPublicByUsername, searchByUsername, create };
