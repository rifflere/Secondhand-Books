const express = require('express');
const router = express.Router();
const booksController = require('../controllers/booksController');
const authenticate = require('../middleware/authenticate');

router.get('/popular', booksController.popular);
router.get('/search', booksController.search);
router.get('/', authenticate, booksController.list);
router.post('/', authenticate, booksController.save);
router.delete('/:id', authenticate, booksController.remove);

module.exports = router;
