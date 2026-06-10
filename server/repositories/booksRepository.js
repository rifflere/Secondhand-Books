const pool = require('../config/database');

const SORT_OPTIONS = {
  title: 'title ASC',
  date: 'created_at DESC',
};

const findAll = async (sortBy = 'date') => {
  const order = SORT_OPTIONS[sortBy] || SORT_OPTIONS.date;
  const [rows] = await pool.query(`SELECT * FROM books ORDER BY ${order}`);
  return rows;
};

const findByExternalId = async (externalId) => {
  const [rows] = await pool.query('SELECT * FROM books WHERE external_id = ?', [externalId]);
  return rows[0] || null;
};

const create = async ({ externalId, title, author, year, coverUrl, pages }) => {
  const [result] = await pool.query(
    `INSERT INTO books (external_id, title, author, publication_year, cover_url, pages)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [externalId || null, title, author || null, year || null, coverUrl || null, pages || null]
  );
  return result.insertId;
};

const remove = async (id) => {
  const [result] = await pool.query('DELETE FROM books WHERE id = ?', [id]);
  return result.affectedRows > 0;
};

module.exports = { findAll, findByExternalId, create, remove };
