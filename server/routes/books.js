const express = require('express');
const router = express.Router();
const booksController = require('../controllers/booksController');

router.get('/search', booksController.search);

module.exports = router;
