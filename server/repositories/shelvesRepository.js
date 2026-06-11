const pool = require('../config/database');

const findByUser = async (userId) => {
  const [rows] = await pool.query(
    `SELECT s.*, COUNT(bs.book_id) AS book_count
     FROM shelves s
     LEFT JOIN book_shelves bs ON bs.shelf_id = s.id
     WHERE s.user_id = ?
     GROUP BY s.id
     ORDER BY s.is_default DESC, s.created_at ASC`,
    [userId]
  );
  return rows;
};

const findById = async (id) => {
  const [rows] = await pool.query('SELECT * FROM shelves WHERE id = ?', [id]);
  return rows[0] || null;
};

const findDefault = async (userId) => {
  const [rows] = await pool.query(
    'SELECT * FROM shelves WHERE user_id = ? AND is_default = TRUE',
    [userId]
  );
  return rows[0] || null;
};

const findPublicByUser = async (userId) => {
  const [rows] = await pool.query(
    `SELECT s.*, COUNT(bs.book_id) AS book_count
     FROM shelves s
     LEFT JOIN book_shelves bs ON bs.shelf_id = s.id
     WHERE s.user_id = ? AND s.is_public = TRUE
     GROUP BY s.id
     ORDER BY s.is_default DESC, s.created_at ASC`,
    [userId]
  );
  return rows;
};

const create = async (userId, name) => {
  const [result] = await pool.query(
    'INSERT INTO shelves (user_id, name, is_public, is_default) VALUES (?, ?, FALSE, FALSE)',
    [userId, name]
  );
  return result.insertId;
};

const createDefault = async (userId) => {
  const [result] = await pool.query(
    'INSERT INTO shelves (user_id, name, is_public, is_default) VALUES (?, "Main Shelf", TRUE, TRUE)',
    [userId]
  );
  return result.insertId;
};

const update = async (id, updates) => {
  const fields = [];
  const values = [];
  if (updates.name !== undefined) { fields.push('name = ?'); values.push(updates.name); }
  if (updates.isPublic !== undefined) { fields.push('is_public = ?'); values.push(updates.isPublic ? 1 : 0); }
  if (!fields.length) return false;
  values.push(id);
  const [result] = await pool.query(`UPDATE shelves SET ${fields.join(', ')} WHERE id = ?`, values);
  return result.affectedRows > 0;
};

const remove = async (id) => {
  const [result] = await pool.query(
    'DELETE FROM shelves WHERE id = ? AND is_default = FALSE',
    [id]
  );
  return result.affectedRows > 0;
};

const findShelfBooks = async (shelfId, sortBy = 'date', sortDir = 'desc') => {
  const col = sortBy === 'title' ? 'b.title' : 'bs.added_at';
  const dir = sortDir === 'asc' ? 'ASC' : 'DESC';
  const [rows] = await pool.query(
    `SELECT b.*, bs.added_at AS shelf_added_at
     FROM books b
     JOIN book_shelves bs ON bs.book_id = b.id
     WHERE bs.shelf_id = ?
     ORDER BY ${col} ${dir}`,
    [shelfId]
  );
  return rows;
};

const addBook = async (bookId, shelfId) => {
  const [result] = await pool.query(
    'INSERT IGNORE INTO book_shelves (book_id, shelf_id) VALUES (?, ?)',
    [bookId, shelfId]
  );
  return result.affectedRows > 0;
};

const removeBook = async (bookId, shelfId) => {
  const [result] = await pool.query(
    'DELETE FROM book_shelves WHERE book_id = ? AND shelf_id = ?',
    [bookId, shelfId]
  );
  return result.affectedRows > 0;
};

const countBookShelves = async (bookId) => {
  const [rows] = await pool.query(
    'SELECT COUNT(*) AS n FROM book_shelves WHERE book_id = ?',
    [bookId]
  );
  return rows[0].n;
};

module.exports = {
  findByUser, findById, findDefault, findPublicByUser,
  create, createDefault, update, remove,
  findShelfBooks, addBook, removeBook, countBookShelves,
};
