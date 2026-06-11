const pool = require('../config/database');
const usersRepository = require('../repositories/usersRepository');

const getAllUsers = async () => usersRepository.findAll();

const getAllPublicShelves = async () => {
  const [rows] = await pool.query(
    `SELECT s.id, s.name, s.is_default, s.created_at,
            u.username AS owner_username,
            COUNT(bs.book_id) AS book_count
     FROM shelves s
     JOIN users u ON u.id = s.user_id
     LEFT JOIN book_shelves bs ON bs.shelf_id = s.id
     WHERE s.is_public = TRUE
     GROUP BY s.id, u.username
     ORDER BY u.username ASC, s.is_default DESC, s.created_at ASC`
  );
  return rows;
};

const grantAdmin = async (targetUserId, isAdmin) => {
  await usersRepository.setAdmin(targetUserId, isAdmin);
};

const deleteUser = async (adminUserId, targetUserId) => {
  if (adminUserId === targetUserId) {
    const err = new Error('You cannot delete your own account from the admin panel');
    err.status = 400;
    throw err;
  }
  await pool.query('DELETE FROM users WHERE id = ?', [targetUserId]);
};

module.exports = { getAllUsers, getAllPublicShelves, grantAdmin, deleteUser };
