const pool = require('../config/database');
const usersRepository = require('../repositories/usersRepository');

const getStats = async (userId) => {
  const [[{ books }]] = await pool.query(
    'SELECT COUNT(*) AS books FROM books WHERE user_id = ?',
    [userId]
  );
  const [[{ shelves }]] = await pool.query(
    'SELECT COUNT(*) AS shelves FROM shelves WHERE user_id = ?',
    [userId]
  );
  const [[{ buddies }]] = await pool.query(
    `SELECT COUNT(*) AS buddies FROM friendships
     WHERE (requester_id = ? OR receiver_id = ?) AND status = 'accepted'`,
    [userId, userId]
  );
  const [[user]] = await pool.query(
    'SELECT username, created_at FROM users WHERE id = ?',
    [userId]
  );
  return { username: user.username, createdAt: user.created_at, books, shelves, buddies };
};

const deleteAccount = async (userId) => {
  await pool.query('DELETE FROM users WHERE id = ?', [userId]);
};

module.exports = { getStats, deleteAccount };
