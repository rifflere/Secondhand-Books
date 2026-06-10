const openLibraryService = require('../services/openLibraryService');
const shelfService = require('../services/shelfService');

const popular = async (req, res, next) => {
  try {
    const books = await shelfService.getPopular();
    res.json(books);
  } catch (err) {
    next(err);
  }
};

const search = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || !q.trim()) {
      return res.status(400).json({ error: 'Search query is required' });
    }
    const results = await openLibraryService.searchBooks(q.trim());
    res.json(results);
  } catch (err) {
    next(err);
  }
};

const list = async (req, res, next) => {
  try {
    const books = await shelfService.getShelf(req.user.id, req.query.sort, req.query.dir);
    res.json(books);
  } catch (err) {
    next(err);
  }
};

const save = async (req, res, next) => {
  try {
    const { title, author, year, cover, pages, olKey } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    const book = await shelfService.saveBook(req.user.id, { title, author, year, cover, pages, olKey });
    res.status(201).json(book);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    await shelfService.deleteBook(req.user.id, parseInt(req.params.id, 10));
    res.status(204).send();
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
};

module.exports = { popular, search, list, save, remove };
