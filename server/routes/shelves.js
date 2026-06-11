const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const ctrl = require('../controllers/shelvesController');

router.get('/', authenticate, ctrl.list);
router.post('/', authenticate, ctrl.create);
router.patch('/:id', authenticate, ctrl.update);
router.delete('/:id', authenticate, ctrl.remove);
router.get('/:id/books', authenticate, ctrl.listBooks);
router.post('/:id/books', authenticate, ctrl.addBook);
router.delete('/:id/books/:bookId', authenticate, ctrl.removeBook);

module.exports = router;
