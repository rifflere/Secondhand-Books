const shelvesRepo = require('../repositories/shelvesRepository');
const booksRepo = require('../repositories/booksRepository');

const listShelves = async (userId) => {
  const rows = await shelvesRepo.findByUser(userId);
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    isPublic: !!r.is_public,
    isDefault: !!r.is_default,
    bookCount: Number(r.book_count),
    createdAt: r.created_at,
  }));
};

const createShelf = async (userId, name) => {
  if (!name || !name.trim()) {
    throw Object.assign(new Error('Shelf name is required'), { status: 400 });
  }
  const id = await shelvesRepo.create(userId, name.trim());
  return { id, name: name.trim(), isPublic: false, isDefault: false, bookCount: 0 };
};

const updateShelf = async (userId, shelfId, updates) => {
  const shelf = await shelvesRepo.findById(shelfId);
  if (!shelf || shelf.user_id !== userId) {
    throw Object.assign(new Error('Shelf not found'), { status: 404 });
  }
  await shelvesRepo.update(shelfId, {
    name: updates.name,
    isPublic: updates.isPublic,
  });
};

const deleteShelf = async (userId, shelfId) => {
  const shelf = await shelvesRepo.findById(shelfId);
  if (!shelf || shelf.user_id !== userId) {
    throw Object.assign(new Error('Shelf not found'), { status: 404 });
  }
  if (shelf.is_default) {
    throw Object.assign(new Error('Cannot delete your main shelf'), { status: 403 });
  }
  await shelvesRepo.remove(shelfId);
  // book_shelves cascade-deletes; clean up any orphan books for this user
  await booksRepo.deleteOrphans(userId);
};

const getShelfBooks = async (userId, shelfId, sortBy, sortDir) => {
  const shelf = await shelvesRepo.findById(shelfId);
  if (!shelf || shelf.user_id !== userId) {
    throw Object.assign(new Error('Shelf not found'), { status: 404 });
  }
  const rows = await shelvesRepo.findShelfBooks(shelfId, sortBy, sortDir);
  return rows.map((r) => ({
    id: r.id,
    olKey: r.external_id,
    title: r.title,
    author: r.author,
    year: r.publication_year,
    cover: r.cover_url,
    pages: r.pages,
    addedAt: r.shelf_added_at,
  }));
};

const addBookToShelf = async (userId, shelfId, bookId) => {
  const shelf = await shelvesRepo.findById(shelfId);
  if (!shelf || shelf.user_id !== userId) {
    throw Object.assign(new Error('Shelf not found'), { status: 404 });
  }
  const book = await booksRepo.findById(userId, bookId);
  if (!book) throw Object.assign(new Error('Book not found'), { status: 404 });
  const added = await shelvesRepo.addBook(bookId, shelfId);
  if (!added) throw Object.assign(new Error('Book already on this shelf'), { status: 409 });
};

const removeBookFromShelf = async (userId, shelfId, bookId) => {
  const shelf = await shelvesRepo.findById(shelfId);
  if (!shelf || shelf.user_id !== userId) {
    throw Object.assign(new Error('Shelf not found'), { status: 404 });
  }
  const removed = await shelvesRepo.removeBook(bookId, shelfId);
  if (!removed) throw Object.assign(new Error('Book not on this shelf'), { status: 404 });
  // Delete the book record if it has no remaining shelf memberships
  const remaining = await shelvesRepo.countBookShelves(bookId);
  if (remaining === 0) {
    await booksRepo.remove(userId, bookId);
  }
};

const getPublicShelves = async (targetUserId) => {
  const rows = await shelvesRepo.findPublicByUser(targetUserId);
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    isPublic: !!r.is_public,
    isDefault: !!r.is_default,
    bookCount: Number(r.book_count),
  }));
};

const getPublicShelfBooks = async (targetUserId, shelfId, sortBy, sortDir) => {
  const shelf = await shelvesRepo.findById(shelfId);
  if (!shelf || shelf.user_id !== targetUserId) {
    throw Object.assign(new Error('Shelf not found'), { status: 404 });
  }
  if (!shelf.is_default && !shelf.is_public) {
    throw Object.assign(new Error('This shelf is private'), { status: 403 });
  }
  const rows = await shelvesRepo.findShelfBooks(shelfId, sortBy, sortDir);
  return rows.map((r) => ({
    id: r.id,
    olKey: r.external_id,
    title: r.title,
    author: r.author,
    year: r.publication_year,
    cover: r.cover_url,
    pages: r.pages,
    addedAt: r.shelf_added_at,
  }));
};

module.exports = {
  listShelves, createShelf, updateShelf, deleteShelf,
  getShelfBooks, addBookToShelf, removeBookFromShelf,
  getPublicShelves, getPublicShelfBooks,
};
