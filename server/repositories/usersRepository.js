const pool = require('../config/database');

const findByUsername = async (username) => {
  const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
  return rows[0] || null;
};

const create = async ({ username, passwordHash, email }) => {
  const [result] = await pool.query(
    'INSERT INTO users (username, password_hash, email) VALUES (?, ?, ?)',
    [username, passwordHash, email || null]
  );
  return result.insertId;
};

const findByEmail = async (email) => {
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0] || null;
};

const findAll = async () => {
  const [rows] = await pool.query(
    `SELECT u.id, u.username, u.created_at, u.is_admin,
       (SELECT COUNT(*) FROM books   b WHERE b.user_id = u.id) AS book_count,
       (SELECT COUNT(*) FROM shelves s WHERE s.user_id = u.id) AS shelf_count
     FROM users u
     ORDER BY u.created_at ASC`
  );
  return rows;
};

const setAdmin = async (userId, isAdmin) => {
  await pool.query('UPDATE users SET is_admin = ? WHERE id = ?', [isAdmin ? 1 : 0, userId]);
};

const updatePassword = async (userId, passwordHash) => {
  await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [passwordHash, userId]);
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

module.exports = { findByUsername, findPublicByUsername, searchByUsername, create, findByEmail, updatePassword, findAll, setAdmin };
