const shelvesService = require('../services/shelvesService');

const list = async (req, res, next) => {
  try {
    res.json(await shelvesService.listShelves(req.user.id));
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const shelf = await shelvesService.createShelf(req.user.id, req.body.name);
    res.status(201).json(shelf);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    await shelvesService.updateShelf(req.user.id, parseInt(req.params.id, 10), req.body);
    res.status(204).send();
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    await shelvesService.deleteShelf(req.user.id, parseInt(req.params.id, 10));
    res.status(204).send();
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
};

const listBooks = async (req, res, next) => {
  try {
    const books = await shelvesService.getShelfBooks(
      req.user.id, parseInt(req.params.id, 10),
      req.query.sort, req.query.dir
    );
    res.json(books);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
};

const addBook = async (req, res, next) => {
  try {
    await shelvesService.addBookToShelf(
      req.user.id,
      parseInt(req.params.id, 10),
      parseInt(req.body.bookId, 10)
    );
    res.status(201).send();
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
};

const removeBook = async (req, res, next) => {
  try {
    await shelvesService.removeBookFromShelf(
      req.user.id,
      parseInt(req.params.id, 10),
      parseInt(req.params.bookId, 10)
    );
    res.status(204).send();
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
};

module.exports = { list, create, update, remove, listBooks, addBook, removeBook };
