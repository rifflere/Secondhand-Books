const pool = require('../config/database');

const findRequest = async (requesterId, receiverId) => {
  const [rows] = await pool.query(
    'SELECT * FROM friendships WHERE requester_id = ? AND receiver_id = ?',
    [requesterId, receiverId]
  );
  return rows[0] || null;
};

const findById = async (id) => {
  const [rows] = await pool.query('SELECT * FROM friendships WHERE id = ?', [id]);
  return rows[0] || null;
};

const createRequest = async (requesterId, receiverId) => {
  const [result] = await pool.query(
    'INSERT INTO friendships (requester_id, receiver_id, status) VALUES (?, ?, "pending")',
    [requesterId, receiverId]
  );
  return result.insertId;
};

const updateRequest = async (id, status) => {
  const [result] = await pool.query(
    'UPDATE friendships SET status = ? WHERE id = ?',
    [status, id]
  );
  return result.affectedRows > 0;
};

const findAccepted = async (userId) => {
  const [rows] = await pool.query(
    `SELECT u.id, u.username, f.id AS friendship_id, f.created_at AS friends_since
     FROM friendships f
     JOIN users u ON u.id = CASE
       WHEN f.requester_id = ? THEN f.receiver_id
       ELSE f.requester_id
     END
     WHERE (f.requester_id = ? OR f.receiver_id = ?) AND f.status = 'accepted'
     ORDER BY f.created_at DESC`,
    [userId, userId, userId]
  );
  return rows;
};

const findIncoming = async (userId) => {
  const [rows] = await pool.query(
    `SELECT f.id, f.created_at, u.username AS from_username, u.id AS from_user_id
     FROM friendships f
     JOIN users u ON u.id = f.requester_id
     WHERE f.receiver_id = ? AND f.status = 'pending'
     ORDER BY f.created_at DESC`,
    [userId]
  );
  return rows;
};

const findOutgoing = async (userId) => {
  const [rows] = await pool.query(
    `SELECT f.id, f.created_at, u.username AS to_username
     FROM friendships f
     JOIN users u ON u.id = f.receiver_id
     WHERE f.requester_id = ? AND f.status = 'pending'
     ORDER BY f.created_at DESC`,
    [userId]
  );
  return rows;
};

const remove = async (id, userId) => {
  const [result] = await pool.query(
    'DELETE FROM friendships WHERE id = ? AND (requester_id = ? OR receiver_id = ?)',
    [id, userId, userId]
  );
  return result.affectedRows > 0;
};

const areBuddies = async (userId1, userId2) => {
  const [rows] = await pool.query(
    `SELECT 1 FROM friendships
     WHERE status = 'accepted'
     AND ((requester_id = ? AND receiver_id = ?) OR (requester_id = ? AND receiver_id = ?))`,
    [userId1, userId2, userId2, userId1]
  );
  return rows.length > 0;
};

const findFeed = async (userId, limit = 20) => {
  const [rows] = await pool.query(
    `SELECT b.id, b.title, b.author, b.cover_url, b.external_id,
            s.id AS shelf_id, s.name AS shelf_name,
            u.id AS user_id, u.username,
            bs.added_at AS activity_at
     FROM book_shelves bs
     JOIN books b ON b.id = bs.book_id
     JOIN shelves s ON s.id = bs.shelf_id
     JOIN users u ON u.id = s.user_id
     WHERE s.user_id IN (
       SELECT CASE WHEN requester_id = ? THEN receiver_id ELSE requester_id END
       FROM friendships
       WHERE (requester_id = ? OR receiver_id = ?) AND status = 'accepted'
     )
     AND (s.is_default = TRUE OR s.is_public = TRUE)
     ORDER BY bs.added_at DESC
     LIMIT ?`,
    [userId, userId, userId, limit]
  );
  return rows;
};

module.exports = {
  findRequest, findById, createRequest, updateRequest,
  findAccepted, findIncoming, findOutgoing,
  remove, areBuddies, findFeed,
};
