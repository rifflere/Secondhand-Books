const express = require('express');
const router = express.Router();
const booksController = require('../controllers/booksController');

router.get('/search', booksController.search);
router.get('/', booksController.list);
router.post('/', booksController.save);
router.delete('/:id', booksController.remove);

module.exports = router;
