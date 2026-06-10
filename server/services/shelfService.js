const booksRepository = require('../repositories/booksRepository');

const getShelf = async (sortBy) => {
  const rows = await booksRepository.findAll(sortBy);
  return rows.map((row) => ({
    id: row.id,
    olKey: row.external_id,
    title: row.title,
    author: row.author,
    year: row.publication_year,
    cover: row.cover_url,
    pages: row.pages,
    addedAt: row.created_at,
  }));
};

const saveBook = async (book) => {
  if (book.olKey) {
    const existing = await booksRepository.findByExternalId(book.olKey);
    if (existing) {
      const err = new Error('Book already on shelf');
      err.status = 409;
      throw err;
    }
  }

  const id = await booksRepository.create({
    externalId: book.olKey || null,
    title: book.title,
    author: book.author,
    year: book.year,
    coverUrl: book.cover,
    pages: book.pages,
  });

  return { id, ...book };
};

const deleteBook = async (id) => {
  const deleted = await booksRepository.remove(id);
  if (!deleted) {
    const err = new Error('Book not found');
    err.status = 404;
    throw err;
  }
};

module.exports = { getShelf, saveBook, deleteBook };
