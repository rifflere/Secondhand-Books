const pool = require('../config/database');

const findPopular = async (limit = 10) => {
  const [rows] = await pool.query(
    `SELECT
       external_id,
       MAX(title)            AS title,
       MAX(author)           AS author,
       MAX(publication_year) AS publication_year,
       MAX(cover_url)        AS cover_url,
       MAX(pages)            AS pages,
       COUNT(*)              AS save_count
     FROM books
     WHERE external_id IS NOT NULL
     GROUP BY external_id
     ORDER BY save_count DESC
     LIMIT ?`,
    [limit]
  );
  return rows;
};

const findAll = async (userId, sortBy = 'date', sortDir = 'desc') => {
  const col = sortBy === 'title' ? 'title' : 'created_at';
  const dir = sortDir === 'asc' ? 'ASC' : 'DESC';
  const [rows] = await pool.query(
    `SELECT * FROM books WHERE user_id = ? ORDER BY ${col} ${dir}`,
    [userId]
  );
  return rows;
};

const findByExternalId = async (userId, externalId) => {
  const [rows] = await pool.query(
    'SELECT * FROM books WHERE user_id = ? AND external_id = ?',
    [userId, externalId]
  );
  return rows[0] || null;
};

const create = async ({ userId, externalId, title, author, year, coverUrl, pages }) => {
  const [result] = await pool.query(
    `INSERT INTO books (user_id, external_id, title, author, publication_year, cover_url, pages)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [userId, externalId || null, title, author || null, year || null, coverUrl || null, pages || null]
  );
  return result.insertId;
};

const remove = async (userId, id) => {
  const [result] = await pool.query(
    'DELETE FROM books WHERE id = ? AND user_id = ?',
    [id, userId]
  );
  return result.affectedRows > 0;
};

module.exports = { findPopular, findAll, findByExternalId, create, remove };
