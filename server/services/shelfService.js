const booksRepository = require('../repositories/booksRepository');
const shelvesRepository = require('../repositories/shelvesRepository');

const getPopular = async () => {
  const rows = await booksRepository.findPopular(10);
  return rows.map((row) => ({
    olKey: row.external_id,
    title: row.title,
    author: row.author,
    year: row.publication_year,
    cover: row.cover_url,
    pages: row.pages,
    saveCount: row.save_count,
  }));
};

const getShelf = async (userId, sortBy, sortDir) => {
  const rows = await booksRepository.findAll(userId, sortBy, sortDir);
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

const saveBook = async (userId, book) => {
  if (book.olKey) {
    const existing = await booksRepository.findByExternalId(userId, book.olKey);
    if (existing) {
      const err = new Error('Book already on shelf');
      err.status = 409;
      throw err;
    }
  }

  const id = await booksRepository.create({
    userId,
    externalId: book.olKey || null,
    title: book.title,
    author: book.author,
    year: book.year,
    coverUrl: book.cover,
    pages: book.pages,
  });

  // Add to Main Shelf automatically
  const mainShelf = await shelvesRepository.findDefault(userId);
  if (mainShelf) {
    await shelvesRepository.addBook(id, mainShelf.id);
  }

  return { id, ...book };
};

const deleteBook = async (userId, id) => {
  const deleted = await booksRepository.remove(userId, id);
  if (!deleted) {
    const err = new Error('Book not found');
    err.status = 404;
    throw err;
  }
};

module.exports = { getPopular, getShelf, saveBook, deleteBook };
